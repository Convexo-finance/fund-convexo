import React, { useState, useEffect, useCallback } from 'react';
import { 
  TransactionType, 
  SupportedAsset, 
  FundingFormData, 
  FundingFormErrors, 
  FundingQuote,
  ExchangeRate 
} from '../../types/funding';
import { rateService } from '../../services/rateService';
import Button from '../wallet/shared/Button';
import Loading from '../wallet/shared/Loading';

interface FundingFormProps {
  onSubmit: (quote: FundingQuote) => void;
  onCancel?: () => void;
}

const FundingForm: React.FC<FundingFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<FundingFormData>({
    type: 'cashin',
    cantidad: '',
    assetBuy: 'USDC',
    assetSell: 'COP',
    walletAddress: '',
    acceptTerms: false
  });

  const [errors, setErrors] = useState<FundingFormErrors>({});
  const [quote, setQuote] = useState<FundingQuote | null>(null);
  const [exchangeRate, setExchangeRate] = useState<ExchangeRate | null>(null);
  const [isLoadingRate, setIsLoadingRate] = useState(false);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [lastRateUpdate, setLastRateUpdate] = useState<number>(0);

  // Update assets based on transaction type
  useEffect(() => {
    if (formData.type === 'cashin') {
      // Cash in: Buy USDC with COP
      setFormData(prev => ({
        ...prev,
        assetBuy: 'USDC',
        assetSell: 'COP'
      }));
    } else {
      // Cash out: Sell USDC for COP
      setFormData(prev => ({
        ...prev,
        assetBuy: 'COP',
        assetSell: 'USDC'
      }));
    }
  }, [formData.type]);

  // Fetch exchange rate when assets change
  const fetchExchangeRate = useCallback(async () => {
    if (!formData.assetBuy || !formData.assetSell) return;

    setIsLoadingRate(true);
    try {
      const rateResponse = await rateService.getExchangeRate(formData.assetSell, formData.assetBuy);
      
      if (rateResponse.success && rateResponse.rate) {
        const rate: ExchangeRate = {
          rate: rateResponse.rate,
          timestamp: rateResponse.timestamp,
          source: rateResponse.source
        };
        
        setExchangeRate(rate);
        setLastRateUpdate(Date.now());
      }
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
    } finally {
      setIsLoadingRate(false);
    }
  }, [formData.assetBuy, formData.assetSell]);

  useEffect(() => {
    fetchExchangeRate();
  }, [fetchExchangeRate]);

  // Auto-refresh rate every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (Date.now() - lastRateUpdate > 30000) {
        fetchExchangeRate();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchExchangeRate, lastRateUpdate]);

  const handleInputChange = (field: keyof FundingFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Clear quote when amount changes
    if (field === 'cantidad') {
      setQuote(null);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FundingFormErrors = {};

    // Amount validation
    if (!formData.cantidad.trim()) {
      newErrors.cantidad = 'La cantidad es requerida';
    } else {
      const amount = parseFloat(formData.cantidad);
      if (isNaN(amount) || amount <= 0) {
        newErrors.cantidad = 'La cantidad debe ser un número mayor a 0';
      } else if (amount < 10000 && formData.assetSell === 'COP') {
        newErrors.cantidad = 'Cantidad mínima: $10,000 COP';
      } else if (amount < 5 && formData.assetSell === 'USDC') {
        newErrors.cantidad = 'Cantidad mínima: 5 USDC';
      } else if (amount > 10000000 && formData.assetSell === 'COP') {
        newErrors.cantidad = 'Cantidad máxima: $10,000,000 COP';
      } else if (amount > 50000 && formData.assetSell === 'USDC') {
        newErrors.cantidad = 'Cantidad máxima: 50,000 USDC';
      }
    }

    // Wallet address validation for cashout
    if (formData.type === 'cashout' && !formData.walletAddress?.trim()) {
      newErrors.walletAddress = 'Dirección de wallet es requerida para cash out';
    } else if (formData.walletAddress && !isValidEthAddress(formData.walletAddress)) {
      newErrors.walletAddress = 'Dirección de wallet inválida';
    }

    // Terms acceptance
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'Debe aceptar los términos y condiciones';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidEthAddress = (address: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const generateQuote = async () => {
    if (!validateForm() || !exchangeRate) return;

    setIsLoadingQuote(true);
    setErrors({});

    try {
      const amount = parseFloat(formData.cantidad);
      const conversion = rateService.calculateConversion(amount, exchangeRate.rate, formData.type);

      const newQuote: FundingQuote = {
        type: formData.type,
        cantidad: amount,
        assetBuy: formData.assetBuy,
        assetSell: formData.assetSell,
        rate: exchangeRate.rate,
        adjustedRate: conversion.adjustedRate,
        totalReceived: conversion.totalReceived,
        totalSent: amount,
        fee: conversion.fee,
        feePercentage: conversion.feePercentage,
        validUntil: Date.now() + 300000, // 5 minutes
        margin: formData.type === 'cashout' ? -2 : 0
      };

      setQuote(newQuote);
    } catch (error) {
      setErrors({ general: 'Error generando cotización. Intente nuevamente.' });
    } finally {
      setIsLoadingQuote(false);
    }
  };

  const handleSubmit = () => {
    if (quote && validateForm()) {
      onSubmit(quote);
    }
  };

  const formatAssetAmount = (amount: number, asset: SupportedAsset) => {
    return rateService.formatCurrency(amount, asset);
  };

  const getRateDisplay = () => {
    if (!exchangeRate) return 'Cargando...';
    
    const adjustedRate = rateService.applyMargin(exchangeRate.rate, formData.type);
    const sellAsset = rateService.getAssetInfo(formData.assetSell);
    const buyAsset = rateService.getAssetInfo(formData.assetBuy);
    
    return `1 ${sellAsset?.icon} ${formData.assetSell} = ${formatAssetAmount(adjustedRate, formData.assetBuy)}`;
  };

  const getTransactionTypeColor = (type: TransactionType) => {
    return type === 'cashin' 
      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
      : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200';
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          💰 Módulo de Funding
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Intercambia entre USDC y COP con tasas en tiempo real
        </p>
      </div>

      <form className="space-y-6">
        {/* Transaction Type */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Tipo de Operación
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleInputChange('type', 'cashin')}
              className={`
                p-4 border-2 rounded-lg text-left transition-all
                ${formData.type === 'cashin'
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-green-300'
                }
              `}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">💸</span>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Cash In</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Comprar USDC con COP
                  </p>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleInputChange('type', 'cashout')}
              className={`
                p-4 border-2 rounded-lg text-left transition-all
                ${formData.type === 'cashout'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
                }
              `}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">💰</span>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Cash Out</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Vender USDC por COP
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Exchange Rate Display */}
        <div className={`rounded-lg p-4 border-2 ${getTransactionTypeColor(formData.type)}`}>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium mb-1">Tasa de Cambio Actual</h4>
              <p className="text-lg font-semibold">
                {isLoadingRate ? <Loading size="small" text="" /> : getRateDisplay()}
              </p>
            </div>
            <button
              type="button"
              onClick={fetchExchangeRate}
              disabled={isLoadingRate}
              className="p-2 text-sm font-medium hover:bg-white/50 rounded transition-colors"
            >
              🔄 Actualizar
            </button>
          </div>
          
          {formData.type === 'cashout' && (
            <p className="text-xs mt-2 opacity-75">
              * Tasa ajustada con margen de -2% para cash out
            </p>
          )}
          
          {exchangeRate && (
            <p className="text-xs mt-1 opacity-75">
              Última actualización: {new Date(exchangeRate.timestamp).toLocaleTimeString()}
            </p>
          )}
        </div>

        {/* Amount Input */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Cantidad a {formData.type === 'cashin' ? 'Invertir' : 'Retirar'}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cantidad en {rateService.getAssetInfo(formData.assetSell)?.name}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.cantidad}
                  onChange={(e) => handleInputChange('cantidad', e.target.value)}
                  className={`
                    w-full px-4 py-3 pr-16 border rounded-lg text-lg font-semibold
                    focus:ring-2 focus:ring-purple-500 focus:border-transparent
                    ${errors.cantidad ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                  `}
                  placeholder={formData.type === 'cashin' ? '50000' : '100'}
                  min="0"
                  step={formData.assetSell === 'COP' ? '1000' : '0.01'}
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                  {formData.assetSell}
                </span>
              </div>
              {errors.cantidad && (
                <p className="mt-1 text-sm text-red-600">{errors.cantidad}</p>
              )}
              
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.assetSell === 'COP' ? (
                  <>
                    <button type="button" onClick={() => handleInputChange('cantidad', '50000')} className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-600 rounded">$50K</button>
                    <button type="button" onClick={() => handleInputChange('cantidad', '100000')} className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-600 rounded">$100K</button>
                    <button type="button" onClick={() => handleInputChange('cantidad', '500000')} className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-600 rounded">$500K</button>
                    <button type="button" onClick={() => handleInputChange('cantidad', '1000000')} className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-600 rounded">$1M</button>
                  </>
                ) : (
                  <>
                    <button type="button" onClick={() => handleInputChange('cantidad', '10')} className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-600 rounded">10 USDC</button>
                    <button type="button" onClick={() => handleInputChange('cantidad', '50')} className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-600 rounded">50 USDC</button>
                    <button type="button" onClick={() => handleInputChange('cantidad', '100')} className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-600 rounded">100 USDC</button>
                    <button type="button" onClick={() => handleInputChange('cantidad', '500')} className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-600 rounded">500 USDC</button>
                  </>
                )}
              </div>
            </div>

            {/* Wallet Address for Cashout */}
            {formData.type === 'cashout' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Dirección de Wallet USDC
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={formData.walletAddress}
                  onChange={(e) => handleInputChange('walletAddress', e.target.value)}
                  className={`
                    w-full px-4 py-2 border rounded-lg font-mono text-sm
                    focus:ring-2 focus:ring-purple-500 focus:border-transparent
                    ${errors.walletAddress ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                  `}
                  placeholder="0x..."
                />
                {errors.walletAddress && (
                  <p className="mt-1 text-sm text-red-600">{errors.walletAddress}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Dirección Ethereum compatible (ERC-20) para recibir USDC
                </p>
              </div>
            )}
          </div>

          {/* Generate Quote Button */}
          <div className="mt-6">
            <Button
              onClick={generateQuote}
              variant="outline"
              className="w-full"
              disabled={!formData.cantidad || !exchangeRate || isLoadingQuote}
            >
              {isLoadingQuote ? 'Generando Cotización...' : '📊 Generar Cotización'}
            </Button>
          </div>
        </div>

        {/* Quote Display */}
        {quote && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-6 border-2 border-purple-200 dark:border-purple-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              💫 Cotización Generada
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Envías</p>
                <p className="text-xl font-bold text-red-600 dark:text-red-400">
                  {formatAssetAmount(quote.totalSent, quote.assetSell)}
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Recibes</p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                  {formatAssetAmount(quote.totalReceived, quote.assetBuy)}
                </p>
              </div>
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <div className="flex justify-between">
                <span>Tasa de mercado:</span>
                <span>1 {quote.assetSell} = {formatAssetAmount(quote.rate, quote.assetBuy)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tasa aplicada:</span>
                <span>1 {quote.assetSell} = {formatAssetAmount(quote.adjustedRate, quote.assetBuy)}</span>
              </div>
              {quote.fee > 0 && (
                <div className="flex justify-between">
                  <span>Comisión ({quote.feePercentage}%):</span>
                  <span>{formatAssetAmount(quote.fee, quote.assetBuy)}</span>
                </div>
              )}
              <div className="flex justify-between text-xs pt-2 border-t border-gray-200 dark:border-gray-600">
                <span>Válida hasta:</span>
                <span>{new Date(quote.validUntil).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Terms and Conditions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="acceptTerms"
              checked={formData.acceptTerms}
              onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
              className="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <label htmlFor="acceptTerms" className="text-sm text-gray-700 dark:text-gray-300">
              Acepto los términos y condiciones de intercambio, incluyendo las comisiones aplicables y 
              comprendo que las tasas de cambio están sujetas a variaciones del mercado.
              <span className="text-red-500 ml-1">*</span>
            </label>
          </div>
          {errors.acceptTerms && (
            <p className="mt-2 text-sm text-red-600">{errors.acceptTerms}</p>
          )}
        </div>

        {/* Error Display */}
        {errors.general && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-600 dark:text-red-400">{errors.general}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
          {onCancel && (
            <Button
              onClick={onCancel}
              variant="outline"
              className="px-6"
            >
              Cancelar
            </Button>
          )}
          <div className="flex-1"></div>
          <Button
            onClick={handleSubmit}
            variant="primary"
            className="px-8"
            disabled={!quote || !formData.acceptTerms || Date.now() > (quote?.validUntil || 0)}
          >
            {formData.type === 'cashin' ? '💸 Confirmar Cash In' : '💰 Confirmar Cash Out'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default FundingForm;

import React, { useState } from 'react';
import { FundingQuote, FundingTransaction } from '../../types/funding';
import FundingForm from './FundingForm';
import Button from '../wallet/shared/Button';

const FundingPage: React.FC = () => {
  const [currentQuote, setCurrentQuote] = useState<FundingQuote | null>(null);
  const [transaction, setTransaction] = useState<FundingTransaction | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleQuoteSubmit = async (quote: FundingQuote) => {
    setCurrentQuote(quote);
    setIsProcessing(true);

    try {
      // Simulate transaction processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newTransaction: FundingTransaction = {
        id: `tx_${Date.now()}`,
        type: quote.type,
        cantidad: quote.cantidad,
        assetBuy: quote.assetBuy,
        assetSell: quote.assetSell,
        rate: quote.rate,
        adjustedRate: quote.adjustedRate,
        totalReceived: quote.totalReceived,
        totalSent: quote.totalSent,
        fee: quote.fee,
        feePercentage: quote.feePercentage,
        status: 'completed',
        timestamp: Date.now(),
        notes: `${quote.type} transaction via Convexo`
      };

      setTransaction(newTransaction);
      
      // Clear quote after successful transaction
      setTimeout(() => {
        setCurrentQuote(null);
      }, 1000);

    } catch (error) {
      console.error('Transaction error:', error);
      // Handle error state
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNewTransaction = () => {
    setTransaction(null);
    setCurrentQuote(null);
  };

  const formatCurrency = (amount: number, asset: string) => {
    if (asset === 'COP') {
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
      }).format(amount);
    }
    
    if (asset === 'USDC') {
      return `${amount.toFixed(2)} USDC`;
    }

    return `${amount.toFixed(2)} ${asset}`;
  };

  if (isProcessing) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-md text-center">
          <div className="animate-spin w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Procesando Transacción...
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Por favor espere mientras procesamos su {currentQuote?.type === 'cashin' ? 'cash in' : 'cash out'}
          </p>
          
          {currentQuote && (
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <div className="flex justify-between">
                  <span>Enviando:</span>
                  <span className="font-medium">{formatCurrency(currentQuote.totalSent, currentQuote.assetSell)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Recibiendo:</span>
                  <span className="font-medium">{formatCurrency(currentQuote.totalReceived, currentQuote.assetBuy)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (transaction) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-md text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            ¡Transacción Exitosa!
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Tu {transaction.type === 'cashin' ? 'cash in' : 'cash out'} ha sido procesado correctamente
          </p>

          {/* Transaction Details */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6 text-left">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Detalles de la Transacción</h4>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">ID de Transacción:</span>
                <span className="font-mono text-xs">{transaction.id}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Tipo:</span>
                <span className="font-medium capitalize">
                  {transaction.type === 'cashin' ? 'Cash In' : 'Cash Out'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Enviado:</span>
                <span className="font-medium text-red-600 dark:text-red-400">
                  {formatCurrency(transaction.totalSent, transaction.assetSell)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Recibido:</span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  {formatCurrency(transaction.totalReceived, transaction.assetBuy)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Tasa Aplicada:</span>
                <span>1 {transaction.assetSell} = {formatCurrency(transaction.adjustedRate, transaction.assetBuy)}</span>
              </div>
              
              {transaction.fee > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Comisión:</span>
                  <span>{formatCurrency(transaction.fee, transaction.assetBuy)}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Estado:</span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                  ✅ Completado
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Fecha:</span>
                <span>{new Date(transaction.timestamp).toLocaleString('es-ES')}</span>
              </div>
            </div>
          </div>

          {/* Important Notes */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="text-left">
                <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                  Información Importante
                </h5>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  {transaction.type === 'cashin' ? (
                    <>
                      <li>• Los USDC han sido depositados en tu wallet</li>
                      <li>• Guarda este comprobante para tus registros</li>
                      <li>• Los fondos están disponibles inmediatamente</li>
                    </>
                  ) : (
                    <>
                      <li>• Los COP serán transferidos a tu cuenta bancaria</li>
                      <li>• El proceso puede tomar 1-2 días hábiles</li>
                      <li>• Recibirás notificación cuando se complete</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleNewTransaction}
              variant="primary"
              className="flex-1"
            >
              💰 Nueva Transacción
            </Button>
            
            <Button
              onClick={() => window.print()}
              variant="outline"
              className="flex-1"
            >
              🖨️ Imprimir Comprobante
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <FundingForm onSubmit={handleQuoteSubmit} />;
};

export default FundingPage;

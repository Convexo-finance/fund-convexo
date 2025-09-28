import React, { useState } from 'react';
import { PaymentData, Country, AccountCurrency } from '../../types/onboarding';
import FileUpload from './FileUpload';
import Button from '../wallet/shared/Button';

interface PaymentsFormProps {
  data: Partial<PaymentData>;
  onChange: (data: Partial<PaymentData>) => void;
  onNext: () => void;
  onPrevious?: () => void;
  errors?: Record<string, string>;
}

const PaymentsForm: React.FC<PaymentsFormProps> = ({
  data,
  onChange,
  onNext,
  onPrevious,
  errors = {}
}) => {
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleBankingChange = (field: string, value: any) => {
    const updatedData = {
      ...data,
      banking: {
        ...data.banking,
        [field]: value
      }
    };
    onChange(updatedData);
    
    // Clear validation error when user starts typing
    const errorKey = `banking.${field}`;
    if (validationErrors[errorKey]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const handleCryptoChange = (field: string, value: any) => {
    const updatedData = {
      ...data,
      crypto: {
        ...data.crypto,
        [field]: value
      }
    };
    onChange(updatedData);
    
    // Clear validation error when user starts typing
    const errorKey = `crypto.${field}`;
    if (validationErrors[errorKey]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Banking validation
    const requiredBankingFields = [
      'bank_name', 'bank_country', 'account_holder_name', 
      'account_number', 'account_currency'
    ];
    
    requiredBankingFields.forEach(field => {
      if (!data.banking?.[field as keyof typeof data.banking]) {
        newErrors[`banking.${field}`] = 'Este campo es requerido';
      }
    });

    // Account number validation
    if (data.banking?.account_number && data.banking.account_number.length < 8) {
      newErrors['banking.account_number'] = 'Número de cuenta debe tener al menos 8 caracteres';
    }

    // SWIFT/BIC validation
    if (data.banking?.swift_bic && (data.banking.swift_bic.length < 8 || data.banking.swift_bic.length > 11)) {
      newErrors['banking.swift_bic'] = 'Código SWIFT/BIC debe tener entre 8 y 11 caracteres';
    }

    // Crypto validation
    if (!data.crypto?.evm_address) {
      newErrors['crypto.evm_address'] = 'Dirección de wallet EVM es requerida';
    } else {
      // Basic Ethereum address validation
      const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
      if (!ethAddressRegex.test(data.crypto.evm_address)) {
        newErrors['crypto.evm_address'] = 'Dirección de Ethereum inválida';
      }
    }

    setValidationErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext();
    }
  };

  const displayErrors = { ...errors, ...validationErrors };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Información de Pagos
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Datos bancarios y de wallets crypto para recibir inversiones
        </p>
      </div>

      <form className="space-y-8">
        {/* Banking Information */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            🏦 Información Bancaria
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombre del Banco <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={data.banking?.bank_name || ''}
                onChange={(e) => handleBankingChange('bank_name', e.target.value)}
                className={`
                  w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
                  ${displayErrors['banking.bank_name'] ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                `}
                placeholder="Bancolombia S.A."
              />
              {displayErrors['banking.bank_name'] && (
                <p className="mt-1 text-sm text-red-600">{displayErrors['banking.bank_name']}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                País del Banco <span className="text-red-500">*</span>
              </label>
              <select
                value={data.banking?.bank_country || ''}
                onChange={(e) => handleBankingChange('bank_country', e.target.value as Country)}
                className={`
                  w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
                  ${displayErrors['banking.bank_country'] ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                `}
              >
                <option value="">Seleccione...</option>
                <option value="US">Estados Unidos</option>
                <option value="CO">Colombia</option>
                <option value="MX">México</option>
                <option value="BR">Brasil</option>
                <option value="CL">Chile</option>
                <option value="GB">Reino Unido</option>
                <option value="SG">Singapur</option>
                <option value="HK">Hong Kong</option>
                <option value="DE">Alemania</option>
                <option value="FR">Francia</option>
                <option value="ES">España</option>
              </select>
              {displayErrors['banking.bank_country'] && (
                <p className="mt-1 text-sm text-red-600">{displayErrors['banking.bank_country']}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Titular de la Cuenta <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={data.banking?.account_holder_name || ''}
                onChange={(e) => handleBankingChange('account_holder_name', e.target.value)}
                className={`
                  w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
                  ${displayErrors['banking.account_holder_name'] ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                `}
                placeholder="Echosystem Technologies SAS"
              />
              {displayErrors['banking.account_holder_name'] && (
                <p className="mt-1 text-sm text-red-600">{displayErrors['banking.account_holder_name']}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">Debe coincidir exactamente con el nombre de la cuenta</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Número de Cuenta / IBAN <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={data.banking?.account_number || ''}
                onChange={(e) => handleBankingChange('account_number', e.target.value)}
                className={`
                  w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
                  ${displayErrors['banking.account_number'] ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                `}
                placeholder="CO12345678901234567890"
              />
              {displayErrors['banking.account_number'] && (
                <p className="mt-1 text-sm text-red-600">{displayErrors['banking.account_number']}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">Formato IBAN o número de cuenta local</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Número de Ruta / ABA
              </label>
              <input
                type="text"
                value={data.banking?.routing_number || ''}
                onChange={(e) => handleBankingChange('routing_number', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="111000025"
              />
              <p className="mt-1 text-sm text-gray-500">ABA/CLABE/formato local (opcional)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Código SWIFT/BIC
              </label>
              <input
                type="text"
                value={data.banking?.swift_bic || ''}
                onChange={(e) => handleBankingChange('swift_bic', e.target.value)}
                className={`
                  w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
                  ${displayErrors['banking.swift_bic'] ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                `}
                placeholder="COLOCOBMXXX"
              />
              {displayErrors['banking.swift_bic'] && (
                <p className="mt-1 text-sm text-red-600">{displayErrors['banking.swift_bic']}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">8-11 caracteres (opcional para transferencias internacionales)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Moneda de la Cuenta <span className="text-red-500">*</span>
              </label>
              <select
                value={data.banking?.account_currency || ''}
                onChange={(e) => handleBankingChange('account_currency', e.target.value as AccountCurrency)}
                className={`
                  w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
                  ${displayErrors['banking.account_currency'] ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                `}
              >
                <option value="">Seleccione...</option>
                <option value="USD">USD - Dólar Estadounidense</option>
                <option value="EUR">EUR - Euro</option>
                <option value="COP">COP - Peso Colombiano</option>
                <option value="MXN">MXN - Peso Mexicano</option>
                <option value="BRL">BRL - Real Brasileño</option>
                <option value="ARS">ARS - Peso Argentino</option>
              </select>
              {displayErrors['banking.account_currency'] && (
                <p className="mt-1 text-sm text-red-600">{displayErrors['banking.account_currency']}</p>
              )}
            </div>
          </div>

          <div className="mt-6">
            <FileUpload
              label="Carta Bancaria / Cheque Anulado"
              name="bank_letter"
              required={false}
              accept=".pdf,.jpg,.jpeg,.png"
              value={data.banking?.bank_letter}
              onChange={(file) => handleBankingChange('bank_letter', file as File)}
              description="Comprobante de titularidad de la cuenta (opcional)"
            />
          </div>
        </div>

        {/* Crypto Information */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            ₿ Información Crypto
          </h3>
          
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Dirección de Wallet EVM <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={data.crypto?.evm_address || ''}
                onChange={(e) => handleCryptoChange('evm_address', e.target.value)}
                className={`
                  w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono
                  ${displayErrors['crypto.evm_address'] ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                `}
                placeholder="0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
              />
              {displayErrors['crypto.evm_address'] && (
                <p className="mt-1 text-sm text-red-600">{displayErrors['crypto.evm_address']}</p>
              )}
              <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-start space-x-2">
                  <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    <p className="font-medium mb-1">Wallet para recibir inversiones en USDC</p>
                    <p>Esta dirección debe ser compatible con redes EVM (Ethereum, Polygon, Optimism, etc.)</p>
                    <p className="mt-1 font-medium">⚠️ Asegúrate de que tienes control total de esta wallet</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                Importante: Seguridad de Pagos
              </h4>
              <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                <li>• Verifica que todos los datos bancarios sean correctos</li>
                <li>• La dirección crypto debe ser tuya y bajo tu control completo</li>
                <li>• Los fondos serán enviados únicamente a estas direcciones verificadas</li>
                <li>• Cualquier cambio posterior requerirá un nuevo proceso de verificación</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
          {onPrevious && (
            <Button
              onClick={onPrevious}
              variant="outline"
              className="px-6"
            >
              Anterior
            </Button>
          )}
          <div className="flex-1"></div>
          <Button
            onClick={handleNext}
            variant="primary"
            className="px-6"
          >
            Continuar
          </Button>
        </div>
      </form>

      {/* Progress Indicator */}
      <div className="mt-8 bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Paso 5 de 6</span>
          <span className="text-purple-600 dark:text-purple-400 font-medium">
            Información de Pagos
          </span>
        </div>
        <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div className="bg-purple-600 h-2 rounded-full" style={{ width: '83.33%' }}></div>
        </div>
      </div>
    </div>
  );
};

export default PaymentsForm;

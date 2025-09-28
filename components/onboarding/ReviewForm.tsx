import React, { useState, useEffect } from 'react';
import { OnboardingData, CalculatedIndicators } from '../../types/onboarding';
import { FinancialCalculator } from '../../utils/financialCalculations';
import IndicatorsDisplay from './IndicatorsDisplay';
import Button from '../wallet/shared/Button';

interface ReviewFormProps {
  data: Partial<OnboardingData>;
  onNext: () => void;
  onPrevious?: () => void;
  isSubmitting?: boolean;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  data,
  onNext,
  onPrevious,
  isSubmitting = false
}) => {
  const [indicators, setIndicators] = useState<CalculatedIndicators | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'indicators' | 'documents'>('summary');

  useEffect(() => {
    // Calculate indicators if we have the required data
    if (data.financial && data.business_model) {
      try {
        const calculator = new FinancialCalculator(
          data.financial as any,
          data.business_model as any
        );
        const calculatedIndicators = calculator.calculateAll();
        setIndicators(calculatedIndicators);
      } catch (error) {
        console.error('Error calculating indicators:', error);
      }
    }
  }, [data.financial, data.business_model]);

  const isDataComplete = () => {
    return !!(
      data.profile &&
      data.kyb &&
      data.financial &&
      data.business_model &&
      data.payments &&
      data.consent
    );
  };

  const getCompletionPercentage = () => {
    const sections = ['profile', 'kyb', 'financial', 'business_model', 'payments', 'consent'];
    const completed = sections.filter(section => data[section as keyof OnboardingData]).length;
    return Math.round((completed / sections.length) * 100);
  };

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const tabs = [
    { key: 'summary', title: 'Resumen', icon: '📋' },
    { key: 'indicators', title: 'Indicadores', icon: '📊' },
    { key: 'documents', title: 'Documentos', icon: '📄' }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Revisión Final
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Revise toda la información antes de enviar su solicitud
        </p>
      </div>

      {/* Completion Status */}
      <div className="mb-8 bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold">Estado de Completitud</h3>
            <p className="text-purple-100">
              {getCompletionPercentage()}% de la información requerida completada
            </p>
          </div>
          <div className="text-4xl font-bold">
            {isDataComplete() ? '✅' : '⏳'}
          </div>
        </div>
        
        <div className="w-full bg-purple-500/30 rounded-full h-3">
          <div 
            className="bg-white rounded-full h-3 transition-all duration-500"
            style={{ width: `${getCompletionPercentage()}%` }}
          ></div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`
                flex items-center space-x-2 px-4 py-2 border-b-2 font-medium text-sm transition-colors
                ${activeTab === tab.key
                  ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }
              `}
            >
              <span>{tab.icon}</span>
              <span>{tab.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'summary' && (
        <div className="space-y-6">
          {/* Profile Summary */}
          {data.profile && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                👤 Perfil de Usuario
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Administrador:</span>
                  <p className="font-medium">{data.profile.admin_user}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Email:</span>
                  <p className="font-medium">{data.profile.primary_email}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Teléfono:</span>
                  <p className="font-medium">{data.profile.primary_phone}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Logo:</span>
                  <p className="font-medium">{data.profile.brand_logo ? '✅ Cargado' : '❌ Faltante'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Business Summary */}
          {data.business_model && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                🏢 Información Empresarial
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Empleados:</span>
                  <p className="font-medium">{data.business_model.number_employees}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">¿Exporta?:</span>
                  <p className="font-medium">{data.business_model.exporta}</p>
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">Descripción:</span>
                <p className="mt-1 text-sm">{data.business_model.business_description}</p>
              </div>
            </div>
          )}

          {/* Financial Summary */}
          {data.financial && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                💰 Resumen Financiero
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Ingresos Totales:</span>
                  <p className="font-medium text-lg">
                    {formatCurrency(
                      (data.financial.income_statement?.ventas_nacionales || 0) +
                      (data.financial.income_statement?.ventas_exportaciones || 0),
                      data.financial.report_details?.moneda_reporte
                    )}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Utilidad Neta:</span>
                  <p className="font-medium text-lg">
                    {formatCurrency(
                      data.financial.income_statement?.utilidad_neta || 0,
                      data.financial.report_details?.moneda_reporte
                    )}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Efectivo:</span>
                  <p className="font-medium text-lg">
                    {formatCurrency(
                      data.financial.balance_sheet?.efectivo_equivalentes || 0,
                      data.financial.report_details?.moneda_reporte
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Payment Summary */}
          {data.payments && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                💳 Información de Pagos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Banco:</span>
                  <p className="font-medium">{data.payments.banking?.bank_name}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Moneda de Cuenta:</span>
                  <p className="font-medium">{data.payments.banking?.account_currency}</p>
                </div>
                <div className="md:col-span-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Wallet EVM:</span>
                  <p className="font-medium font-mono text-sm break-all">
                    {data.payments.crypto?.evm_address}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Consent Summary */}
          {data.consent && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                ✍️ Consentimientos Legales
              </h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <span>{data.consent.consent_data_processing ? '✅' : '❌'}</span>
                  <span className="text-sm">Procesamiento de Datos</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span>{data.consent.consent_aml_screening ? '✅' : '❌'}</span>
                  <span className="text-sm">Verificaciones AML</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span>{data.consent.agree_terms ? '✅' : '❌'}</span>
                  <span className="text-sm">Términos de Servicio</span>
                </div>
                <div className="mt-3">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Firma Electrónica:</span>
                  <p className="font-medium text-lg" style={{ fontFamily: 'cursive' }}>
                    {data.consent.electronic_signature}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'indicators' && indicators && (
        <IndicatorsDisplay 
          indicators={indicators} 
          currency={data.financial?.report_details?.moneda_reporte || 'USD'}
        />
      )}

      {activeTab === 'indicators' && !indicators && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">
                Indicadores No Disponibles
              </h4>
              <p className="text-yellow-700 dark:text-yellow-300">
                Complete los datos financieros y del modelo de negocio para ver los indicadores calculados.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            📄 Estado de Documentos
          </h3>
          
          <div className="space-y-4">
            {data.kyb?.documents && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Documentos KYB</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(data.kyb.documents).map(([key, file]) => (
                    <div key={key} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                      <span>{file ? '✅' : '❌'}</span>
                      <span className="text-sm capitalize">
                        {key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Warning if incomplete */}
      {!isDataComplete() && (
        <div className="mt-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <svg className="w-6 h-6 text-red-600 dark:text-red-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                Información Incompleta
              </h4>
              <p className="text-red-700 dark:text-red-300 mb-3">
                Faltan secciones por completar. Regrese a los pasos anteriores para completar toda la información requerida.
              </p>
              <ul className="text-sm text-red-600 dark:text-red-400 space-y-1">
                {!data.profile && <li>• Perfil de Usuario</li>}
                {!data.kyb && <li>• Verificación KYB</li>}
                {!data.financial && <li>• Datos Financieros</li>}
                {!data.business_model && <li>• Modelo de Negocio</li>}
                {!data.payments && <li>• Información de Pagos</li>}
                {!data.consent && <li>• Consentimientos Legales</li>}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700 mt-8">
        {onPrevious && (
          <Button
            onClick={onPrevious}
            variant="outline"
            className="px-6"
            disabled={isSubmitting}
          >
            Anterior
          </Button>
        )}
        <div className="flex-1"></div>
        <Button
          onClick={onNext}
          variant="primary"
          className="px-8"
          disabled={isSubmitting || !isDataComplete()}
        >
          {isSubmitting ? 'Enviando...' : 'Confirmar y Enviar'}
        </Button>
      </div>

      {/* Progress Indicator */}
      <div className="mt-8 bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Paso 7 de 7</span>
          <span className="text-purple-600 dark:text-purple-400 font-medium">
            Revisión Final
          </span>
        </div>
        <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div className="bg-purple-600 h-2 rounded-full" style={{ width: '100%' }}></div>
        </div>
      </div>
    </div>
  );
};

export default ReviewForm;

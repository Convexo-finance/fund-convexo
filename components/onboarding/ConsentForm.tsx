import React, { useState } from 'react';
import { LegalConsent } from '../../types/onboarding';
import Button from '../wallet/shared/Button';

interface ConsentFormProps {
  data: Partial<LegalConsent>;
  onChange: (data: Partial<LegalConsent>) => void;
  onNext: () => void;
  onPrevious?: () => void;
  errors?: Record<string, string>;
  isSubmitting?: boolean;
}

const ConsentForm: React.FC<ConsentFormProps> = ({
  data,
  onChange,
  onNext,
  onPrevious,
  errors = {},
  isSubmitting = false
}) => {
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof LegalConsent, value: any) => {
    onChange({
      ...data,
      [field]: value
    });
    
    // Clear validation error when user changes input
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // All consent fields are required
    if (!data.consent_data_processing) {
      newErrors.consent_data_processing = 'Debe aceptar el procesamiento de datos';
    }

    if (!data.consent_aml_screening) {
      newErrors.consent_aml_screening = 'Debe autorizar las verificaciones AML';
    }

    if (!data.agree_terms) {
      newErrors.agree_terms = 'Debe aceptar los términos de servicio';
    }

    if (!data.electronic_signature?.trim()) {
      newErrors.electronic_signature = 'Firma electrónica es requerida';
    } else if (data.electronic_signature.trim().length < 2) {
      newErrors.electronic_signature = 'La firma debe tener al menos 2 caracteres';
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
  const allConsentsAccepted = data.consent_data_processing && data.consent_aml_screening && data.agree_terms && data.electronic_signature?.trim();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Consentimientos Legales
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Términos legales, política de privacidad y firma electrónica
        </p>
      </div>

      <form className="space-y-8">
        {/* Data Processing Consent */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            📋 Consentimiento para Procesamiento de Datos
          </h3>
          
          <div className="bg-white dark:bg-gray-700 rounded-lg p-6 mb-4">
            <div className="prose dark:prose-invert max-w-none text-sm">
              <p className="mb-4">
                <strong>Convexo</strong> requiere su consentimiento para procesar sus datos personales y empresariales con los siguientes propósitos:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Verificación de identidad empresarial (KYB) y cumplimiento regulatorio</li>
                <li>Análisis de riesgo crediticio y scoring financiero</li>
                <li>Facilitación de inversiones y transacciones financieras</li>
                <li>Comunicaciones relacionadas con su aplicación y servicios</li>
                <li>Cumplimiento de obligaciones legales y regulatorias</li>
              </ul>
              <p className="mb-4">
                Sus datos serán tratados de acuerdo con nuestra <a href="#" className="text-purple-600 underline">Política de Privacidad</a> y 
                las leyes aplicables de protección de datos.
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Puede retirar este consentimiento en cualquier momento, sujeto a obligaciones legales y contractuales existentes.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="consent_data_processing"
              checked={data.consent_data_processing || false}
              onChange={(e) => handleInputChange('consent_data_processing', e.target.checked)}
              className="mt-1 w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <label htmlFor="consent_data_processing" className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-medium">Acepto el procesamiento de mis datos personales y empresariales</span> de acuerdo con los términos descritos arriba.
              <span className="text-red-500 ml-1">*</span>
            </label>
          </div>
          {displayErrors.consent_data_processing && (
            <p className="mt-2 text-sm text-red-600">{displayErrors.consent_data_processing}</p>
          )}
        </div>

        {/* AML Screening Consent */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            🔍 Autorización para Verificaciones AML
          </h3>
          
          <div className="bg-white dark:bg-gray-700 rounded-lg p-6 mb-4">
            <div className="prose dark:prose-invert max-w-none text-sm">
              <p className="mb-4">
                Para cumplir con las regulaciones contra el lavado de dinero (AML) y conocer a nuestros clientes (KYC), 
                necesitamos realizar verificaciones que pueden incluir:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Verificación de identidad a través de proveedores especializados como Sumsub</li>
                <li>Consultas en listas de sanciones y PEP (Personas Políticamente Expuestas)</li>
                <li>Verificación de antecedentes comerciales y legales</li>
                <li>Monitoreo continuo durante la relación comercial</li>
              </ul>
              <p className="mb-4">
                Estas verificaciones son obligatorias para cumplir con las regulaciones financieras internacionales.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="consent_aml_screening"
              checked={data.consent_aml_screening || false}
              onChange={(e) => handleInputChange('consent_aml_screening', e.target.checked)}
              className="mt-1 w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <label htmlFor="consent_aml_screening" className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-medium">Autorizo las verificaciones AML y KYC</span> necesarias para cumplir con las regulaciones financieras.
              <span className="text-red-500 ml-1">*</span>
            </label>
          </div>
          {displayErrors.consent_aml_screening && (
            <p className="mt-2 text-sm text-red-600">{displayErrors.consent_aml_screening}</p>
          )}
        </div>

        {/* Terms of Service */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            📄 Términos de Servicio
          </h3>
          
          <div className="bg-white dark:bg-gray-700 rounded-lg p-6 mb-4">
            <div className="prose dark:prose-invert max-w-none text-sm">
              <p className="mb-4">
                Al continuar con su aplicación, acepta estar sujeto a nuestros 
                <a href="#" className="text-purple-600 underline mx-1">Términos de Servicio</a> 
                que incluyen:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Condiciones para el uso de la plataforma Convexo</li>
                <li>Términos y condiciones para inversiones y financiamiento</li>
                <li>Políticas de tarifas y comisiones</li>
                <li>Limitaciones de responsabilidad</li>
                <li>Procedimientos de resolución de disputas</li>
                <li>Términos de terminación del servicio</li>
              </ul>
              <p className="mb-4">
                Recomendamos encarecidamente leer completamente los términos antes de aceptar.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="agree_terms"
              checked={data.agree_terms || false}
              onChange={(e) => handleInputChange('agree_terms', e.target.checked)}
              className="mt-1 w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <label htmlFor="agree_terms" className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-medium">Acepto los Términos de Servicio de Convexo</span> y entiendo que son legalmente vinculantes.
              <span className="text-red-500 ml-1">*</span>
            </label>
          </div>
          {displayErrors.agree_terms && (
            <p className="mt-2 text-sm text-red-600">{displayErrors.agree_terms}</p>
          )}
        </div>

        {/* Electronic Signature */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            ✍️ Firma Electrónica
          </h3>
          
          <div className="bg-white dark:bg-gray-700 rounded-lg p-6 mb-4">
            <div className="prose dark:prose-invert max-w-none text-sm">
              <p className="mb-4">
                Su firma electrónica confirma que:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Toda la información proporcionada es verdadera y exacta</li>
                <li>Está autorizado para representar a la empresa</li>
                <li>Acepta todos los términos y condiciones mencionados</li>
                <li>Entiende las implicaciones legales de esta aplicación</li>
              </ul>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-900/20 p-3 rounded">
                <strong>Importante:</strong> Esta firma electrónica tiene la misma validez legal que una firma manuscrita.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Escriba su nombre completo como firma electrónica
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              value={data.electronic_signature || ''}
              onChange={(e) => handleInputChange('electronic_signature', e.target.value)}
              className={`
                w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg
                ${displayErrors.electronic_signature ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}
                bg-white dark:bg-gray-700 text-gray-900 dark:text-white
              `}
              placeholder="WILLIAM MARTINEZ"
              style={{ fontFamily: 'cursive' }}
            />
            {displayErrors.electronic_signature && (
              <p className="mt-1 text-sm text-red-600">{displayErrors.electronic_signature}</p>
            )}
            <p className="mt-2 text-sm text-gray-500">
              Escriba su nombre completo en MAYÚSCULAS tal como aparece en su documento de identidad
            </p>
          </div>

          {data.electronic_signature && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Vista previa de la firma:</strong>
              </p>
              <p className="text-2xl mt-2" style={{ fontFamily: 'cursive' }}>
                {data.electronic_signature}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                Firmado digitalmente el {new Date().toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          )}
        </div>

        {/* Final Confirmation */}
        {allConsentsAccepted && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="font-semibold text-green-800 dark:text-green-200">
                  ¡Listo para enviar!
                </h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Ha completado todos los consentimientos requeridos. Puede proceder a enviar su aplicación.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
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
            onClick={handleNext}
            variant="primary"
            className="px-8"
            disabled={isSubmitting || !allConsentsAccepted}
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Aplicación'}
          </Button>
        </div>
      </form>

      {/* Progress Indicator */}
      <div className="mt-8 bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Paso 6 de 6</span>
          <span className="text-purple-600 dark:text-purple-400 font-medium">
            Consentimientos Legales
          </span>
        </div>
        <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div className="bg-purple-600 h-2 rounded-full" style={{ width: '100%' }}></div>
        </div>
      </div>
    </div>
  );
};

export default ConsentForm;

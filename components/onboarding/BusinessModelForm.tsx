import React, { useState } from 'react';
import { BusinessModel } from '../../types/onboarding';
import Button from '../wallet/shared/Button';

interface BusinessModelFormProps {
  data: Partial<BusinessModel>;
  onChange: (data: Partial<BusinessModel>) => void;
  onNext: () => void;
  onPrevious?: () => void;
  errors?: Record<string, string>;
}

const BusinessModelForm: React.FC<BusinessModelFormProps> = ({
  data,
  onChange,
  onNext,
  onPrevious,
  errors = {}
}) => {
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof BusinessModel, value: string | number) => {
    onChange({
      ...data,
      [field]: value
    });
    
    // Clear validation error when user starts typing
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

    // Required field validations
    if (!data.business_description?.trim()) {
      newErrors.business_description = 'Descripción del negocio es requerida';
    } else if (data.business_description.length > 500) {
      newErrors.business_description = 'La descripción debe tener máximo 500 caracteres';
    }

    if (!data.number_employees || data.number_employees <= 0) {
      newErrors.number_employees = 'Número de empleados es requerido y debe ser mayor a 0';
    } else if (data.number_employees > 10000) {
      newErrors.number_employees = 'Número de empleados parece muy alto, por favor verifique';
    }

    if (!data.exporta) {
      newErrors.exporta = 'Debe indicar si la empresa exporta';
    }

    if (!data.clientes?.trim()) {
      newErrors.clientes = 'Descripción de clientes es requerida';
    }

    if (!data.productos_servicios?.trim()) {
      newErrors.productos_servicios = 'Productos o servicios es requerido';
    }

    if (!data.problema?.trim()) {
      newErrors.problema = 'Problema que soluciona es requerido';
    }

    if (!data.propuesta_valor?.trim()) {
      newErrors.propuesta_valor = 'Propuesta de valor es requerida';
    }

    if (!data.modelo_negocio?.trim()) {
      newErrors.modelo_negocio = 'Modelo de negocio es requerido';
    }

    if (!data.traccion?.trim()) {
      newErrors.traccion = 'Tracción es requerida';
    }

    if (!data.plan_crecimiento?.trim()) {
      newErrors.plan_crecimiento = 'Plan de crecimiento es requerido';
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
          Modelo de Negocio
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Información sobre tu empresa y tesis de inversión
        </p>
      </div>

      <form className="space-y-8">
        {/* Company Info Section */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Información de la Empresa
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Business Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descripción del Negocio
                <span className="text-red-500 ml-1">*</span>
              </label>
              <textarea
                value={data.business_description || ''}
                onChange={(e) => handleInputChange('business_description', e.target.value)}
                rows={4}
                className={`
                  w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
                  ${displayErrors.business_description 
                    ? 'border-red-400' 
                    : 'border-gray-300 dark:border-gray-600'
                  }
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                `}
                placeholder="Startup agrotech que desarrolla sensores de riego inteligente"
              />
              <div className="flex justify-between mt-1">
                {displayErrors.business_description ? (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {displayErrors.business_description}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500">Debe ser clara, diferenciadora y entendible</p>
                )}
                <p className="text-sm text-gray-500">
                  {(data.business_description || '').length}/500
                </p>
              </div>
            </div>

            {/* Number of Employees */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Número de Empleados
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="10000"
                value={data.number_employees || ''}
                onChange={(e) => handleInputChange('number_employees', parseInt(e.target.value) || 0)}
                className={`
                  w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
                  ${displayErrors.number_employees 
                    ? 'border-red-400' 
                    : 'border-gray-300 dark:border-gray-600'
                  }
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                `}
                placeholder="25"
              />
              {displayErrors.number_employees ? (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {displayErrors.number_employees}
                </p>
              ) : (
                <p className="mt-1 text-sm text-gray-500">Rango ideal: 5-200 empleados</p>
              )}
            </div>

            {/* Exports */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ¿Exporta?
                <span className="text-red-500 ml-1">*</span>
              </label>
              <select
                value={data.exporta || ''}
                onChange={(e) => handleInputChange('exporta', e.target.value as 'Sí' | 'No')}
                className={`
                  w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
                  ${displayErrors.exporta 
                    ? 'border-red-400' 
                    : 'border-gray-300 dark:border-gray-600'
                  }
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                `}
              >
                <option value="">Seleccione...</option>
                <option value="Sí">Sí</option>
                <option value="No">No</option>
              </select>
              {displayErrors.exporta ? (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {displayErrors.exporta}
                </p>
              ) : (
                <p className="mt-1 text-sm text-gray-500">Exportación activa aumenta atractivo</p>
              )}
            </div>
          </div>
        </div>

        {/* Investment Thesis Section */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Tesis de Inversión
          </h3>
          
          <div className="space-y-6">
            {/* Clients */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Clientes
                <span className="text-red-500 ml-1">*</span>
              </label>
              <textarea
                value={data.clientes || ''}
                onChange={(e) => handleInputChange('clientes', e.target.value)}
                rows={3}
                className={`
                  w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
                  ${displayErrors.clientes 
                    ? 'border-red-400' 
                    : 'border-gray-300 dark:border-gray-600'
                  }
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                `}
                placeholder="Productores agrícolas de mediana escala"
              />
              {displayErrors.clientes ? (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {displayErrors.clientes}
                </p>
              ) : (
                <p className="mt-1 text-sm text-gray-500">Debe estar bien segmentado y cuantificado</p>
              )}
            </div>

            {/* Products/Services */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Productos o Servicios
                <span className="text-red-500 ml-1">*</span>
              </label>
              <textarea
                value={data.productos_servicios || ''}
                onChange={(e) => handleInputChange('productos_servicios', e.target.value)}
                rows={3}
                className={`
                  w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
                  ${displayErrors.productos_servicios 
                    ? 'border-red-400' 
                    : 'border-gray-300 dark:border-gray-600'
                  }
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                `}
                placeholder="Sensores IoT + plataforma de análisis de datos"
              />
              {displayErrors.productos_servicios ? (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {displayErrors.productos_servicios}
                </p>
              ) : (
                <p className="mt-1 text-sm text-gray-500">Debe mostrar claridad de oferta y diferenciación</p>
              )}
            </div>

            {/* Problem */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Problema que Soluciona
                <span className="text-red-500 ml-1">*</span>
              </label>
              <textarea
                value={data.problema || ''}
                onChange={(e) => handleInputChange('problema', e.target.value)}
                rows={3}
                className={`
                  w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
                  ${displayErrors.problema 
                    ? 'border-red-400' 
                    : 'border-gray-300 dark:border-gray-600'
                  }
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                `}
                placeholder="Bajo acceso a datos de riego eficientes para pequeños agricultores"
              />
              {displayErrors.problema ? (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {displayErrors.problema}
                </p>
              ) : (
                <p className="mt-1 text-sm text-gray-500">Problema debe ser real, validado y relevante</p>
              )}
            </div>

            {/* Value Proposition */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Propuesta de Valor
                <span className="text-red-500 ml-1">*</span>
              </label>
              <textarea
                value={data.propuesta_valor || ''}
                onChange={(e) => handleInputChange('propuesta_valor', e.target.value)}
                rows={3}
                className={`
                  w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
                  ${displayErrors.propuesta_valor 
                    ? 'border-red-400' 
                    : 'border-gray-300 dark:border-gray-600'
                  }
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                `}
                placeholder="Reducimos 30% el consumo de agua en cultivos de caña gracias a IA"
              />
              {displayErrors.propuesta_valor ? (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {displayErrors.propuesta_valor}
                </p>
              ) : (
                <p className="mt-1 text-sm text-gray-500">Debe ser medible y diferenciada</p>
              )}
            </div>

            {/* Business Model */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Modelo de Negocio
                <span className="text-red-500 ml-1">*</span>
              </label>
              <textarea
                value={data.modelo_negocio || ''}
                onChange={(e) => handleInputChange('modelo_negocio', e.target.value)}
                rows={3}
                className={`
                  w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
                  ${displayErrors.modelo_negocio 
                    ? 'border-red-400' 
                    : 'border-gray-300 dark:border-gray-600'
                  }
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                `}
                placeholder="Venta de hardware + suscripción SaaS"
              />
              {displayErrors.modelo_negocio ? (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {displayErrors.modelo_negocio}
                </p>
              ) : (
                <p className="mt-1 text-sm text-gray-500">Debe ser escalable y sostenible</p>
              )}
            </div>

            {/* Traction */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tracción
                <span className="text-red-500 ml-1">*</span>
              </label>
              <textarea
                value={data.traccion || ''}
                onChange={(e) => handleInputChange('traccion', e.target.value)}
                rows={3}
                className={`
                  w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
                  ${displayErrors.traccion 
                    ? 'border-red-400' 
                    : 'border-gray-300 dark:border-gray-600'
                  }
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                `}
                placeholder="+100 clientes activos en 3 departamentos"
              />
              {displayErrors.traccion ? (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {displayErrors.traccion}
                </p>
              ) : (
                <p className="mt-1 text-sm text-gray-500">Ideal mostrar clientes, ingresos o pilotos claros</p>
              )}
            </div>

            {/* Growth Plan */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Plan de Crecimiento
                <span className="text-red-500 ml-1">*</span>
              </label>
              <textarea
                value={data.plan_crecimiento || ''}
                onChange={(e) => handleInputChange('plan_crecimiento', e.target.value)}
                rows={3}
                className={`
                  w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
                  ${displayErrors.plan_crecimiento 
                    ? 'border-red-400' 
                    : 'border-gray-300 dark:border-gray-600'
                  }
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                `}
                placeholder="Expansión a Ecuador y Perú en 2026"
              />
              {displayErrors.plan_crecimiento ? (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {displayErrors.plan_crecimiento}
                </p>
              ) : (
                <p className="mt-1 text-sm text-gray-500">Debe mostrar visión regional y factible</p>
              )}
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
          <span className="text-gray-600 dark:text-gray-400">Paso 4 de 6</span>
          <span className="text-purple-600 dark:text-purple-400 font-medium">
            Modelo de Negocio
          </span>
        </div>
        <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div className="bg-purple-600 h-2 rounded-full" style={{ width: '66.67%' }}></div>
        </div>
      </div>
    </div>
  );
};

export default BusinessModelForm;

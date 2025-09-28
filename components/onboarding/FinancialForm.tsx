import React, { useState, useEffect } from 'react';
import { FinancialData, Currency, RevenueModel, Periodicity } from '../../types/onboarding';
import Button from '../wallet/shared/Button';

interface FinancialFormProps {
  data: Partial<FinancialData>;
  onChange: (data: Partial<FinancialData>) => void;
  onNext: () => void;
  onPrevious?: () => void;
  errors?: Record<string, string>;
}

const FinancialForm: React.FC<FinancialFormProps> = ({
  data,
  onChange,
  onNext,
  onPrevious,
  errors = {}
}) => {
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [currentSection, setCurrentSection] = useState<'report' | 'income' | 'commercial' | 'balance' | 'operations'>('report');

  // Initialize with default data structure if empty
  useEffect(() => {
    if (!data.report_details) {
      onChange({
        ...data,
        report_details: {
          moneda_reporte: 'USD',
          modelo_ingresos: 'mixto',
          inicio_periodo: '',
          fin_periodo: ''
        },
        income_statement: {},
        commercial: { periodicidad: 'mensual' },
        balance_sheet: {},
        operations: {}
      });
    }
  }, [data, onChange]);

  const handleSectionChange = (field: string, value: any, section: keyof FinancialData) => {
    const updatedData = {
      ...data,
      [section]: {
        ...data[section],
        [field]: value
      }
    };
    onChange(updatedData);
    
    // Clear validation error when user starts typing
    const errorKey = `${section}.${field}`;
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

    // Report Details Validation
    if (!data.report_details?.moneda_reporte) {
      newErrors['report_details.moneda_reporte'] = 'Moneda de reporte es requerida';
    }
    if (!data.report_details?.modelo_ingresos) {
      newErrors['report_details.modelo_ingresos'] = 'Modelo de ingresos es requerido';
    }
    if (!data.report_details?.inicio_periodo) {
      newErrors['report_details.inicio_periodo'] = 'Fecha de inicio es requerida';
    }
    if (!data.report_details?.fin_periodo) {
      newErrors['report_details.fin_periodo'] = 'Fecha de fin es requerida';
    }

    // Income Statement Validation
    const requiredIncomeFields = [
      'ventas_nacionales', 'ventas_exportaciones', 'costo_ventas', 
      'gastos_operativos', 'gasto_id', 'capex', 'utilidad_neta'
    ];
    requiredIncomeFields.forEach(field => {
      if (!data.income_statement?.[field as keyof typeof data.income_statement] && 
          data.income_statement?.[field as keyof typeof data.income_statement] !== 0) {
        newErrors[`income_statement.${field}`] = 'Este campo es requerido';
      }
    });

    // Commercial Validation
    if (!data.commercial?.periodicidad) {
      newErrors['commercial.periodicidad'] = 'Periodicidad es requerida';
    }
    const requiredCommercialFields = [
      'gasto_adquisicion_clientes', 'clientes_nuevos_periodo', 
      'clientes_inicio_periodo', 'clientes_churn_periodo', 'clientes_fin_periodo'
    ];
    requiredCommercialFields.forEach(field => {
      if (!data.commercial?.[field as keyof typeof data.commercial] && 
          data.commercial?.[field as keyof typeof data.commercial] !== 0) {
        newErrors[`commercial.${field}`] = 'Este campo es requerido';
      }
    });

    // Model-specific validations
    if (data.report_details?.modelo_ingresos === 'subscription') {
      if (!data.commercial?.ingresos_recurrentes_mensuales && data.commercial?.ingresos_recurrentes_mensuales !== 0) {
        newErrors['commercial.ingresos_recurrentes_mensuales'] = 'MRR es requerido para modelo de suscripción';
      }
      if (!data.commercial?.clientes_activos_promedio && data.commercial?.clientes_activos_promedio !== 0) {
        newErrors['commercial.clientes_activos_promedio'] = 'Clientes activos promedio es requerido para modelo de suscripción';
      }
    }

    if (data.report_details?.modelo_ingresos === 'transaccional') {
      if (!data.commercial?.ticket_promedio && data.commercial?.ticket_promedio !== 0) {
        newErrors['commercial.ticket_promedio'] = 'Ticket promedio es requerido para modelo transaccional';
      }
      if (!data.commercial?.frecuencia_compra_anual && data.commercial?.frecuencia_compra_anual !== 0) {
        newErrors['commercial.frecuencia_compra_anual'] = 'Frecuencia de compra es requerida para modelo transaccional';
      }
      if (!data.commercial?.anios_retencion && data.commercial?.anios_retencion !== 0) {
        newErrors['commercial.anios_retencion'] = 'Años de retención es requerido para modelo transaccional';
      }
    }

    // Balance Sheet Validation
    const requiredBalanceFields = [
      'activos_corrientes', 'efectivo_equivalentes', 'cuentas_cobrar', 'inventario',
      'activos_no_corrientes', 'pasivos_corrientes', 'cuentas_pagar', 
      'deuda_corto_plazo', 'pasivos_no_corrientes', 'patrimonio_neto'
    ];
    requiredBalanceFields.forEach(field => {
      if (!data.balance_sheet?.[field as keyof typeof data.balance_sheet] && 
          data.balance_sheet?.[field as keyof typeof data.balance_sheet] !== 0) {
        newErrors[`balance_sheet.${field}`] = 'Este campo es requerido';
      }
    });

    // Operations Validation
    if (!data.operations?.burn_rate_mensual && data.operations?.burn_rate_mensual !== 0) {
      newErrors['operations.burn_rate_mensual'] = 'Burn rate mensual es requerido';
    }

    setValidationErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext();
    } else {
      // Scroll to first error
      const firstErrorSection = Object.keys(validationErrors)[0]?.split('.')[0];
      if (firstErrorSection) {
        setCurrentSection(firstErrorSection as any);
      }
    }
  };

  const displayErrors = { ...errors, ...validationErrors };

  const isSubscriptionModel = data.report_details?.modelo_ingresos === 'subscription';
  const isTransactionalModel = data.report_details?.modelo_ingresos === 'transaccional';

  const formatCurrency = (currency: Currency) => {
    const symbols = { USD: '$', EUR: '€', COP: '$', MXN: '$', BRL: 'R$', ARS: '$' };
    return symbols[currency] || currency;
  };

  const currentCurrency = data.report_details?.moneda_reporte || 'USD';

  const sections = [
    { key: 'report', title: 'Detalles del Reporte', icon: '📊' },
    { key: 'income', title: 'Estado de Resultados', icon: '💰' },
    { key: 'commercial', title: 'Métricas Comerciales', icon: '👥' },
    { key: 'balance', title: 'Balance General', icon: '⚖️' },
    { key: 'operations', title: 'Operaciones', icon: '🔧' }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Datos Financieros
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Información financiera detallada para análisis de scoring crediticio
        </p>
      </div>

      {/* Section Navigation */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          {sections.map((section) => (
            <button
              key={section.key}
              onClick={() => setCurrentSection(section.key as any)}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${currentSection === section.key
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }
              `}
            >
              <span>{section.icon}</span>
              <span>{section.title}</span>
            </button>
          ))}
        </div>
      </div>

      <form className="space-y-8">
        {/* Report Details Section */}
        {currentSection === 'report' && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              📊 Detalles del Reporte
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Moneda de Reporte <span className="text-red-500">*</span>
                </label>
                <select
                  value={data.report_details?.moneda_reporte || ''}
                  onChange={(e) => handleSectionChange('moneda_reporte', e.target.value as Currency, 'report_details')}
                  className={`
                    w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
                    ${displayErrors['report_details.moneda_reporte'] ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}
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
                {displayErrors['report_details.moneda_reporte'] && (
                  <p className="mt-1 text-sm text-red-600">{displayErrors['report_details.moneda_reporte']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Modelo de Ingresos <span className="text-red-500">*</span>
                </label>
                <select
                  value={data.report_details?.modelo_ingresos || ''}
                  onChange={(e) => handleSectionChange('modelo_ingresos', e.target.value as RevenueModel, 'report_details')}
                  className={`
                    w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
                    ${displayErrors['report_details.modelo_ingresos'] ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                  `}
                >
                  <option value="">Seleccione...</option>
                  <option value="subscription">Suscripción</option>
                  <option value="transaccional">Transaccional</option>
                  <option value="mixto">Mixto</option>
                </select>
                {displayErrors['report_details.modelo_ingresos'] && (
                  <p className="mt-1 text-sm text-red-600">{displayErrors['report_details.modelo_ingresos']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Inicio del Período <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={data.report_details?.inicio_periodo || ''}
                  onChange={(e) => handleSectionChange('inicio_periodo', e.target.value, 'report_details')}
                  className={`
                    w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
                    ${displayErrors['report_details.inicio_periodo'] ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                  `}
                />
                {displayErrors['report_details.inicio_periodo'] && (
                  <p className="mt-1 text-sm text-red-600">{displayErrors['report_details.inicio_periodo']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fin del Período <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={data.report_details?.fin_periodo || ''}
                  onChange={(e) => handleSectionChange('fin_periodo', e.target.value, 'report_details')}
                  className={`
                    w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
                    ${displayErrors['report_details.fin_periodo'] ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                  `}
                />
                {displayErrors['report_details.fin_periodo'] && (
                  <p className="mt-1 text-sm text-red-600">{displayErrors['report_details.fin_periodo']}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Income Statement Section */}
        {currentSection === 'income' && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              💰 Estado de Resultados ({formatCurrency(currentCurrency)})
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ventas Nacionales <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={data.income_statement?.ventas_nacionales || ''}
                  onChange={(e) => handleSectionChange('ventas_nacionales', parseFloat(e.target.value) || 0, 'income_statement')}
                  className={`
                    w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
                    ${displayErrors['income_statement.ventas_nacionales'] ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                  `}
                  placeholder="0.00"
                />
                {displayErrors['income_statement.ventas_nacionales'] && (
                  <p className="mt-1 text-sm text-red-600">{displayErrors['income_statement.ventas_nacionales']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ventas Exportaciones <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={data.income_statement?.ventas_exportaciones || ''}
                  onChange={(e) => handleSectionChange('ventas_exportaciones', parseFloat(e.target.value) || 0, 'income_statement')}
                  className={`
                    w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
                    ${displayErrors['income_statement.ventas_exportaciones'] ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                  `}
                  placeholder="0.00"
                />
                {displayErrors['income_statement.ventas_exportaciones'] && (
                  <p className="mt-1 text-sm text-red-600">{displayErrors['income_statement.ventas_exportaciones']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ventas Año Anterior
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={data.income_statement?.ingresos_anterior || ''}
                  onChange={(e) => handleSectionChange('ingresos_anterior', parseFloat(e.target.value) || 0, 'income_statement')}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="0.00"
                />
                <p className="mt-1 text-sm text-gray-500">Opcional - para calcular crecimiento YoY</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Costo de Ventas <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={data.income_statement?.costo_ventas || ''}
                  onChange={(e) => handleSectionChange('costo_ventas', parseFloat(e.target.value) || 0, 'income_statement')}
                  className={`
                    w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
                    ${displayErrors['income_statement.costo_ventas'] ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                  `}
                  placeholder="0.00"
                />
                {displayErrors['income_statement.costo_ventas'] && (
                  <p className="mt-1 text-sm text-red-600">{displayErrors['income_statement.costo_ventas']}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">Materia prima, subcontratación, logística directa</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Gastos Operativos <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={data.income_statement?.gastos_operativos || ''}
                  onChange={(e) => handleSectionChange('gastos_operativos', parseFloat(e.target.value) || 0, 'income_statement')}
                  className={`
                    w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
                    ${displayErrors['income_statement.gastos_operativos'] ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                  `}
                  placeholder="0.00"
                />
                {displayErrors['income_statement.gastos_operativos'] && (
                  <p className="mt-1 text-sm text-red-600">{displayErrors['income_statement.gastos_operativos']}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">Administración, nómina, servicios generales</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Gasto en I+D <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={data.income_statement?.gasto_id || ''}
                  onChange={(e) => handleSectionChange('gasto_id', parseFloat(e.target.value) || 0, 'income_statement')}
                  className={`
                    w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
                    ${displayErrors['income_statement.gasto_id'] ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                  `}
                  placeholder="0.00"
                />
                {displayErrors['income_statement.gasto_id'] && (
                  <p className="mt-1 text-sm text-red-600">{displayErrors['income_statement.gasto_id']}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">Equipo técnico, laboratorios, consultorías de innovación</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  CAPEX <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={data.income_statement?.capex || ''}
                  onChange={(e) => handleSectionChange('capex', parseFloat(e.target.value) || 0, 'income_statement')}
                  className={`
                    w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
                    ${displayErrors['income_statement.capex'] ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                  `}
                  placeholder="0.00"
                />
                {displayErrors['income_statement.capex'] && (
                  <p className="mt-1 text-sm text-red-600">{displayErrors['income_statement.capex']}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">Maquinaria, adecuaciones, hardware, equipos de producción</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Utilidad Neta <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={data.income_statement?.utilidad_neta || ''}
                  onChange={(e) => handleSectionChange('utilidad_neta', parseFloat(e.target.value) || 0, 'income_statement')}
                  className={`
                    w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
                    ${displayErrors['income_statement.utilidad_neta'] ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                  `}
                  placeholder="0.00"
                />
                {displayErrors['income_statement.utilidad_neta'] && (
                  <p className="mt-1 text-sm text-red-600">{displayErrors['income_statement.utilidad_neta']}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">Resultado después de impuestos</p>
              </div>
            </div>
          </div>
        )}

        {/* Commercial Section */}
        {currentSection === 'commercial' && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              👥 Métricas Comerciales
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Periodicidad de Cálculo <span className="text-red-500">*</span>
                </label>
                <select
                  value={data.commercial?.periodicidad || ''}
                  onChange={(e) => handleSectionChange('periodicidad', e.target.value as Periodicity, 'commercial')}
                  className={`
                    w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
                    ${displayErrors['commercial.periodicidad'] ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                  `}
                >
                  <option value="">Seleccione...</option>
                  <option value="mensual">Mensual</option>
                  <option value="trimestral">Trimestral</option>
                  <option value="anual">Anual</option>
                </select>
                {displayErrors['commercial.periodicidad'] && (
                  <p className="mt-1 text-sm text-red-600">{displayErrors['commercial.periodicidad']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Gasto en Adquisición de Clientes <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={data.commercial?.gasto_adquisicion_clientes || ''}
                  onChange={(e) => handleSectionChange('gasto_adquisicion_clientes', parseFloat(e.target.value) || 0, 'commercial')}
                  className={`
                    w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
                    ${displayErrors['commercial.gasto_adquisicion_clientes'] ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                  `}
                  placeholder="0.00"
                />
                {displayErrors['commercial.gasto_adquisicion_clientes'] && (
                  <p className="mt-1 text-sm text-red-600">{displayErrors['commercial.gasto_adquisicion_clientes']}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">Marketing directo, ads, ferias, comerciales</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Clientes Nuevos <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={data.commercial?.clientes_nuevos_periodo || ''}
                  onChange={(e) => handleSectionChange('clientes_nuevos_periodo', parseInt(e.target.value) || 0, 'commercial')}
                  className={`
                    w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
                    ${displayErrors['commercial.clientes_nuevos_periodo'] ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                  `}
                  placeholder="0"
                />
                {displayErrors['commercial.clientes_nuevos_periodo'] && (
                  <p className="mt-1 text-sm text-red-600">{displayErrors['commercial.clientes_nuevos_periodo']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Clientes al Inicio <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={data.commercial?.clientes_inicio_periodo || ''}
                  onChange={(e) => handleSectionChange('clientes_inicio_periodo', parseInt(e.target.value) || 0, 'commercial')}
                  className={`
                    w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
                    ${displayErrors['commercial.clientes_inicio_periodo'] ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                  `}
                  placeholder="0"
                />
                {displayErrors['commercial.clientes_inicio_periodo'] && (
                  <p className="mt-1 text-sm text-red-600">{displayErrors['commercial.clientes_inicio_periodo']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Clientes Perdidos <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={data.commercial?.clientes_churn_periodo || ''}
                  onChange={(e) => handleSectionChange('clientes_churn_periodo', parseInt(e.target.value) || 0, 'commercial')}
                  className={`
                    w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
                    ${displayErrors['commercial.clientes_churn_periodo'] ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                  `}
                  placeholder="0"
                />
                {displayErrors['commercial.clientes_churn_periodo'] && (
                  <p className="mt-1 text-sm text-red-600">{displayErrors['commercial.clientes_churn_periodo']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Clientes al Final <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={data.commercial?.clientes_fin_periodo || ''}
                  onChange={(e) => handleSectionChange('clientes_fin_periodo', parseInt(e.target.value) || 0, 'commercial')}
                  className={`
                    w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
                    ${displayErrors['commercial.clientes_fin_periodo'] ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                  `}
                  placeholder="0"
                />
                {displayErrors['commercial.clientes_fin_periodo'] && (
                  <p className="mt-1 text-sm text-red-600">{displayErrors['commercial.clientes_fin_periodo']}</p>
                )}
              </div>

              {/* Subscription Model Fields */}
              {isSubscriptionModel && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      MRR Promedio <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={data.commercial?.ingresos_recurrentes_mensuales || ''}
                      onChange={(e) => handleSectionChange('ingresos_recurrentes_mensuales', parseFloat(e.target.value) || 0, 'commercial')}
                      className={`
                        w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
                        ${displayErrors['commercial.ingresos_recurrentes_mensuales'] ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}
                        bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                      `}
                      placeholder="0.00"
                    />
                    {displayErrors['commercial.ingresos_recurrentes_mensuales'] && (
                      <p className="mt-1 text-sm text-red-600">{displayErrors['commercial.ingresos_recurrentes_mensuales']}</p>
                    )}
                    <p className="mt-1 text-sm text-gray-500">Solo para modelo de suscripción</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Clientes Activos Promedio <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={data.commercial?.clientes_activos_promedio || ''}
                      onChange={(e) => handleSectionChange('clientes_activos_promedio', parseInt(e.target.value) || 0, 'commercial')}
                      className={`
                        w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
                        ${displayErrors['commercial.clientes_activos_promedio'] ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}
                        bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                      `}
                      placeholder="0"
                    />
                    {displayErrors['commercial.clientes_activos_promedio'] && (
                      <p className="mt-1 text-sm text-red-600">{displayErrors['commercial.clientes_activos_promedio']}</p>
                    )}
                    <p className="mt-1 text-sm text-gray-500">Solo para modelo de suscripción</p>
                  </div>
                </>
              )}

              {/* Transactional Model Fields */}
              {isTransactionalModel && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Ticket Promedio <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={data.commercial?.ticket_promedio || ''}
                      onChange={(e) => handleSectionChange('ticket_promedio', parseFloat(e.target.value) || 0, 'commercial')}
                      className={`
                        w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
                        ${displayErrors['commercial.ticket_promedio'] ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}
                        bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                      `}
                      placeholder="0.00"
                    />
                    {displayErrors['commercial.ticket_promedio'] && (
                      <p className="mt-1 text-sm text-red-600">{displayErrors['commercial.ticket_promedio']}</p>
                    )}
                    <p className="mt-1 text-sm text-gray-500">Solo para modelo transaccional</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Frecuencia de Compra Anual <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={data.commercial?.frecuencia_compra_anual || ''}
                      onChange={(e) => handleSectionChange('frecuencia_compra_anual', parseFloat(e.target.value) || 0, 'commercial')}
                      className={`
                        w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
                        ${displayErrors['commercial.frecuencia_compra_anual'] ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}
                        bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                      `}
                      placeholder="0.0"
                    />
                    {displayErrors['commercial.frecuencia_compra_anual'] && (
                      <p className="mt-1 text-sm text-red-600">{displayErrors['commercial.frecuencia_compra_anual']}</p>
                    )}
                    <p className="mt-1 text-sm text-gray-500">Solo para modelo transaccional</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Años de Retención <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={data.commercial?.anios_retencion || ''}
                      onChange={(e) => handleSectionChange('anios_retencion', parseFloat(e.target.value) || 0, 'commercial')}
                      className={`
                        w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
                        ${displayErrors['commercial.anios_retencion'] ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}
                        bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                      `}
                      placeholder="0.0"
                    />
                    {displayErrors['commercial.anios_retencion'] && (
                      <p className="mt-1 text-sm text-red-600">{displayErrors['commercial.anios_retencion']}</p>
                    )}
                    <p className="mt-1 text-sm text-gray-500">Solo para modelo transaccional</p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Balance Sheet Section */}
        {currentSection === 'balance' && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              ⚖️ Balance General ({formatCurrency(currentCurrency)})
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Activos Corrientes <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={data.balance_sheet?.activos_corrientes || ''}
                  onChange={(e) => handleSectionChange('activos_corrientes', parseFloat(e.target.value) || 0, 'balance_sheet')}
                  className={`
                    w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
                    ${displayErrors['balance_sheet.activos_corrientes'] ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                  `}
                  placeholder="0.00"
                />
                {displayErrors['balance_sheet.activos_corrientes'] && (
                  <p className="mt-1 text-sm text-red-600">{displayErrors['balance_sheet.activos_corrientes']}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">Caja, bancos, cuentas por cobrar, inventario</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Efectivo y Equivalentes <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={data.balance_sheet?.efectivo_equivalentes || ''}
                  onChange={(e) => handleSectionChange('efectivo_equivalentes', parseFloat(e.target.value) || 0, 'balance_sheet')}
                  className={`
                    w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
                    ${displayErrors['balance_sheet.efectivo_equivalentes'] ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                  `}
                  placeholder="0.00"
                />
                {displayErrors['balance_sheet.efectivo_equivalentes'] && (
                  <p className="mt-1 text-sm text-red-600">{displayErrors['balance_sheet.efectivo_equivalentes']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cuentas por Cobrar <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={data.balance_sheet?.cuentas_cobrar || ''}
                  onChange={(e) => handleSectionChange('cuentas_cobrar', parseFloat(e.target.value) || 0, 'balance_sheet')}
                  className={`
                    w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
                    ${displayErrors['balance_sheet.cuentas_cobrar'] ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                  `}
                  placeholder="0.00"
                />
                {displayErrors['balance_sheet.cuentas_cobrar'] && (
                  <p className="mt-1 text-sm text-red-600">{displayErrors['balance_sheet.cuentas_cobrar']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Inventario <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={data.balance_sheet?.inventario || ''}
                  onChange={(e) => handleSectionChange('inventario', parseFloat(e.target.value) || 0, 'balance_sheet')}
                  className={`
                    w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
                    ${displayErrors['balance_sheet.inventario'] ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                  `}
                  placeholder="0.00"
                />
                {displayErrors['balance_sheet.inventario'] && (
                  <p className="mt-1 text-sm text-red-600">{displayErrors['balance_sheet.inventario']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Activos No Corrientes <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={data.balance_sheet?.activos_no_corrientes || ''}
                  onChange={(e) => handleSectionChange('activos_no_corrientes', parseFloat(e.target.value) || 0, 'balance_sheet')}
                  className={`
                    w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
                    ${displayErrors['balance_sheet.activos_no_corrientes'] ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                  `}
                  placeholder="0.00"
                />
                {displayErrors['balance_sheet.activos_no_corrientes'] && (
                  <p className="mt-1 text-sm text-red-600">{displayErrors['balance_sheet.activos_no_corrientes']}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">Propiedad, planta, equipo, intangibles</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Pasivos Corrientes <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={data.balance_sheet?.pasivos_corrientes || ''}
                  onChange={(e) => handleSectionChange('pasivos_corrientes', parseFloat(e.target.value) || 0, 'balance_sheet')}
                  className={`
                    w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
                    ${displayErrors['balance_sheet.pasivos_corrientes'] ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                  `}
                  placeholder="0.00"
                />
                {displayErrors['balance_sheet.pasivos_corrientes'] && (
                  <p className="mt-1 text-sm text-red-600">{displayErrors['balance_sheet.pasivos_corrientes']}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">Deudas a menos de 1 año</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cuentas por Pagar <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={data.balance_sheet?.cuentas_pagar || ''}
                  onChange={(e) => handleSectionChange('cuentas_pagar', parseFloat(e.target.value) || 0, 'balance_sheet')}
                  className={`
                    w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
                    ${displayErrors['balance_sheet.cuentas_pagar'] ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                  `}
                  placeholder="0.00"
                />
                {displayErrors['balance_sheet.cuentas_pagar'] && (
                  <p className="mt-1 text-sm text-red-600">{displayErrors['balance_sheet.cuentas_pagar']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Deuda de Corto Plazo <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={data.balance_sheet?.deuda_corto_plazo || ''}
                  onChange={(e) => handleSectionChange('deuda_corto_plazo', parseFloat(e.target.value) || 0, 'balance_sheet')}
                  className={`
                    w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
                    ${displayErrors['balance_sheet.deuda_corto_plazo'] ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                  `}
                  placeholder="0.00"
                />
                {displayErrors['balance_sheet.deuda_corto_plazo'] && (
                  <p className="mt-1 text-sm text-red-600">{displayErrors['balance_sheet.deuda_corto_plazo']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Pasivos No Corrientes <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={data.balance_sheet?.pasivos_no_corrientes || ''}
                  onChange={(e) => handleSectionChange('pasivos_no_corrientes', parseFloat(e.target.value) || 0, 'balance_sheet')}
                  className={`
                    w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
                    ${displayErrors['balance_sheet.pasivos_no_corrientes'] ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                  `}
                  placeholder="0.00"
                />
                {displayErrors['balance_sheet.pasivos_no_corrientes'] && (
                  <p className="mt-1 text-sm text-red-600">{displayErrors['balance_sheet.pasivos_no_corrientes']}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">Deudas >1 año</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Patrimonio Neto <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={data.balance_sheet?.patrimonio_neto || ''}
                  onChange={(e) => handleSectionChange('patrimonio_neto', parseFloat(e.target.value) || 0, 'balance_sheet')}
                  className={`
                    w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
                    ${displayErrors['balance_sheet.patrimonio_neto'] ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                  `}
                  placeholder="0.00"
                />
                {displayErrors['balance_sheet.patrimonio_neto'] && (
                  <p className="mt-1 text-sm text-red-600">{displayErrors['balance_sheet.patrimonio_neto']}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">Capital social + utilidades retenidas</p>
              </div>
            </div>
          </div>
        )}

        {/* Operations Section */}
        {currentSection === 'operations' && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              🔧 Operaciones
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Burn Rate Mensual <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={data.operations?.burn_rate_mensual || ''}
                  onChange={(e) => handleSectionChange('burn_rate_mensual', parseFloat(e.target.value) || 0, 'operations')}
                  className={`
                    w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
                    ${displayErrors['operations.burn_rate_mensual'] ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                  `}
                  placeholder="0.00"
                />
                {displayErrors['operations.burn_rate_mensual'] && (
                  <p className="mt-1 text-sm text-red-600">{displayErrors['operations.burn_rate_mensual']}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">Promedio de caja neta mensual gastada</p>
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
          <span className="text-gray-600 dark:text-gray-400">Paso 3 de 6</span>
          <span className="text-purple-600 dark:text-purple-400 font-medium">
            Datos Financieros
          </span>
        </div>
        <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div className="bg-purple-600 h-2 rounded-full" style={{ width: '50%' }}></div>
        </div>
      </div>
    </div>
  );
};

export default FinancialForm;

import React, { useState } from 'react';
import Button from '../wallet/shared/Button';
import Loading from '../wallet/shared/Loading';

interface FinancialData {
  // Report Details
  moneda_reporte: 'USD' | 'EUR' | 'COP';
  modelo_ingresos: 'subscription' | 'transaccional' | 'mixto';
  inicio_periodo: string;
  fin_periodo: string;
  
  // Income Statement
  ventas_nacionales: number;
  ventas_exportaciones: number;
  ingresos_anterior: number;
  costo_ventas: number;
  gastos_operativos: number;
  gasto_id: number;
  capex: number;
  utilidad_neta: number;
  
  // Commercial Data
  periodicidad: 'mensual' | 'trimestral' | 'anual';
  gasto_adquisicion_clientes: number;
  clientes_nuevos_periodo: number;
  clientes_inicio_periodo: number;
  clientes_churn_periodo: number;
  clientes_fin_periodo: number;
  
  // Subscription specific (conditional)
  ingresos_recurrentes_mensuales?: number;
  clientes_activos_promedio?: number;
  
  // Transactional specific (conditional)
  ticket_promedio?: number;
  frecuencia_compra_anual?: number;
  anios_retencion?: number;
  
  // Balance Sheet
  activos_corrientes: number;
  efectivo_equivalentes: number;
  cuentas_cobrar: number;
  inventario: number;
  activos_no_corrientes: number;
  pasivos_corrientes: number;
  cuentas_pagar: number;
  deuda_corto_plazo: number;
  pasivos_no_corrientes: number;
  patrimonio_neto: number;
  
  // Operations
  burn_rate_mensual: number;
  
  // Capital Request
  capital_solicitado: number;
}

interface BusinessModelData {
  business_description: string;
  number_employees: number;
  exporta: 'Sí' | 'No';
  clientes: string;
  productos_servicios: string;
  problema: string;
  propuesta_valor: string;
  modelo_negocio: string;
  traccion: string;
  plan_crecimiento: string;
}

interface CalculatedIndicators {
  ebitda: number;
  margen_bruto: number;
  margen_operativo: number;
  razon_corriente: number;
  deuda_patrimonio: number;
  roe: number;
  roa: number;
  runway: number;
  revenue_per_employee: number;
  yoy_growth: number;
  porcentaje_id: number;
  porcentaje_exportaciones: number;
  capex_ratio: number;
  cac: number;
  churn: number;
  ltv_sub?: number;
  ltv_tx?: number;
  ltv_cac: number;
  capital_gap: number;
}

type ProcessingStatus = 'idle' | 'processing' | 'completed' | 'error';

const EnterpriseFinancial: React.FC = () => {
  const [currentSection, setCurrentSection] = useState<'financial' | 'business' | 'results'>('financial');
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  
  const [financialData, setFinancialData] = useState<FinancialData>({
    moneda_reporte: 'USD',
    modelo_ingresos: 'mixto',
    inicio_periodo: '',
    fin_periodo: '',
    ventas_nacionales: 0,
    ventas_exportaciones: 0,
    ingresos_anterior: 0,
    costo_ventas: 0,
    gastos_operativos: 0,
    gasto_id: 0,
    capex: 0,
    utilidad_neta: 0,
    periodicidad: 'mensual',
    gasto_adquisicion_clientes: 0,
    clientes_nuevos_periodo: 0,
    clientes_inicio_periodo: 0,
    clientes_churn_periodo: 0,
    clientes_fin_periodo: 0,
    activos_corrientes: 0,
    efectivo_equivalentes: 0,
    cuentas_cobrar: 0,
    inventario: 0,
    activos_no_corrientes: 0,
    pasivos_corrientes: 0,
    cuentas_pagar: 0,
    deuda_corto_plazo: 0,
    pasivos_no_corrientes: 0,
    patrimonio_neto: 0,
    burn_rate_mensual: 0,
    capital_solicitado: 0,
  });

  const [businessData, setBusinessData] = useState<BusinessModelData>({
    business_description: '',
    number_employees: 0,
    exporta: 'No',
    clientes: '',
    productos_servicios: '',
    problema: '',
    propuesta_valor: '',
    modelo_negocio: '',
    traccion: '',
    plan_crecimiento: '',
  });

  const [indicators, setIndicators] = useState<CalculatedIndicators | null>(null);
  const [overallScore, setOverallScore] = useState(0);

  const calculateIndicators = (financial: FinancialData, business: BusinessModelData): CalculatedIndicators => {
    const totalRevenue = financial.ventas_nacionales + financial.ventas_exportaciones;
    const grossProfit = totalRevenue - financial.costo_ventas;
    const ebitda = grossProfit - financial.gastos_operativos;
    
    return {
      ebitda,
      margen_bruto: totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0,
      margen_operativo: totalRevenue > 0 ? (ebitda / totalRevenue) * 100 : 0,
      razon_corriente: financial.pasivos_corrientes > 0 ? financial.activos_corrientes / financial.pasivos_corrientes : 0,
      deuda_patrimonio: financial.patrimonio_neto > 0 ? (financial.pasivos_corrientes + financial.pasivos_no_corrientes) / financial.patrimonio_neto : 0,
      roe: financial.patrimonio_neto > 0 ? (financial.utilidad_neta / financial.patrimonio_neto) * 100 : 0,
      roa: (financial.activos_corrientes + financial.activos_no_corrientes) > 0 ? (financial.utilidad_neta / (financial.activos_corrientes + financial.activos_no_corrientes)) * 100 : 0,
      runway: financial.burn_rate_mensual > 0 ? financial.efectivo_equivalentes / financial.burn_rate_mensual : 0,
      revenue_per_employee: business.number_employees > 0 ? totalRevenue / business.number_employees : 0,
      yoy_growth: financial.ingresos_anterior > 0 ? ((totalRevenue - financial.ingresos_anterior) / financial.ingresos_anterior) * 100 : 0,
      porcentaje_id: totalRevenue > 0 ? (financial.gasto_id / totalRevenue) * 100 : 0,
      porcentaje_exportaciones: totalRevenue > 0 ? (financial.ventas_exportaciones / totalRevenue) * 100 : 0,
      capex_ratio: totalRevenue > 0 ? (financial.capex / totalRevenue) * 100 : 0,
      cac: financial.clientes_nuevos_periodo > 0 ? financial.gasto_adquisicion_clientes / financial.clientes_nuevos_periodo : 0,
      churn: financial.clientes_inicio_periodo > 0 ? (financial.clientes_churn_periodo / financial.clientes_inicio_periodo) * 100 : 0,
      ltv_cac: 0, // Will be calculated based on LTV
      capital_gap: totalRevenue > 0 ? (financial.capital_solicitado / totalRevenue) * 100 : 0,
    };
  };

  const handleProcessFinancialData = async () => {
    setStatus('processing');
    
    // Calculate indicators
    const calculatedIndicators = calculateIndicators(financialData, businessData);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    // Calculate overall score based on indicators
    let score = 0;
    if (calculatedIndicators.ebitda > 0) score += 15;
    if (calculatedIndicators.margen_bruto > 30) score += 15;
    if (calculatedIndicators.runway > 12) score += 10;
    if (calculatedIndicators.yoy_growth > 15) score += 10;
    if (businessData.exporta === 'Sí') score += 8;
    if (businessData.number_employees >= 10 && businessData.number_employees <= 100) score += 10;
    if (calculatedIndicators.capital_gap <= 40) score += 12;
    score += Math.floor(Math.random() * 20); // Random component
    
    setIndicators(calculatedIndicators);
    setOverallScore(Math.min(score, 100));
    setStatus('completed');
    setCurrentSection('results');
  };

  const handleInputChange = (field: keyof FinancialData, value: any) => {
    setFinancialData(prev => ({ ...prev, [field]: value }));
  };

  const handleBusinessChange = (field: keyof BusinessModelData, value: any) => {
    setBusinessData(prev => ({ ...prev, [field]: value }));
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'green';
    if (score >= 60) return 'yellow';
    return 'red';
  };

  const getIndicatorStatus = (value: number, good: number, normal: number) => {
    if (value >= good) return 'good';
    if (value >= normal) return 'normal';
    return 'bad';
  };

  if (status === 'processing') {
    return (
      <div className="text-center py-12">
        <Loading text="AI está analizando sus datos financieros..." />
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 max-w-md mx-auto">
          <p className="text-blue-800 dark:text-blue-200 text-sm">
            Calculando indicadores financieros, evaluando modelo de negocio y generando scoring...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Analysis</h2>
        
        {/* Section Navigation */}
        <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setCurrentSection('financial')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              currentSection === 'financial'
                ? 'bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-300'
            }`}
          >
            📊 Financial
          </button>
          <button
            onClick={() => setCurrentSection('business')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              currentSection === 'business'
                ? 'bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-300'
            }`}
          >
            🏢 Business
          </button>
          {status === 'completed' && (
            <button
              onClick={() => setCurrentSection('results')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                currentSection === 'results'
                  ? 'bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              📈 Results
            </button>
          )}
        </div>
      </div>

      {currentSection === 'financial' && (
        <div className="space-y-6">
          {/* Report Details */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              📋 Report Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Moneda de Reporte *
                </label>
                <select
                  value={financialData.moneda_reporte}
                  onChange={(e) => handleInputChange('moneda_reporte', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="COP">COP</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Modelo de Ingresos *
                </label>
                <select
                  value={financialData.modelo_ingresos}
                  onChange={(e) => handleInputChange('modelo_ingresos', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="subscription">Suscripción</option>
                  <option value="transaccional">Transaccional</option>
                  <option value="mixto">Mixto</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Inicio del Periodo *
                </label>
                <input
                  type="date"
                  value={financialData.inicio_periodo}
                  onChange={(e) => handleInputChange('inicio_periodo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fin del Periodo *
                </label>
                <input
                  type="date"
                  value={financialData.fin_periodo}
                  onChange={(e) => handleInputChange('fin_periodo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Income Statement */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              💰 Income Statement ({financialData.moneda_reporte})
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ventas Nacionales
                </label>
                <input
                  type="number"
                  value={financialData.ventas_nacionales}
                  onChange={(e) => handleInputChange('ventas_nacionales', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ventas Exportaciones
                </label>
                <input
                  type="number"
                  value={financialData.ventas_exportaciones}
                  onChange={(e) => handleInputChange('ventas_exportaciones', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Costo de Ventas
                </label>
                <input
                  type="number"
                  value={financialData.costo_ventas}
                  onChange={(e) => handleInputChange('costo_ventas', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Gastos Operativos
                </label>
                <input
                  type="number"
                  value={financialData.gastos_operativos}
                  onChange={(e) => handleInputChange('gastos_operativos', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Capital Solicitado *
                </label>
                <input
                  type="number"
                  value={financialData.capital_solicitado}
                  onChange={(e) => handleInputChange('capital_solicitado', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Monto deseado de financiamiento"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Burn Rate Mensual
                </label>
                <input
                  type="number"
                  value={financialData.burn_rate_mensual}
                  onChange={(e) => handleInputChange('burn_rate_mensual', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Caja neta mensual gastada"
                />
              </div>
            </div>
          </div>

          <div className="text-center">
            <Button
              onClick={() => setCurrentSection('business')}
              variant="primary"
              size="large"
              disabled={!financialData.capital_solicitado}
            >
              Next: Business Model →
            </Button>
          </div>
        </div>
      )}

      {currentSection === 'business' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            🏢 Business Model Information
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descripción del Negocio * (máx. 200 palabras)
              </label>
              <textarea
                value={businessData.business_description}
                onChange={(e) => handleBusinessChange('business_description', e.target.value)}
                rows={3}
                maxLength={1000}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Startup agrotech que desarrolla sensores de riego inteligente..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Número de Empleados *
                </label>
                <input
                  type="number"
                  value={businessData.number_employees}
                  onChange={(e) => handleBusinessChange('number_employees', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="25"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ¿Exporta? *
                </label>
                <select
                  value={businessData.exporta}
                  onChange={(e) => handleBusinessChange('exporta', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="No">No</option>
                  <option value="Sí">Sí</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Propuesta de Valor * (debe ser medible y diferenciada)
              </label>
              <textarea
                value={businessData.propuesta_valor}
                onChange={(e) => handleBusinessChange('propuesta_valor', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Reducimos 30% el consumo de agua en cultivos gracias a IA..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tracción * (validaciones de mercado, ventas o pilotos)
              </label>
              <textarea
                value={businessData.traccion}
                onChange={(e) => handleBusinessChange('traccion', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="+100 clientes activos en 3 departamentos..."
              />
            </div>
          </div>

          <div className="flex justify-between">
            <Button
              onClick={() => setCurrentSection('financial')}
              variant="outline"
            >
              ← Back to Financial
            </Button>
            <Button
              onClick={handleProcessFinancialData}
              variant="primary"
              disabled={
                !businessData.business_description || 
                !businessData.propuesta_valor || 
                !financialData.capital_solicitado
              }
            >
              🤖 Generate AI Scoring
            </Button>
          </div>
        </div>
      )}

      {currentSection === 'results' && indicators && (
        <div className="space-y-6">
          {/* Overall Score */}
          <div className={`rounded-lg p-6 border ${
            overallScore >= 80 
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
              : overallScore >= 60
              ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700'
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
          }`}>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                Financial Score: {overallScore}/100
              </h3>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-4 mb-4">
                <div 
                  className={`h-4 rounded-full transition-all duration-1000 ${
                    overallScore >= 80 ? 'bg-green-600' : overallScore >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                  }`}
                  style={{ width: `${overallScore}%` }}
                />
              </div>
              <p className="text-gray-700 dark:text-gray-300">
                Funding Recommendation: <strong>
                  {overallScore >= 80 ? 'Highly Recommended' : 
                   overallScore >= 60 ? 'Recommended with Conditions' : 'Requires Improvement'}
                </strong>
              </p>
            </div>
          </div>

          {/* Key Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">EBITDA</h4>
              <div className="text-xl font-bold text-purple-600">{indicators.ebitda.toLocaleString()}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {indicators.ebitda > 0 ? '✓ Positivo' : '⚠ Negativo'}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Margen Bruto</h4>
              <div className="text-xl font-bold text-blue-600">{indicators.margen_bruto.toFixed(1)}%</div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {indicators.margen_bruto > 30 ? '✓ Excelente' : indicators.margen_bruto > 20 ? '○ Normal' : '⚠ Bajo'}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Runway</h4>
              <div className="text-xl font-bold text-orange-600">{indicators.runway.toFixed(0)} meses</div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {indicators.runway > 12 ? '✓ Seguro' : indicators.runway > 6 ? '○ Moderado' : '⚠ Riesgo'}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">YoY Growth</h4>
              <div className="text-xl font-bold text-green-600">{indicators.yoy_growth.toFixed(1)}%</div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {indicators.yoy_growth > 15 ? '✓ Alto' : indicators.yoy_growth > 5 ? '○ Normal' : '⚠ Bajo'}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Capital Gap</h4>
              <div className="text-xl font-bold text-purple-600">{indicators.capital_gap.toFixed(1)}%</div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {indicators.capital_gap <= 20 ? '✓ Razonable' : indicators.capital_gap <= 40 ? '○ Aceptable' : '⚠ Alto'}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Revenue/Employee</h4>
              <div className="text-xl font-bold text-indigo-600">${(indicators.revenue_per_employee/1000).toFixed(0)}k</div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {indicators.revenue_per_employee > 100000 ? '✓ Excelente' : indicators.revenue_per_employee > 50000 ? '○ Normal' : '⚠ Bajo'}
              </p>
            </div>
          </div>

          {/* Action Button */}
          <div className="text-center">
            <Button
              onClick={() => {
                setStatus('idle');
                setCurrentSection('financial');
              }}
              variant="outline"
            >
              🔄 New Analysis
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnterpriseFinancial;

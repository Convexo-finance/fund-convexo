import React from 'react';
import { CalculatedIndicators, FinancialIndicator, IndicatorStatus } from '../../types/onboarding';

interface IndicatorsDisplayProps {
  indicators: CalculatedIndicators;
  currency?: string;
}

const IndicatorsDisplay: React.FC<IndicatorsDisplayProps> = ({ 
  indicators, 
  currency = 'USD' 
}) => {
  const getStatusColor = (status: IndicatorStatus): string => {
    switch (status) {
      case 'good': return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'normal': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'bad': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800';
    }
  };

  const getStatusIcon = (status: IndicatorStatus): string => {
    switch (status) {
      case 'good': return '✅';
      case 'normal': return '⚠️';
      case 'bad': return '❌';
      default: return '⚪';
    }
  };

  const getStatusText = (status: IndicatorStatus): string => {
    switch (status) {
      case 'good': return 'Excelente';
      case 'normal': return 'Normal';
      case 'bad': return 'Requiere Atención';
      default: return 'Sin Datos';
    }
  };

  const formatValue = (indicator: FinancialIndicator, key: string): string => {
    const { value } = indicator;
    
    // Currency values
    if (['ebitda', 'revenue_per_employee', 'cac', 'ltv_sub', 'ltv_tx'].includes(key)) {
      return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
    }
    
    // Percentage values
    if (['margen_bruto', 'margen_operativo', 'roe', 'roa', 'yoy_growth', 'porcentaje_id', 'porcentaje_exportaciones', 'capex_ratio', 'churn', 'capital_gap'].includes(key)) {
      return new Intl.NumberFormat('es-ES', {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 2
      }).format(value);
    }
    
    // Ratio values
    if (['razon_corriente', 'deuda_patrimonio', 'ltv_cac'].includes(key)) {
      return value.toFixed(2) + 'x';
    }
    
    // Time periods
    if (key === 'runway') {
      return `${Math.round(value)} meses`;
    }
    
    // Default formatting
    return new Intl.NumberFormat('es-ES', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value);
  };

  const getRecommendation = (indicator: FinancialIndicator, key: string): string => {
    switch (indicator.status) {
      case 'good':
        return 'Mantener estos niveles excelentes.';
      case 'normal':
        switch (key) {
          case 'margen_bruto': return 'Considerar optimizar costos de producción.';
          case 'margen_operativo': return 'Revisar eficiencia operativa.';
          case 'razon_corriente': return 'Monitorear liquidez de corto plazo.';
          case 'deuda_patrimonio': return 'Considerar reducir apalancamiento.';
          case 'runway': return 'Planificar fuentes de financiamiento.';
          case 'yoy_growth': return 'Buscar oportunidades de aceleración.';
          case 'churn': return 'Implementar estrategias de retención.';
          default: return 'Monitorear y buscar mejoras.';
        }
      case 'bad':
        switch (key) {
          case 'ebitda': return 'Urgente: revisar estructura de costos.';
          case 'margen_bruto': return 'Crítico: optimizar pricing y costos.';
          case 'razon_corriente': return 'Riesgo de liquidez: mejorar capital de trabajo.';
          case 'runway': return 'Crítico: asegurar financiamiento inmediato.';
          case 'ltv_cac': return 'Modelo no sostenible: reducir CAC o aumentar LTV.';
          default: return 'Requiere atención inmediata.';
        }
      default:
        return 'Datos insuficientes para análisis.';
    }
  };

  const indicatorItems = [
    { key: 'ebitda', title: 'EBITDA', category: 'Rentabilidad' },
    { key: 'margen_bruto', title: 'Margen Bruto', category: 'Rentabilidad' },
    { key: 'margen_operativo', title: 'Margen Operativo', category: 'Rentabilidad' },
    { key: 'razon_corriente', title: 'Razón Corriente', category: 'Liquidez' },
    { key: 'deuda_patrimonio', title: 'Deuda/Patrimonio', category: 'Apalancamiento' },
    { key: 'roe', title: 'ROE', category: 'Rentabilidad' },
    { key: 'roa', title: 'ROA', category: 'Eficiencia' },
    { key: 'runway', title: 'Runway', category: 'Liquidez' },
    { key: 'revenue_per_employee', title: 'Ingresos por Empleado', category: 'Productividad' },
    { key: 'yoy_growth', title: 'Crecimiento YoY', category: 'Crecimiento' },
    { key: 'porcentaje_id', title: '% I+D', category: 'Innovación' },
    { key: 'porcentaje_exportaciones', title: '% Exportaciones', category: 'Diversificación' },
    { key: 'capex_ratio', title: 'CAPEX Ratio', category: 'Inversión' },
    { key: 'cac', title: 'CAC', category: 'Marketing' },
    { key: 'churn', title: 'Churn Rate', category: 'Retención' },
    { key: 'ltv_cac', title: 'LTV/CAC', category: 'Modelo de Negocio' },
    { key: 'capital_gap', title: 'Capital Gap', category: 'Financiamiento' }
  ];

  // Group indicators by category
  const categories = indicatorItems.reduce((acc, item) => {
    const indicator = indicators[item.key as keyof CalculatedIndicators];
    if (indicator) {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push({ ...item, indicator });
    }
    return acc;
  }, {} as Record<string, Array<{ key: string; title: string; category: string; indicator: FinancialIndicator }>>);

  // Calculate overall score
  const allIndicators = Object.values(indicators).filter(Boolean) as FinancialIndicator[];
  const scoreMap = { 'good': 100, 'normal': 70, 'bad': 30 };
  const overallScore = allIndicators.length > 0 
    ? Math.round(allIndicators.reduce((acc, ind) => acc + scoreMap[ind.status], 0) / allIndicators.length)
    : 0;

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreGrade = (score: number): string => {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Análisis Financiero AI
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Indicadores clave calculados automáticamente para scoring crediticio
        </p>
      </div>

      {/* Overall Score */}
      <div className="mb-8 bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold mb-2">Score General Convexo</h3>
            <p className="text-purple-100">
              Basado en {allIndicators.length} indicadores financieros clave
            </p>
          </div>
          <div className="text-center">
            <div className={`text-4xl font-bold ${getScoreColor(overallScore)}`}>
              {overallScore}
            </div>
            <div className="text-lg font-medium text-purple-100">
              Grado {getScoreGrade(overallScore)}
            </div>
          </div>
        </div>
      </div>

      {/* Indicators by Category */}
      <div className="space-y-8">
        {Object.entries(categories).map(([category, items]) => (
          <div key={category} className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {category}
              </h3>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map(({ key, title, indicator }) => (
                  <div
                    key={key}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${getStatusColor(indicator.status)}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{title}</h4>
                      <span className="text-lg">{getStatusIcon(indicator.status)}</span>
                    </div>
                    
                    <div className="mb-2">
                      <div className="text-2xl font-bold">
                        {formatValue(indicator, key)}
                      </div>
                      <div className="text-xs font-medium">
                        {getStatusText(indicator.status)}
                      </div>
                    </div>
                    
                    <div className="text-xs mb-3 opacity-90">
                      {indicator.description}
                    </div>
                    
                    <div className="text-xs font-medium">
                      💡 {getRecommendation(indicator, key)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* LTV Indicators (conditional) */}
      {(indicators.ltv_sub || indicators.ltv_tx) && (
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4">
            📊 Análisis de Valor de Vida del Cliente (LTV)
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {indicators.ltv_sub && (
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  LTV Suscripción
                </h4>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {formatValue(indicators.ltv_sub, 'ltv_sub')}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {indicators.ltv_sub.description}
                </p>
              </div>
            )}
            
            {indicators.ltv_tx && (
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  LTV Transaccional
                </h4>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {formatValue(indicators.ltv_tx, 'ltv_tx')}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {indicators.ltv_tx.description}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Summary and Next Steps */}
      <div className="mt-8 bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          📈 Resumen Ejecutivo
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl mb-2">
              {allIndicators.filter(i => i.status === 'good').length}
            </div>
            <div className="text-sm font-medium text-green-600 dark:text-green-400">
              Indicadores Excelentes
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl mb-2">
              {allIndicators.filter(i => i.status === 'normal').length}
            </div>
            <div className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
              Indicadores Normales
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl mb-2">
              {allIndicators.filter(i => i.status === 'bad').length}
            </div>
            <div className="text-sm font-medium text-red-600 dark:text-red-400">
              Requieren Atención
            </div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-white dark:bg-gray-700 rounded-lg">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
            🎯 Recomendaciones Prioritarias
          </h4>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            {allIndicators
              .filter(i => i.status === 'bad')
              .slice(0, 3)
              .map((indicator, index) => {
                const item = indicatorItems.find(item => 
                  indicators[item.key as keyof CalculatedIndicators] === indicator
                );
                return (
                  <li key={index}>
                    • <strong>{item?.title}:</strong> {getRecommendation(indicator, item?.key || '')}
                  </li>
                );
              })}
            {allIndicators.filter(i => i.status === 'bad').length === 0 && (
              <li>• Excelente performance financiera. Continuar con las estrategias actuales.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default IndicatorsDisplay;

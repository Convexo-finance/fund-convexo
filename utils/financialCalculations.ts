import { FinancialData, BusinessModel, CalculatedIndicators, FinancialIndicator, IndicatorStatus } from '../types/onboarding';

export class FinancialCalculator {
  private financial: FinancialData;
  private business: BusinessModel;

  constructor(financial: FinancialData, business: BusinessModel) {
    this.financial = financial;
    this.business = business;
  }

  calculateAll(): CalculatedIndicators {
    const totalRevenue = this.getTotalRevenue();
    const grossProfit = this.getGrossProfit();
    const operatingProfit = this.getOperatingProfit();
    const totalAssets = this.getTotalAssets();
    const totalLiabilities = this.getTotalLiabilities();

    return {
      ebitda: this.calculateEBITDA(operatingProfit),
      margen_bruto: this.calculateGrossMargin(grossProfit, totalRevenue),
      margen_operativo: this.calculateOperatingMargin(operatingProfit, totalRevenue),
      razon_corriente: this.calculateCurrentRatio(),
      deuda_patrimonio: this.calculateDebtToEquity(totalLiabilities),
      roe: this.calculateROE(),
      roa: this.calculateROA(totalAssets),
      runway: this.calculateRunway(),
      revenue_per_employee: this.calculateRevenuePerEmployee(totalRevenue),
      yoy_growth: this.calculateYoYGrowth(totalRevenue),
      porcentaje_id: this.calculateRnDPercentage(totalRevenue),
      porcentaje_exportaciones: this.calculateExportPercentage(totalRevenue),
      capex_ratio: this.calculateCapexRatio(totalRevenue),
      cac: this.calculateCAC(),
      churn: this.calculateChurn(),
      ltv_sub: this.financial.report_details?.modelo_ingresos === 'subscription' ? this.calculateLTVSubscription() : undefined,
      ltv_tx: this.financial.report_details?.modelo_ingresos === 'transaccional' ? this.calculateLTVTransactional() : undefined,
      ltv_cac: this.calculateLTVCAC(),
      capital_gap: this.calculateCapitalGap(totalRevenue)
    };
  }

  private getTotalRevenue(): number {
    return (this.financial.income_statement?.ventas_nacionales || 0) + 
           (this.financial.income_statement?.ventas_exportaciones || 0);
  }

  private getGrossProfit(): number {
    return this.getTotalRevenue() - (this.financial.income_statement?.costo_ventas || 0);
  }

  private getOperatingProfit(): number {
    return this.getGrossProfit() - (this.financial.income_statement?.gastos_operativos || 0);
  }

  private getTotalAssets(): number {
    return (this.financial.balance_sheet?.activos_corrientes || 0) + 
           (this.financial.balance_sheet?.activos_no_corrientes || 0);
  }

  private getTotalLiabilities(): number {
    return (this.financial.balance_sheet?.pasivos_corrientes || 0) + 
           (this.financial.balance_sheet?.pasivos_no_corrientes || 0);
  }

  private getIndicatorStatus(value: number, good: number, normal: number, isPercentage = false): IndicatorStatus {
    if (isPercentage) {
      value = value * 100; // Convert to percentage for comparison
    }
    
    if (value >= good) return 'good';
    if (value >= normal) return 'normal';
    return 'bad';
  }

  private createIndicator(value: number, description: string, goodThreshold: number, normalThreshold: number, isPercentage = false): FinancialIndicator {
    return {
      value,
      status: this.getIndicatorStatus(value, goodThreshold, normalThreshold, isPercentage),
      description
    };
  }

  calculateEBITDA(operatingProfit: number): FinancialIndicator {
    // EBITDA = Operating Profit + Depreciation + Amortization
    // For simplicity, we'll use operating profit as proxy since we don't have depreciation data
    const ebitda = operatingProfit;
    
    return this.createIndicator(
      ebitda,
      "Utilidad operativa antes de intereses, impuestos, depreciación y amortización",
      0, // Positive is good
      0  // Positive is normal
    );
  }

  calculateGrossMargin(grossProfit: number, totalRevenue: number): FinancialIndicator {
    const margin = totalRevenue > 0 ? grossProfit / totalRevenue : 0;
    
    return this.createIndicator(
      margin,
      "Porcentaje de ingresos que queda después del costo de ventas",
      0.30, // >30% is good
      0.20, // 20-30% is normal
      true
    );
  }

  calculateOperatingMargin(operatingProfit: number, totalRevenue: number): FinancialIndicator {
    const margin = totalRevenue > 0 ? operatingProfit / totalRevenue : 0;
    
    return this.createIndicator(
      margin,
      "Porcentaje de ingresos que queda después de gastos operativos",
      0.15, // >15% is good
      0.05, // 5-15% is normal
      true
    );
  }

  calculateCurrentRatio(): FinancialIndicator {
    const currentAssets = this.financial.balance_sheet?.activos_corrientes || 0;
    const currentLiabilities = this.financial.balance_sheet?.pasivos_corrientes || 0;
    const ratio = currentLiabilities > 0 ? currentAssets / currentLiabilities : 0;
    
    return this.createIndicator(
      ratio,
      "Capacidad de pagar deudas de corto plazo",
      1.5, // >1.5 is good
      1.0  // 1.0-1.5 is normal
    );
  }

  calculateDebtToEquity(totalLiabilities: number): FinancialIndicator {
    const equity = this.financial.balance_sheet?.patrimonio_neto || 0;
    const ratio = equity > 0 ? totalLiabilities / equity : 0;
    
    // Note: For debt/equity, lower is better, so we invert the logic
    const status: IndicatorStatus = ratio < 1.0 ? 'good' : ratio <= 2.0 ? 'normal' : 'bad';
    
    return {
      value: ratio,
      status,
      description: "Nivel de apalancamiento financiero"
    };
  }

  calculateROE(): FinancialIndicator {
    const netIncome = this.financial.income_statement?.utilidad_neta || 0;
    const equity = this.financial.balance_sheet?.patrimonio_neto || 0;
    const roe = equity > 0 ? netIncome / equity : 0;
    
    return this.createIndicator(
      roe,
      "Retorno generado sobre el patrimonio de los socios",
      0.12, // >12% is good
      0.06, // 6-12% is normal
      true
    );
  }

  calculateROA(totalAssets: number): FinancialIndicator {
    const netIncome = this.financial.income_statement?.utilidad_neta || 0;
    const roa = totalAssets > 0 ? netIncome / totalAssets : 0;
    
    return this.createIndicator(
      roa,
      "Eficiencia en el uso de activos para generar utilidades",
      0.08, // >8% is good
      0.03, // 3-8% is normal
      true
    );
  }

  calculateRunway(): FinancialIndicator {
    const cash = this.financial.balance_sheet?.efectivo_equivalentes || 0;
    const burnRate = this.financial.operations?.burn_rate_mensual || 0;
    const runway = burnRate > 0 ? cash / burnRate : 0;
    
    return this.createIndicator(
      runway,
      "Meses de operación con efectivo actual",
      12, // >12 months is good
      6   // 6-12 months is normal
    );
  }

  calculateRevenuePerEmployee(totalRevenue: number): FinancialIndicator {
    const employees = this.business.number_employees || 1;
    const revenuePerEmployee = totalRevenue / employees;
    
    return this.createIndicator(
      revenuePerEmployee,
      "Productividad laboral medida en ingresos por empleado",
      100000, // >100k is good
      50000   // 50k-100k is normal
    );
  }

  calculateYoYGrowth(totalRevenue: number): FinancialIndicator {
    const previousRevenue = this.financial.income_statement?.ingresos_anterior || 0;
    const growth = previousRevenue > 0 ? (totalRevenue - previousRevenue) / previousRevenue : 0;
    
    return this.createIndicator(
      growth,
      "Crecimiento de ingresos año sobre año",
      0.15, // >15% is good
      0.05, // 5-15% is normal
      true
    );
  }

  calculateRnDPercentage(totalRevenue: number): FinancialIndicator {
    const rdExpense = this.financial.income_statement?.gasto_id || 0;
    const percentage = totalRevenue > 0 ? rdExpense / totalRevenue : 0;
    
    // For R&D, optimal range is 5-15%
    const status: IndicatorStatus = 
      percentage >= 0.05 && percentage <= 0.15 ? 'good' :
      percentage >= 0.01 && percentage < 0.05 ? 'normal' :
      percentage > 0.15 ? 'normal' : 'bad';
    
    return {
      value: percentage,
      status,
      description: "Inversión en innovación como porcentaje de ingresos"
    };
  }

  calculateExportPercentage(totalRevenue: number): FinancialIndicator {
    const exports = this.financial.income_statement?.ventas_exportaciones || 0;
    const percentage = totalRevenue > 0 ? exports / totalRevenue : 0;
    
    return this.createIndicator(
      percentage,
      "Diversificación internacional de ingresos",
      0.20, // >20% is good
      0.10, // 10-20% is normal
      true
    );
  }

  calculateCapexRatio(totalRevenue: number): FinancialIndicator {
    const capex = this.financial.income_statement?.capex || 0;
    const percentage = totalRevenue > 0 ? capex / totalRevenue : 0;
    
    // For CAPEX, optimal range is 5-15%
    const status: IndicatorStatus = 
      percentage >= 0.05 && percentage <= 0.15 ? 'good' :
      percentage < 0.05 ? 'normal' :
      percentage > 0.20 ? 'normal' : 'bad';
    
    return {
      value: percentage,
      status,
      description: "Inversión en activos productivos como porcentaje de ingresos"
    };
  }

  calculateCAC(): FinancialIndicator {
    const acquisitionCost = this.financial.commercial?.gasto_adquisicion_clientes || 0;
    const newCustomers = this.financial.commercial?.clientes_nuevos_periodo || 1;
    const cac = acquisitionCost / newCustomers;
    
    // For CAC, lower is better (we don't have absolute thresholds, so we use relative assessment)
    return {
      value: cac,
      status: 'normal', // Would need industry benchmarks for proper assessment
      description: "Costo promedio para adquirir un nuevo cliente"
    };
  }

  calculateChurn(): FinancialIndicator {
    const churnedCustomers = this.financial.commercial?.clientes_churn_periodo || 0;
    const startingCustomers = this.financial.commercial?.clientes_inicio_periodo || 1;
    const churnRate = churnedCustomers / startingCustomers;
    
    // Convert to monthly churn rate if needed
    let monthlyChurn = churnRate;
    if (this.financial.commercial?.periodicidad === 'anual') {
      monthlyChurn = churnRate / 12;
    } else if (this.financial.commercial?.periodicidad === 'trimestral') {
      monthlyChurn = churnRate / 3;
    }
    
    // For churn, lower is better
    const status: IndicatorStatus = monthlyChurn < 0.03 ? 'good' : monthlyChurn <= 0.05 ? 'normal' : 'bad';
    
    return {
      value: monthlyChurn,
      status,
      description: "Tasa mensual de pérdida de clientes"
    };
  }

  calculateLTVSubscription(): FinancialIndicator {
    const mrr = this.financial.commercial?.ingresos_recurrentes_mensuales || 0;
    const activeCustomers = this.financial.commercial?.clientes_activos_promedio || 1;
    const arpu = mrr / activeCustomers; // Average Revenue Per User
    
    const churnedCustomers = this.financial.commercial?.clientes_churn_periodo || 0;
    const startingCustomers = this.financial.commercial?.clientes_inicio_periodo || 1;
    const monthlyChurnRate = (churnedCustomers / startingCustomers) / 
      (this.financial.commercial?.periodicidad === 'anual' ? 12 : 
       this.financial.commercial?.periodicidad === 'trimestral' ? 3 : 1);
    
    const ltv = monthlyChurnRate > 0 ? arpu / monthlyChurnRate : 0;
    
    const cac = this.calculateCAC().value;
    const status: IndicatorStatus = ltv > cac * 3 ? 'good' : ltv > cac * 2 ? 'normal' : 'bad';
    
    return {
      value: ltv,
      status,
      description: "Valor de vida del cliente en modelo de suscripción"
    };
  }

  calculateLTVTransactional(): FinancialIndicator {
    const ticketPromedio = this.financial.commercial?.ticket_promedio || 0;
    const frecuenciaAnual = this.financial.commercial?.frecuencia_compra_anual || 0;
    const aniosRetencion = this.financial.commercial?.anios_retencion || 0;
    
    const ltv = ticketPromedio * frecuenciaAnual * aniosRetencion;
    
    const cac = this.calculateCAC().value;
    const status: IndicatorStatus = ltv > cac * 3 ? 'good' : ltv > cac * 2 ? 'normal' : 'bad';
    
    return {
      value: ltv,
      status,
      description: "Valor de vida del cliente en modelo transaccional"
    };
  }

  calculateLTVCAC(): FinancialIndicator {
    const cac = this.calculateCAC().value;
    let ltv = 0;
    
    if (this.financial.report_details?.modelo_ingresos === 'subscription') {
      ltv = this.calculateLTVSubscription()?.value || 0;
    } else if (this.financial.report_details?.modelo_ingresos === 'transaccional') {
      ltv = this.calculateLTVTransactional()?.value || 0;
    }
    
    const ratio = cac > 0 ? ltv / cac : 0;
    
    return this.createIndicator(
      ratio,
      "Relación entre valor de vida del cliente y costo de adquisición",
      3, // >3 is good
      2  // 2-3 is normal
    );
  }

  calculateCapitalGap(totalRevenue: number): FinancialIndicator {
    // This would typically be the requested investment amount vs revenue
    // Since we don't have requested amount, we'll use a placeholder calculation
    // In real implementation, this would come from the investment request
    const assumedRequest = totalRevenue * 0.3; // Assuming 30% of revenue as placeholder
    const percentage = totalRevenue > 0 ? assumedRequest / totalRevenue : 0;
    
    // For capital gap, ≤20% is ideal, 20-40% is normal, >40% is high
    const status: IndicatorStatus = percentage <= 0.20 ? 'good' : percentage <= 0.40 ? 'normal' : 'bad';
    
    return {
      value: percentage,
      status,
      description: "Razonabilidad de la solicitud de capital vs ingresos"
    };
  }
}

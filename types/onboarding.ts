// Convexo Onboarding Types

// Profile Types
export interface UserProfile {
  admin_user: string;
  primary_email: string;
  primary_phone: string;
  brand_logo?: File;
}

// KYB Types
export type LegalForm = 'SAS' | 'LLC' | 'C-Corp' | 'S-Corp' | 'GmbH' | 'Ltd' | 'PLC' | 'Sole Proprietorship' | 'Partnership';
export type Country = 'US' | 'CO' | 'MX' | 'BR' | 'CL' | 'GB' | 'SG' | 'HK' | 'DE' | 'FR' | 'ES';
export type IdType = 'CC' | 'DNI' | 'Passport' | 'SSN' | 'Other';

export interface Company {
  legal_name: string;
  legal_form: LegalForm;
  registration_number: string;
  tax_id: string;
  incorporation_date: string;
  website?: string;
  industry_code?: string;
  country: Country;
  state_province?: string;
  city: string;
  address_line1: string;
  address_line2?: string;
  postal_code?: string;
  proof_of_address: File;
}

export interface Representative {
  rep_full_name: string;
  rep_role: string;
  rep_id_type: IdType;
  rep_id_number: string;
  rep_dob: string;
  rep_nationality: Country;
  rep_email: string;
  rep_phone: string;
  rep_is_pep: boolean;
  rep_authority_document?: File;
  rep_id_document: File;
  rep_proof_of_address: File;
}

export interface Shareholder {
  name: string;
  type: 'Individual' | 'Corporate';
  percent: number;
}

export interface UBO {
  name: string;
  percent: number;
  country: Country;
}

export interface Ownership {
  shareholders: Shareholder[];
  ubos: UBO[];
  cap_table_document?: File;
}

export interface KYBDocuments {
  fs_income_statement_pdf: File;
  fs_balance_sheet_pdf: File;
  bank_statements: File;
  tax_return_last_fy: File;
  kyb_incorp_cert: File;
  kyb_bylaws: File;
  kyb_shareholder_register: File;
  kyb_board_resolution: File;
  kyb_tax_certificate?: File;
  kyb_aml_policy?: File;
  kyb_tax_form?: File;
  so_funds_evidence?: File;
}

export interface KYBData {
  company: Company;
  representative: Representative;
  ownership: Ownership;
  documents: KYBDocuments;
}

// Financial Data Types
export type Currency = 'USD' | 'EUR' | 'COP' | 'MXN' | 'BRL' | 'ARS';
export type RevenueModel = 'subscription' | 'transaccional' | 'mixto';
export type Periodicity = 'mensual' | 'trimestral' | 'anual';

export interface ReportDetails {
  moneda_reporte: Currency;
  modelo_ingresos: RevenueModel;
  inicio_periodo: string;
  fin_periodo: string;
}

export interface IncomeStatement {
  ventas_nacionales: number;
  ventas_exportaciones: number;
  ingresos_anterior?: number;
  costo_ventas: number;
  gastos_operativos: number;
  gasto_id: number;
  capex: number;
  utilidad_neta: number;
}

export interface Commercial {
  periodicidad: Periodicity;
  gasto_adquisicion_clientes: number;
  clientes_nuevos_periodo: number;
  clientes_inicio_periodo: number;
  clientes_churn_periodo: number;
  clientes_fin_periodo: number;
  ingresos_recurrentes_mensuales?: number; // Solo para suscripción
  clientes_activos_promedio?: number; // Solo para suscripción
  ticket_promedio?: number; // Solo para transaccional
  frecuencia_compra_anual?: number; // Solo para transaccional
  anios_retencion?: number; // Solo para transaccional
}

export interface BalanceSheet {
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
}

export interface Operations {
  burn_rate_mensual: number;
}

export interface FinancialData {
  report_details: ReportDetails;
  income_statement: IncomeStatement;
  commercial: Commercial;
  balance_sheet: BalanceSheet;
  operations: Operations;
}

// Financial Indicators Types
export type IndicatorStatus = 'good' | 'normal' | 'bad';

export interface FinancialIndicator {
  value: number;
  status: IndicatorStatus;
  description: string;
}

export interface CalculatedIndicators {
  ebitda: FinancialIndicator;
  margen_bruto: FinancialIndicator;
  margen_operativo: FinancialIndicator;
  razon_corriente: FinancialIndicator;
  deuda_patrimonio: FinancialIndicator;
  roe: FinancialIndicator;
  roa: FinancialIndicator;
  runway: FinancialIndicator;
  revenue_per_employee: FinancialIndicator;
  yoy_growth: FinancialIndicator;
  porcentaje_id: FinancialIndicator;
  porcentaje_exportaciones: FinancialIndicator;
  capex_ratio: FinancialIndicator;
  cac: FinancialIndicator;
  churn: FinancialIndicator;
  ltv_sub?: FinancialIndicator;
  ltv_tx?: FinancialIndicator;
  ltv_cac: FinancialIndicator;
  capital_gap: FinancialIndicator;
}

// Business Model Types
export interface BusinessModel {
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

// Payments Types
export type AccountCurrency = 'USD' | 'EUR' | 'COP' | 'MXN' | 'BRL' | 'ARS';

export interface BankingInfo {
  bank_name: string;
  bank_country: Country;
  account_holder_name: string;
  account_number: string;
  routing_number?: string;
  swift_bic?: string;
  account_currency: AccountCurrency;
  bank_letter?: File;
}

export interface CryptoInfo {
  evm_address: string;
}

export interface PaymentData {
  banking: BankingInfo;
  crypto: CryptoInfo;
}

// Legal Consent Types
export interface LegalConsent {
  consent_data_processing: boolean;
  consent_aml_screening: boolean;
  agree_terms: boolean;
  electronic_signature: string;
}

// Complete Onboarding Data
export interface OnboardingData {
  profile: UserProfile;
  kyb: KYBData;
  financial: FinancialData;
  business_model: BusinessModel;
  payments: PaymentData;
  consent: LegalConsent;
  indicators?: CalculatedIndicators;
}

// Form Step Types
export type OnboardingStep = 'profile' | 'kyb' | 'financial' | 'business_model' | 'payments' | 'consent' | 'review';

export interface StepStatus {
  completed: boolean;
  valid: boolean;
  errors?: string[];
}

export interface OnboardingState {
  currentStep: OnboardingStep;
  data: Partial<OnboardingData>;
  stepStatuses: Record<OnboardingStep, StepStatus>;
  isSubmitting: boolean;
  submissionError?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface SumsubVerificationResult {
  reviewId: string;
  reviewStatus: 'init' | 'pending' | 'completed' | 'onHold';
  reviewResult?: {
    reviewAnswer: 'GREEN' | 'RED' | 'YELLOW';
    clientComment?: string;
    moderationComment?: string;
    rejectLabels?: string[];
  };
}

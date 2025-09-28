// Funding Module Types

export type TransactionType = 'cashin' | 'cashout';

export type SupportedAsset = 'USDC' | 'COP' | 'USD' | 'ETH' | 'BTC';

export interface ExchangeRate {
  rate: number;
  timestamp: number;
  source: string;
  adjustedRate?: number; // Rate after applying fees/margins
}

export interface FundingTransaction {
  id: string;
  type: TransactionType;
  cantidad: number; // Amount
  assetBuy: SupportedAsset;
  assetSell: SupportedAsset;
  rate: number;
  adjustedRate: number; // Rate after margin
  totalReceived: number;
  totalSent: number;
  fee: number;
  feePercentage: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  timestamp: number;
  userAddress?: string;
  walletAddress?: string;
  transactionHash?: string;
  notes?: string;
}

export interface FundingRequest {
  type: TransactionType;
  cantidad: number;
  assetBuy: SupportedAsset;
  assetSell: SupportedAsset;
  userWallet?: string;
  notes?: string;
}

export interface FundingQuote {
  type: TransactionType;
  cantidad: number;
  assetBuy: SupportedAsset;
  assetSell: SupportedAsset;
  rate: number;
  adjustedRate: number;
  totalReceived: number;
  totalSent: number;
  fee: number;
  feePercentage: number;
  validUntil: number; // Timestamp when quote expires
  margin: number; // Margin applied (e.g., -2% for cashout)
}

export interface RateResponse {
  success: boolean;
  rate?: number;
  error?: string;
  source: string;
  timestamp: number;
}

export interface FundingState {
  currentTransaction: FundingTransaction | null;
  quote: FundingQuote | null;
  isLoading: boolean;
  error: string | null;
  exchangeRate: ExchangeRate | null;
  lastRateUpdate: number;
}

export interface AssetInfo {
  symbol: SupportedAsset;
  name: string;
  decimals: number;
  icon: string;
  isStablecoin: boolean;
  isFiat: boolean;
  contractAddress?: string;
  network?: string;
}

// API Response types
export interface CreateTransactionResponse {
  success: boolean;
  transaction?: FundingTransaction;
  quote?: FundingQuote;
  error?: string;
}

export interface GetRateResponse {
  success: boolean;
  data?: {
    rate: number;
    timestamp: number;
    source: string;
  };
  error?: string;
}

// Form validation types
export interface FundingFormData {
  type: TransactionType;
  cantidad: string;
  assetBuy: SupportedAsset;
  assetSell: SupportedAsset;
  walletAddress?: string;
  acceptTerms: boolean;
}

export interface FundingFormErrors {
  cantidad?: string;
  assetBuy?: string;
  assetSell?: string;
  walletAddress?: string;
  acceptTerms?: string;
  general?: string;
}

// Wallet types
export interface Wallet {
  address: string;
  chainId?: string | number;  // Support both string and number for chainId
  walletClientType?: string;
}

// Balance types
export interface TokenBalance {
  ethBalance: string;
  uscBalance: string;
  isMock?: boolean;
}

// User types
export interface UserInfo {
  id: string;
  email?: {
    address: string;
    verified: boolean;
  };
  phone?: {
    number: string;
    verified: boolean;
  };
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface WalletResponse {
  userId: string;
  walletAddress: string;
}

export interface BalanceResponse {
  address: string;
  balances: TokenBalance;
} 
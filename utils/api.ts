import { ApiResponse, BalanceResponse } from '@/types/index';
// formatAddress function is now defined locally

/**
 * Generic function to fetch data from API endpoints
 */
export async function fetchApi<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(endpoint, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'An error occurred');
    }
    
    return data as ApiResponse<T>;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

/**
 * Create wallet for user
 */
export async function createWallet(userId: string) {
  return fetchApi('/api/create-wallet', {
    method: 'POST',
    body: JSON.stringify({ userId }),
  });
}

/**
 * Get wallet balances
 */
export async function getWalletBalances(address: string) {
  return fetchApi<BalanceResponse>(`/api/wallet-balance?address=${address}`);
}

/**
 * Format address for display
 */
export function formatAddress(address: string): string {
  if (!address) return '';
  
  const start = address.substring(0, 6);
  const end = address.substring(address.length - 4);
  
  return `${start}...${end}`;
} 
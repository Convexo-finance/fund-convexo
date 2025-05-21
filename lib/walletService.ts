import { TokenBalance } from '../types/index';

/**
 * Generate a mock wallet address based on a user ID
 * @param userId The user ID
 * @returns A consistent mock wallet address
 */
export function generateMockWalletAddress(userId: string): string {
  // Generate a stable mock address based on the userId
  const mockAddress = `0x${userId.substring(0, 8)}${'0'.repeat(32)}`.substring(0, 42);
  return mockAddress;
}

/**
 * Get wallet balances from Optimism
 * @param address The wallet address
 * @returns Token balances from Optimism
 */
export async function getMockBalances(address: string): Promise<TokenBalance> {
  try {
    // Fetch ETH balance from Optimism using public API
    const response = await fetch(`https://api-optimistic.etherscan.io/api?module=account&action=balance&address=${address}&tag=latest&apikey=`);
    const data = await response.json();
    
    let ethBalance = '0';
    
    // If the API request was successful
    if (data.status === '1') {
      // Convert wei to ETH (1 ETH = 10^18 wei)
      const balanceInWei = data.result;
      const balanceInEth = parseInt(balanceInWei) / 1e18;
      ethBalance = balanceInEth.toString();
    } else {
      console.error('Error fetching from Optimism API:', data.message);
      // Fallback to mock data if API fails
      ethBalance = '0.05';
    }
    
    return {
      ethBalance,
      uscBalance: "10.00" // Mock USC balance as example
    };
  } catch (error) {
    console.error('Error fetching balances:', error);
    // Return mock data as fallback
    return {
      ethBalance: "0.05",
      uscBalance: "10.00"
    };
  }
}

/**
 * Format an address for display (shortening with ellipsis)
 * @param address The wallet address
 * @returns Formatted address with ellipsis
 */
export function formatAddress(address: string): string {
  if (!address) return '';
  
  const start = address.substring(0, 6);
  const end = address.substring(address.length - 4);
  
  return `${start}...${end}`;
} 
import { TokenBalance } from '@/types/index';

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
 * Get mock wallet balances
 * @param address The wallet address
 * @returns Mock token balances
 */
export function getMockBalances(address: string): TokenBalance {
  return {
    ethBalance: "0.05",
    uscBalance: "10.00"
  };
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
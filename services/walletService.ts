import { createPublicClient, http, formatUnits, parseUnits } from 'viem';
import { optimism } from 'viem/chains';
import { TokenBalance } from '../types/index';

// Professional wallet service - no mock data
export class WalletService {
  private client;

  constructor() {
    this.client = createPublicClient({
      chain: optimism,
      transport: http()
    });
  }

  /**
   * Fetch real token balances from Optimism network
   */
  async getTokenBalances(address: string): Promise<TokenBalance> {
    try {
      // ETH balance
      const ethBalance = await this.client.getBalance({
        address: address as `0x${string}`
      });

      // USDC balance (Native Circle USDC on Optimism)
      const usdcBalance = await this.client.readContract({
        address: '0x0b2c639c533813f4aa9d7837caf62653d097ff85',
        abi: [{
          inputs: [{ name: 'account', type: 'address' }],
          name: 'balanceOf',
          outputs: [{ name: '', type: 'uint256' }],
          stateMutability: 'view',
          type: 'function'
        }],
        functionName: 'balanceOf',
        args: [address as `0x${string}`]
      });

      // PAPAYOS balance
      const papayosBalance = await this.client.readContract({
        address: '0xfeEF2ce2B94B8312EEB05665e2F03efbe3B0a916',
        abi: [{
          inputs: [{ name: 'account', type: 'address' }],
          name: 'balanceOf',
          outputs: [{ name: '', type: 'uint256' }],
          stateMutability: 'view',
          type: 'function'
        }],
        functionName: 'balanceOf',
        args: [address as `0x${string}`]
      });

      return {
        ethBalance: formatUnits(ethBalance, 18),
        uscBalance: formatUnits(usdcBalance as bigint, 6),
        papayosBalance: formatUnits(papayosBalance as bigint, 18),
      };
    } catch (error) {
      console.error('Error fetching token balances:', error);
      throw new Error('Failed to fetch token balances from Optimism network');
    }
  }

  /**
   * Format address for display
   */
  formatAddress(address: string): string {
    if (!address) return '';
    
    const start = address.substring(0, 6);
    const end = address.substring(address.length - 4);
    
    return `${start}...${end}`;
  }
}

// Export singleton instance
export const walletService = new WalletService();

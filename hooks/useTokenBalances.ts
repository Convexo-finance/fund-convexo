import { useState, useEffect, useCallback } from 'react';
import { createPublicClient, http, formatUnits } from 'viem';
import { optimism } from 'viem/chains';
import { TokenBalance } from '../types/index';

// USDC contract address on Optimism
const USDC_ADDRESS = '0x7F5c764cBc14f9669B88837ca1490cCa17c31607';

// Simple ABI for ERC20 balanceOf function
const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
] as const;

// Initialize Optimism client
const client = createPublicClient({
  chain: optimism,
  transport: http('https://mainnet.optimism.io'),
});

/**
 * Custom hook to fetch token balances from Optimism
 * @param address The wallet address to check balances for
 * @returns Object containing token balances and loading state
 */
export function useTokenBalances(address: string | undefined) {
  const [balances, setBalances] = useState<TokenBalance>({ 
    ethBalance: '0', 
    uscBalance: '0' 
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalances = useCallback(async () => {
    if (!address) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch ETH balance
      const ethBalance = await client.getBalance({ address: address as `0x${string}` });
      
      // Fetch USDC balance
      let usdcBalance = BigInt(0);
      try {
        const result = await client.readContract({
          address: USDC_ADDRESS as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'balanceOf',
          args: [address as `0x${string}`],
        });
        usdcBalance = result as bigint;
      } catch (err) {
        console.error('Error fetching USDC balance:', err);
        // Continue with zero USDC balance if there's an error
      }
      
      // Format the balances with proper decimal places
      // ETH has 18 decimals, USDC has 6 decimals on Optimism
      setBalances({
        ethBalance: formatUnits(ethBalance, 18),
        uscBalance: formatUnits(usdcBalance, 6),
      });
      
    } catch (err) {
      console.error('Error fetching token balances:', err);
      setError('Failed to fetch token balances');
      
      // Fallback to mock data
      setBalances({
        ethBalance: '0.05',
        uscBalance: '10.00',
      });
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => {
    if (address) {
      fetchBalances();
    }
  }, [address, fetchBalances]);

  return { 
    balances, 
    isLoading, 
    error, 
    refetch: fetchBalances
  };
} 
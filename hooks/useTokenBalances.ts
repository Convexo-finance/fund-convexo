import { useState, useEffect, useCallback } from 'react';
import { walletService } from '../services/walletService';
import { TokenBalance } from '../types/index';

/**
 * Professional hook for token balance management
 * No mock data - production ready
 */
export function useTokenBalances(address: string | undefined) {
  const [balances, setBalances] = useState<TokenBalance>({
    ethBalance: '0',
    uscBalance: '0',
    papayosBalance: '0',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalances = useCallback(async () => {
    if (!address) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const tokenBalances = await walletService.getTokenBalances(address);
      setBalances(tokenBalances);
    } catch (err) {
      console.error('Error fetching token balances:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch token balances');
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
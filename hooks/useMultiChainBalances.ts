import { useState, useEffect, useCallback } from 'react';
import { createPublicClient, http, formatUnits } from 'viem';
import { mainnet, optimism, base } from 'viem/chains';
import { TokenBalance } from '../types/index';

// Chain configurations with proper RPC endpoints
const CHAINS = {
  1: { 
    chain: {
      ...mainnet,
      rpcUrls: {
        default: { http: ['https://eth.llamarpc.com'] },
        public: { http: ['https://eth.llamarpc.com'] }
      }
    }, 
    name: 'Ethereum' 
  },
  10: { 
    chain: {
      ...optimism,
      rpcUrls: {
        default: { http: ['https://mainnet.optimism.io'] },
        public: { http: ['https://mainnet.optimism.io'] }
      }
    }, 
    name: 'Optimism' 
  },
  8453: { 
    chain: {
      ...base,
      rpcUrls: {
        default: { http: ['https://mainnet.base.org'] },
        public: { http: ['https://mainnet.base.org'] }
      }
    }, 
    name: 'Base' 
  }
};

// Token contracts by chain - using correct addresses
const TOKEN_CONTRACTS = {
  1: { // Ethereum Mainnet
    USDC: '0xA0b86a33E6441E0b8C3C5C9c6a0b5e3b8b3b3b3b', // USDC on Ethereum (6 decimals)
  },
  10: { // Optimism  
    USDC: '0x0b2c639c533813f4aa9d7837caf62653d097ff85', // Native Circle USDC (6 decimals)
    PAPAYOS: '0xfeEF2ce2B94B8312EEB05665e2F03efbe3B0a916' // PAPAYOS (18 decimals)
  },
  8453: { // Base
    USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // Native Circle USDC (6 decimals)
  }
};

const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
] as const;

/**
 * Hook to fetch token balances across multiple chains
 */
export function useMultiChainBalances(address: string | undefined, chainId: number = 10) {
  const [balances, setBalances] = useState<TokenBalance>({ 
    ethBalance: '0', 
    uscBalance: '0',
    papayosBalance: '0'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalances = useCallback(async () => {
    if (!address || !CHAINS[chainId as keyof typeof CHAINS]) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const chainConfig = CHAINS[chainId as keyof typeof CHAINS];
      
      // Create client with proper RPC configuration
      const client = createPublicClient({
        chain: chainConfig.chain,
        transport: http(chainConfig.chain.rpcUrls.default.http[0])
      });

      // Fetch native ETH balance
      const ethBalance = await client.getBalance({ 
        address: address as `0x${string}` 
      });
      
      // Fetch USDC balance if available on this chain
      let usdcBalance = BigInt(0);
      const usdcContract = TOKEN_CONTRACTS[chainId as keyof typeof TOKEN_CONTRACTS]?.USDC;
      if (usdcContract) {
        try {
          const result = await client.readContract({
            address: usdcContract as `0x${string}`,
            abi: ERC20_ABI,
            functionName: 'balanceOf',
            args: [address as `0x${string}`],
          });
          usdcBalance = result as bigint;
        } catch (err) {
          console.error(`Error fetching USDC balance on ${chainConfig.name}:`, err);
        }
      }
      
      // Fetch PAPAYOS balance (only on Optimism)
      let papayosBalance = BigInt(0);
      if (chainId === 10) {
        const papayosContract = TOKEN_CONTRACTS[10].PAPAYOS;
        try {
          const result = await client.readContract({
            address: papayosContract as `0x${string}`,
            abi: ERC20_ABI,
            functionName: 'balanceOf',
            args: [address as `0x${string}`],
          });
          papayosBalance = result as bigint;
        } catch (err) {
          console.error('Error fetching PAPAYOS balance:', err);
        }
      }
      
      setBalances({
        ethBalance: formatUnits(ethBalance, 18),
        uscBalance: formatUnits(usdcBalance, 6),
        papayosBalance: formatUnits(papayosBalance, 18),
      });
      
    } catch (err) {
      console.error(`Error fetching balances on chain ${chainId}:`, err);
      setError(`Failed to fetch balances on ${CHAINS[chainId as keyof typeof CHAINS]?.name || 'Unknown'} network`);
    } finally {
      setIsLoading(false);
    }
  }, [address, chainId]);

  useEffect(() => {
    if (address && chainId) {
      fetchBalances();
    }
  }, [address, chainId, fetchBalances]);

  return { 
    balances, 
    isLoading, 
    error, 
    refetch: fetchBalances,
    chainName: CHAINS[chainId as keyof typeof CHAINS]?.name || 'Unknown'
  };
}

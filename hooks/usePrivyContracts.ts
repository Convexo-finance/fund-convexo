import { useWallets } from '@privy-io/react-auth';
import { useState, useCallback } from 'react';
import { formatUnits, parseUnits, createPublicClient, http } from 'viem';
import { CONTRACTS, USDC_DECIMALS } from '../config/contracts';

const BASE_SEPOLIA_RPC = 'https://sepolia.base.org';

// Create a public client for reading blockchain data
const publicClient = createPublicClient({
  chain: {
    id: 84532,
    name: 'Base Sepolia',
    network: 'base-sepolia',
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
      default: { http: [BASE_SEPOLIA_RPC] },
      public: { http: [BASE_SEPOLIA_RPC] },
    },
    blockExplorers: {
      default: { name: 'BaseScan', url: 'https://sepolia.basescan.org' },
    },
    testnet: true,
  },
  transport: http(BASE_SEPOLIA_RPC),
});

export function usePrivyContracts() {
  const { wallets } = useWallets();
  const [isLoading, setIsLoading] = useState(false);

  // Get the embedded wallet
  const embeddedWallet = wallets.find(wallet => wallet.walletClientType === 'privy');

  // Read USDC balance
  const getUSDCBalance = useCallback(async (address: `0x${string}`) => {
    try {
      const balance = await publicClient.readContract({
        address: CONTRACTS.usdc.address,
        abi: CONTRACTS.usdc.abi,
        functionName: 'balanceOf',
        args: [address],
      });
      return Number(formatUnits(balance as bigint, USDC_DECIMALS));
    } catch (error) {
      console.error('Error reading USDC balance:', error);
      return 0;
    }
  }, []);

  // Read vault APY
  const getVaultAPY = useCallback(async () => {
    try {
      const apy = await publicClient.readContract({
        address: CONTRACTS.vault.address,
        abi: CONTRACTS.vault.abi,
        functionName: 'previewAPY',
      });
      return Number(formatUnits(apy as bigint, 4)); // APY with 4 decimals
    } catch (error) {
      console.error('Error reading vault APY:', error);
      return 0;
    }
  }, []);

  // Read vault value per share
  const getVaultValuePerShare = useCallback(async () => {
    try {
      const value = await publicClient.readContract({
        address: CONTRACTS.vault.address,
        abi: CONTRACTS.vault.abi,
        functionName: 'vaultValuePerShare',
      });
      return Number(formatUnits(value as bigint, USDC_DECIMALS));
    } catch (error) {
      console.error('Error reading vault value per share:', error);
      return 1; // Default to 1 if error
    }
  }, []);

  // Read vault balance (CVXS shares)
  const getVaultBalance = useCallback(async (address: `0x${string}`) => {
    try {
      const balance = await publicClient.readContract({
        address: CONTRACTS.vault.address,
        abi: CONTRACTS.vault.abi,
        functionName: 'balanceOf',
        args: [address],
      });
      return Number(formatUnits(balance as bigint, 18)); // Vault shares typically 18 decimals
    } catch (error) {
      console.error('Error reading vault balance:', error);
      return 0;
    }
  }, []);

  // Read loan status
  const getLoanStatus = useCallback(async (loanId: number) => {
    try {
      const loanData = await publicClient.readContract({
        address: CONTRACTS.loanNFT.address,
        abi: CONTRACTS.loanNFT.abi,
        functionName: 'getLoan',
        args: [BigInt(loanId)],
      }) as any;

      return {
        borrower: loanData.borrower,
        principal: Number(formatUnits(loanData.principal, USDC_DECIMALS)),
        interestRate: Number(formatUnits(loanData.interestRate, 4)),
        termLength: Number(loanData.termLength),
        startTime: Number(loanData.startTime),
        amountPaid: Number(formatUnits(loanData.amountPaid, USDC_DECIMALS)),
        isActive: loanData.isActive,
      };
    } catch (error) {
      console.error('Error reading loan status:', error);
      return null;
    }
  }, []);

  // Send transaction using Privy wallet
  const sendTransaction = useCallback(async (
    contractAddress: `0x${string}`,
    abi: any[],
    functionName: string,
    args: any[] = []
  ) => {
    if (!embeddedWallet) {
      throw new Error('No embedded wallet found');
    }

    try {
      setIsLoading(true);
      
      // Get the Ethereum provider from Privy
      const provider = await embeddedWallet.getEthereumProvider();
      
      // Create a wallet client using viem
      const { createWalletClient, custom } = await import('viem');
      const walletClient = createWalletClient({
        account: embeddedWallet.address as `0x${string}`,
        chain: {
          id: 84532,
          name: 'Base Sepolia',
          network: 'base-sepolia',
          nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
          rpcUrls: {
            default: { http: [BASE_SEPOLIA_RPC] },
            public: { http: [BASE_SEPOLIA_RPC] },
          },
          blockExplorers: {
            default: { name: 'BaseScan', url: 'https://sepolia.basescan.org' },
          },
          testnet: true,
        },
        transport: custom(provider),
      });

      // Send the transaction
      const hash = await walletClient.writeContract({
        address: contractAddress,
        abi,
        functionName,
        args,
      });

      return hash;
    } catch (error) {
      console.error('Error sending transaction:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [embeddedWallet]);

  // Approve USDC
  const approveUSDC = useCallback(async (spender: `0x${string}`, amount: number) => {
    const amountBigInt = parseUnits(amount.toString(), USDC_DECIMALS);
    return sendTransaction(
      CONTRACTS.usdc.address,
      CONTRACTS.usdc.abi,
      'approve',
      [spender, amountBigInt]
    );
  }, [sendTransaction]);

  // Deposit to vault
  const depositToVault = useCallback(async (amount: number, receiver: `0x${string}`) => {
    const amountBigInt = parseUnits(amount.toString(), USDC_DECIMALS);
    return sendTransaction(
      CONTRACTS.vault.address,
      CONTRACTS.vault.abi,
      'deposit',
      [amountBigInt, receiver]
    );
  }, [sendTransaction]);

  // Withdraw from vault
  const withdrawFromVault = useCallback(async (shares: number, receiver: `0x${string}`) => {
    const sharesBigInt = parseUnits(shares.toString(), 18);
    return sendTransaction(
      CONTRACTS.vault.address,
      CONTRACTS.vault.abi,
      'redeem',
      [sharesBigInt, receiver, receiver]
    );
  }, [sendTransaction]);

  // Repay loan
  const repayLoan = useCallback(async (loanId: number, amount: number) => {
    const amountBigInt = parseUnits(amount.toString(), USDC_DECIMALS);
    return sendTransaction(
      CONTRACTS.collector.address,
      CONTRACTS.collector.abi,
      'recordPayment',
      [BigInt(loanId), amountBigInt]
    );
  }, [sendTransaction]);

  return {
    // Wallet info
    embeddedWallet,
    walletAddress: embeddedWallet?.address as `0x${string}` | undefined,
    isConnected: !!embeddedWallet,

    // Read functions
    getUSDCBalance,
    getVaultAPY,
    getVaultValuePerShare,
    getVaultBalance,
    getLoanStatus,

    // Write functions
    approveUSDC,
    depositToVault,
    withdrawFromVault,
    repayLoan,

    // State
    isLoading,
  };
}

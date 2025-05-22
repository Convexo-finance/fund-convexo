import { ReactNode, createContext, useContext, useState, useEffect } from 'react';
// Import from privy but don't use wallet functionality yet
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { createPublicClient, http } from 'viem';
import { optimism, base } from 'viem/chains';
import { createSmartAccountClient } from 'permissionless';
import { toSafeSmartAccount } from 'permissionless/accounts';

// Define Entry Point address for ERC-4337 (EntryPoint v0.7)
const entryPoint07Address = '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789' as const;

// Define the type for the context
interface SmartWalletsContextType {
  smartAccountAddress: string | null;
  isLoading: boolean;
  error: Error | null;
  sendTransaction: (params: {
    to: string;
    value: bigint;
    data?: `0x${string}`;
  }) => Promise<string>;
}

// Extend the ConnectedWallet type to include smartWalletConfig
interface PrivyWalletWithSmartConfig {
  walletClientType: string;
  address: string;
  smartWalletConfig?: {
    isDeployed?: boolean;
  };
  getEthereumProvider: () => Promise<any>;
}

// Type guard to check if a wallet is a smart wallet
function isSmartWallet(wallet: any): wallet is PrivyWalletWithSmartConfig {
  return (
    wallet.walletClientType === 'privy' &&
    typeof wallet.address === 'string' &&
    wallet.smartWalletConfig !== undefined &&
    wallet.smartWalletConfig.isDeployed === true
  );
}

// Create context
const SmartWalletsContext = createContext<SmartWalletsContextType>({
  smartAccountAddress: null,
  isLoading: false,
  error: null,
  sendTransaction: async () => { throw new Error("Smart wallet not initialized"); }
});

// Hook to use the smart wallets context
export const useSmartWallets = () => useContext(SmartWalletsContext);

// The provider component
export const SmartWalletsProvider = ({ children }: { children: ReactNode }) => {
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();
  const [smartAccountAddress, setSmartAccountAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    if (!authenticated || !wallets) return;
    
    const findSmartWallet = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Find the smart wallet in the user's wallet list using the type guard
        const smartWallet = wallets.find(wallet => isSmartWallet(wallet));
        
        if (smartWallet) {
          setSmartAccountAddress(smartWallet.address);
        } else {
          // No smart wallet found, but don't set an error as it might be created later
          console.log("No deployed smart wallet found yet");
        }
      } catch (err: any) {
        console.error('Error finding smart wallet:', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    findSmartWallet();
  }, [authenticated, wallets]);
  
  // Function to send a transaction via the smart wallet
  const sendTransaction = async (params: {
    to: string;
    value: bigint;
    data?: `0x${string}`;
  }): Promise<string> => {
    if (!wallets || wallets.length === 0) {
      throw new Error("No wallets available");
    }
    
    // Find the smart wallet using the type guard
    const smartWallet = wallets.find(wallet => isSmartWallet(wallet));
    
    if (!smartWallet) {
      throw new Error("Smart wallet not found or not yet deployed");
    }
    
    try {
      // Get the provider from the wallet
      const provider = await smartWallet.getEthereumProvider();
      
      // Format parameters for the transaction
      const txParams = {
        from: smartWallet.address,
        to: params.to,
        value: `0x${params.value.toString(16)}`,
        data: params.data || '0x',
        chainId: optimism.id, // Optimism chain ID
      };
      
      // Send the transaction
      const txHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [txParams]
      });
      
      return txHash as string;
    } catch (error) {
      console.error("Failed to send transaction via smart wallet:", error);
      throw error;
    }
  };
  
  return (
    <SmartWalletsContext.Provider value={{ 
      smartAccountAddress, 
      isLoading, 
      error,
      sendTransaction
    }}>
      {children}
    </SmartWalletsContext.Provider>
  );
};

export default SmartWalletsProvider; 
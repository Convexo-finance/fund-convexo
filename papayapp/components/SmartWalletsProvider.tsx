import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { createWalletClient, custom } from 'viem';
import { optimism } from 'viem/chains';
import { createSmartAccountClient } from 'permissionless';
import { SafeSmartAccount } from 'permissionless/accounts';
import { createPublicClient, http } from 'viem';
import { entryPoint07Address } from 'viem/account-abstraction';

// Define the type for the context
interface SmartWalletsContextType {
  client: any | null;
  smartAccountAddress: string | null;
  isLoading: boolean;
  error: Error | null;
}

// Create context
const SmartWalletsContext = createContext<SmartWalletsContextType>({
  client: null,
  smartAccountAddress: null,
  isLoading: false,
  error: null
});

// Hook to use the smart wallets context
export const useSmartWallets = () => useContext(SmartWalletsContext);

// Get environment variables
const BICONOMY_API_KEY = process.env.NEXT_PUBLIC_BICONOMY_API_KEY || 'T8wf6ZHsC.fbcfc854-8c40-4b82-bed0-d2e6c50c38ad';
const BICONOMY_PAYMASTER_URL = process.env.NEXT_PUBLIC_BICONOMY_PAYMASTER_URL || 'https://paymaster.biconomy.io/api/v2';
const BICONOMY_PAYMASTER_ID = process.env.NEXT_PUBLIC_BICONOMY_PAYMASTER_ID || 'ba7165eb-519e-446c-9010-f688214fa901';
const BICONOMY_BUNDLER_URL = process.env.NEXT_PUBLIC_BICONOMY_BUNDLER_URL || 'https://bundler.biconomy.io/api/v2/10';

// The provider component
export const SmartWalletsProvider = ({ children }: { children: ReactNode }) => {
  const { ready, authenticated } = usePrivy();
  const { wallets } = useWallets();
  const [client, setClient] = useState<any>(null);
  const [smartAccountAddress, setSmartAccountAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Initialize the smart account when the user is authenticated and has a wallet
  useEffect(() => {
    const initializeSmartAccount = async () => {
      if (!ready || !authenticated || !wallets.length) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Find the embedded wallet
        const embeddedWallet = wallets.find(wallet => wallet.walletClientType === 'privy');
        
        if (!embeddedWallet) {
          throw new Error('No embedded wallet found');
        }
        
        // Get the Ethereum provider from the embedded wallet
        const eip1193Provider = await embeddedWallet.getEthereumProvider();
        
        // Create a viem wallet client for the embedded wallet
        const privyClient = createWalletClient({
          account: embeddedWallet.address as `0x${string}`,
          chain: optimism, // Use Optimism mainnet
          transport: custom(eip1193Provider)
        });
        
        // Create a public client for RPC calls
        const publicClient = createPublicClient({
          chain: optimism,
          transport: http()
        });
        
        // Create a Safe smart account
        const safeAccount = await SafeSmartAccount.toSafeSmartAccount({
          client: publicClient,
          owners: [
            {
              signMessage: async (msg) => {
                return privyClient.signMessage({ message: { raw: msg } });
              },
              getAddress: async () => embeddedWallet.address as `0x${string}`
            }
          ],
          safeVersion: '1.4.1',
          entryPoint: {
            address: entryPoint07Address,
            version: "0.7",
          }
        });
        
        // Store the account address
        setSmartAccountAddress(safeAccount.address);
        
        // Create the smart account client with Biconomy paymaster
        const smartAccountClient = createSmartAccountClient({
          account: safeAccount,
          chain: optimism,
          bundlerTransport: http(BICONOMY_BUNDLER_URL),
          middleware: {
            sponsorUserOperation: async (args) => {
              const userOperation = args.userOperation;
              
              // Add the appropriate data to use the Biconomy paymaster
              const response = await fetch(BICONOMY_PAYMASTER_URL, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'x-api-key': BICONOMY_API_KEY
                },
                body: JSON.stringify({
                  id: BICONOMY_PAYMASTER_ID,
                  jsonrpc: '2.0',
                  method: 'pm_sponsorUserOperation',
                  params: [userOperation, { entryPoint: entryPoint07Address }]
                })
              });
              
              if (!response.ok) {
                throw new Error('Failed to sponsor user operation with Biconomy');
              }
              
              const responseData = await response.json();
              
              if (responseData.error) {
                throw new Error(`Biconomy error: ${responseData.error.message}`);
              }
              
              return responseData.result;
            }
          }
        });
        
        // Pass chain ID explicitly when creating the client
        (smartAccountClient as any).chainId = optimism.id;
        
        setClient(smartAccountClient);
      } catch (err) {
        console.error('Error initializing smart account:', err);
        setError(err instanceof Error ? err : new Error('Unknown error initializing smart account'));
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeSmartAccount();
  }, [ready, authenticated, wallets]);
  
  return (
    <SmartWalletsContext.Provider value={{ client, smartAccountAddress, isLoading, error }}>
      {children}
    </SmartWalletsContext.Provider>
  );
};

export default SmartWalletsProvider; 
import { ReactNode, createContext, useContext, useState } from 'react';

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

// The provider component
export const SmartWalletsProvider = ({ children }: { children: ReactNode }) => {
  const [client] = useState<any>(null);
  const [smartAccountAddress] = useState<string | null>(null);
  const [isLoading] = useState(false);
  const [error] = useState<Error | null>(null);
  
  return (
    <SmartWalletsContext.Provider value={{ client, smartAccountAddress, isLoading, error }}>
      {children}
    </SmartWalletsContext.Provider>
  );
};

export default SmartWalletsProvider; 
import { useWallets, usePrivy } from '@privy-io/react-auth';
import { useState, useEffect } from 'react';
import WalletInfo from './WalletInfo';
import { TokenBalance, Wallet } from '../../types/index';
import { useMultiChainBalances } from '../../hooks/useMultiChainBalances';
import { validateExternalWallet, isExternalWallet } from '../../utils/walletValidation';
import ChainSelector from './ChainSelector';

/**
 * WalletManager - Handles multiple connected wallets (embedded + external)
 * Following Privy docs for proper wallet management
 */
export default function WalletManager() {
  const { user } = usePrivy();
  const { wallets, ready } = useWallets(); // Connected wallets (ready for transactions)
  const [selectedWalletIndex, setSelectedWalletIndex] = useState(0);
  const [selectedChainId, setSelectedChainId] = useState(10); // Default to Optimism
  const [validatedWallets, setValidatedWallets] = useState<typeof wallets>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Validate external wallets to prevent duplicates
  useEffect(() => {
    if (!wallets || !user) return;

    const validateWallets = async () => {
      const validated: typeof wallets = [];
      const errors: string[] = [];

      for (const wallet of wallets) {
        if (isExternalWallet(wallet)) {
          // Validate external wallets for duplicates
          const validation = await validateExternalWallet(wallet.address, user.id);
          
          if (validation.isValid) {
            validated.push(wallet);
          } else {
            errors.push(`${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}: ${validation.error}`);
          }
        } else {
          // Embedded wallets are always valid (Privy ensures uniqueness)
          validated.push(wallet);
        }
      }

      setValidatedWallets(validated);
      setValidationErrors(errors);
    };

    validateWallets();
  }, [wallets, user]);

  // Get the currently selected wallet from validated wallets
  const selectedWallet = validatedWallets[selectedWalletIndex];
  
  // Use multi-chain token balances for the selected wallet
  const { 
    balances, 
    isLoading: isBalanceLoading, 
    error: balanceError,
    refetch: refreshBalances,
    chainName
  } = useMultiChainBalances(selectedWallet?.address, selectedChainId);

  if (!ready) {
    return (
      <div className="text-center p-8">
        <p className="mb-4 text-gray-600 dark:text-gray-400">Loading wallets...</p>
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  // Show validation errors if any
  if (validationErrors.length > 0) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
          <h3 className="text-red-800 dark:text-red-400 font-medium mb-2">Wallet Conflicts Detected</h3>
          <div className="space-y-1">
            {validationErrors.map((error, index) => (
              <p key={index} className="text-sm text-red-600 dark:text-red-300">{error}</p>
            ))}
          </div>
          <p className="text-xs text-red-500 dark:text-red-400 mt-3">
            Each external wallet can only be linked to one account. Please disconnect conflicting wallets.
          </p>
        </div>
        
        {/* Show valid wallets if any */}
        {validatedWallets.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Valid Wallets ({validatedWallets.length})
            </h4>
            {/* Continue with valid wallet display */}
          </div>
        )}
      </div>
    );
  }

  if (!validatedWallets || validatedWallets.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="mb-4 text-gray-600 dark:text-gray-400">No valid wallets available</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Please create an embedded wallet or connect a unique external wallet
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Wallet Selector - if user has multiple validated wallets */}
      {validatedWallets.length > 1 && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Select Wallet ({validatedWallets.length} valid)
          </h4>
          <div className="space-y-2">
            {validatedWallets.map((wallet, index) => (
              <button
                key={wallet.address}
                onClick={() => setSelectedWalletIndex(index)}
                className={`w-full p-3 rounded-md text-left border ${
                  index === selectedWalletIndex
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        wallet.walletClientType === 'privy' 
                          ? 'bg-green-500' 
                          : 'bg-blue-500'
                      }`}></span>
                      <span className="font-mono text-sm">
                        {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {wallet.walletClientType === 'privy' ? 'Embedded Wallet' : `${wallet.walletClientType} Wallet`}
                    </div>
                  </div>
                  {index === selectedWalletIndex && (
                    <span className="text-blue-600 dark:text-blue-400 text-sm">✓</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chain Selector */}
      {selectedWallet && (
        <ChainSelector 
          selectedChainId={selectedChainId}
          onChainChange={setSelectedChainId}
          walletAddress={selectedWallet.address}
        />
      )}

      {/* Selected Wallet Info */}
      {selectedWallet && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white">
              Active Wallet on {chainName}
            </h3>
            <span className={`px-2 py-1 rounded-full text-xs ${
              selectedWallet.walletClientType === 'privy'
                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
            }`}>
              {selectedWallet.walletClientType === 'privy' ? 'Embedded' : 'External'}
            </span>
          </div>

          {balanceError ? (
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-red-600 dark:text-red-300 mb-2">Error loading wallet data</p>
              <p className="text-sm text-red-500 dark:text-red-400 mb-3">{balanceError}</p>
              <button 
                onClick={refreshBalances}
                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          ) : (
            <WalletInfo 
              wallet={selectedWallet as unknown as Wallet} 
              balances={balances}
              isLoading={isBalanceLoading}
              onRefresh={refreshBalances}
            />
          )}
        </div>
      )}
    </div>
  );
}

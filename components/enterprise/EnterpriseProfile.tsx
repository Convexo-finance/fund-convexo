import React, { useState, useEffect } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import Button from '../wallet/shared/Button';
import { usePrivyContracts } from '../../hooks/usePrivyContracts';

const EnterpriseProfile: React.FC = () => {
  const { user } = usePrivy();
  const { wallets } = useWallets();
  const { 
    embeddedWallet, 
    walletAddress, 
    isConnected, 
    getUSDCBalance 
  } = usePrivyContracts();
  
  const [usdcBalance, setUsdcBalance] = useState(0);
  const [balanceLoading, setBalanceLoading] = useState(false);

  // Load USDC balance when wallet is connected
  useEffect(() => {
    if (walletAddress) {
      setBalanceLoading(true);
      getUSDCBalance(walletAddress)
        .then(setUsdcBalance)
        .finally(() => setBalanceLoading(false));
    }
  }, [walletAddress, getUSDCBalance]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Enterprise Profile</h2>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* User Information Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          📋 Account Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic User Info */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">User ID</label>
              <p className="font-mono text-sm text-gray-900 dark:text-white break-all">
                {user?.id || 'Not available'}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Primary Email</label>
              <p className="text-sm text-gray-900 dark:text-white">
                {user?.email?.address || 'Not provided'}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
              <p className="text-sm text-gray-900 dark:text-white">
                {user?.phone?.number || 'Not provided'}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Account Created</label>
              <p className="text-sm text-gray-900 dark:text-white">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
              </p>
            </div>
          </div>

          {/* Wallet Information */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Wallet Address</label>
              <p className="font-mono text-xs text-gray-900 dark:text-white break-all">
                {walletAddress || 'Not connected'}
              </p>
              {walletAddress && (
                <button 
                  onClick={() => navigator.clipboard.writeText(walletAddress)}
                  className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200 mt-1"
                >
                  📋 Copy Address
                </button>
              )}
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">USDC Balance</label>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {balanceLoading ? 'Loading...' : `${usdcBalance.toFixed(2)} USDC`}
              </p>
              <button 
                onClick={() => {
                  if (walletAddress) {
                    setBalanceLoading(true);
                    getUSDCBalance(walletAddress)
                      .then(setUsdcBalance)
                      .finally(() => setBalanceLoading(false));
                  }
                }}
                className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200 mt-1"
                disabled={!walletAddress || balanceLoading}
              >
                🔄 Refresh Balance
              </button>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Network</label>
              <p className="text-sm text-gray-900 dark:text-white">
                Base Sepolia (Chain ID: 84532)
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Wallet Provider</label>
              <p className="text-sm text-gray-900 dark:text-white">
                Privy Embedded Wallet
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Linked Accounts */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          🔗 Linked Accounts
        </h3>
        
        {user?.linkedAccounts && user.linkedAccounts.length > 0 ? (
          <div className="space-y-3">
            {user.linkedAccounts.map((account: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 dark:text-blue-400 text-sm">
                      {account.type === 'email' ? '📧' : 
                       account.type === 'phone' ? '📱' : 
                       account.type === 'wallet' ? '👛' : 
                       account.type === 'google' ? '🌐' : '🔗'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white capitalize">
                      {account.type}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {account.address || account.email || account.phone || 'Connected'}
                    </p>
                  </div>
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">
                  ✓ Verified
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-400">No linked accounts found.</p>
        )}
      </div>

      {/* Account Actions */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          ⚙️ Account Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button variant="outline" size="small" className="text-left justify-start">
            📋 Download Account Data
          </Button>
          <Button variant="outline" size="small" className="text-left justify-start">
            🔐 Security Settings
          </Button>
          <Button variant="outline" size="small" className="text-left justify-start">
            📞 Contact Support
          </Button>
          <Button variant="outline" size="small" className="text-left justify-start">
            ⚙️ Account Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EnterpriseProfile;

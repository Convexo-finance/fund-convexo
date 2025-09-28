import React, { useState, useEffect } from 'react';
import { useWallets } from '@privy-io/react-auth';
import Button from '../wallet/shared/Button';
import { usePrivyContracts } from '../../hooks/usePrivyContracts';

interface ProfileModuleProps {
  user: any;
  address?: `0x${string}`;
}

type UserRole = 'investor' | 'enterprise';

const ProfileModule: React.FC<ProfileModuleProps> = ({ user }) => {
  const { wallets } = useWallets();
  const { 
    embeddedWallet, 
    walletAddress, 
    isConnected, 
    getUSDCBalance 
  } = usePrivyContracts();
  
  const [userRole, setUserRole] = useState<UserRole>('investor');
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Information</h2>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>


      {/* User Info Card */}
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-6 border border-purple-200 dark:border-purple-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Details */}
          <div>
            <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-4">
              User Details
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-purple-700 dark:text-purple-300">Email/Phone</label>
                <p className="font-mono text-sm text-purple-900 dark:text-purple-100">
                  {user?.email?.address || user?.phone?.number || 'Not provided'}
                </p>
              </div>
              <div>
                <label className="text-sm text-purple-700 dark:text-purple-300">Privy Wallet Address</label>
                <p className="font-mono text-xs text-purple-900 dark:text-purple-100 break-all">
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
                <label className="text-sm text-purple-700 dark:text-purple-300">USDC Balance</label>
                <p className="text-lg font-bold text-purple-900 dark:text-purple-100">
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
                <label className="text-sm text-purple-700 dark:text-purple-300">Wallet Type</label>
                <p className="text-sm text-purple-900 dark:text-purple-100">
                  Privy Embedded Wallet
                </p>
              </div>
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-4">
              Role Selection
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-purple-700 dark:text-purple-300 mb-2 block">
                  Select your role:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setUserRole('investor')}
                    className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                      userRole === 'investor'
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-white dark:bg-gray-700 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                    }`}
                  >
                    💼 Investor
                  </button>
                  <button
                    onClick={() => setUserRole('enterprise')}
                    className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                      userRole === 'enterprise'
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-white dark:bg-gray-700 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                    }`}
                  >
                    🏢 Enterprise
                  </button>
                </div>
              </div>
              <div className="mt-4">
                <div className={`p-3 rounded-lg border ${
                  userRole === 'investor' 
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                    : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                }`}>
                  <p className={`text-sm ${
                    userRole === 'investor' 
                      ? 'text-green-700 dark:text-green-300' 
                      : 'text-blue-700 dark:text-blue-300'
                  }`}>
                    <strong>Current Role:</strong> {userRole === 'investor' ? 'Investor' : 'Enterprise'}
                  </p>
                  <p className={`text-xs mt-1 ${
                    userRole === 'investor' 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-blue-600 dark:text-blue-400'
                  }`}>
                    {userRole === 'investor' 
                      ? 'Access vault deposits, withdrawals, and investment tracking.'
                      : 'Access loan repayments, financial scoring, and KYC verification.'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wallet Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Wallet Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isConnected ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
            }`}>
              <span className={`text-sm ${
                isConnected ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {isConnected ? '✅' : '❌'}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Connection</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {isConnected ? 'Connected' : 'Disconnected'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
              <span className="text-purple-600 dark:text-purple-400 text-sm">🔐</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Provider</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Privy Embedded</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <span className="text-blue-600 dark:text-blue-400 text-sm">🔗</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Network</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Base Sepolia</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button variant="outline" size="small" className="text-left justify-start">
            📋 View Transaction History
          </Button>
          <Button variant="outline" size="small" className="text-left justify-start">
            ⚙️ Wallet Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModule;

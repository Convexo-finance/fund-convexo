import React, { useState, useEffect } from 'react';
import { useWallets } from '@privy-io/react-auth';
import Button from '../wallet/shared/Button';
import { contractService } from '../../services/contractService';

interface InvestorProfileProps {
  user: any;
}

const InvestorProfile: React.FC<InvestorProfileProps> = ({ user }) => {
  const { wallets } = useWallets();
  const [usdcBalance, setUsdcBalance] = useState(0);
  const [vaultBalance, setVaultBalance] = useState(0);
  const [balanceLoading, setBalanceLoading] = useState(false);

  const embeddedWallet = wallets.find(w => w.walletClientType === 'privy');
  const walletAddress = embeddedWallet?.address as `0x${string}` | undefined;

  const loadBalances = async () => {
    if (!walletAddress) return;
    
    setBalanceLoading(true);
    try {
      const [usdc, vault] = await Promise.all([
        contractService.getUSDCBalance(walletAddress),
        contractService.getVaultBalance(walletAddress),
      ]);
      setUsdcBalance(usdc);
      setVaultBalance(vault);
    } catch (error) {
      console.error('Error loading balances:', error);
    } finally {
      setBalanceLoading(false);
    }
  };

  useEffect(() => {
    loadBalances();
  }, [walletAddress]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Investor Profile</h2>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${walletAddress ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {walletAddress ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* User Information */}
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-6 border border-purple-200 dark:border-purple-700">
        <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-4">
          👤 Account Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-purple-700 dark:text-purple-300">User ID</label>
              <p className="font-mono text-xs text-purple-900 dark:text-purple-100 break-all">
                {user?.id || 'Not available'}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-purple-700 dark:text-purple-300">Email</label>
              <p className="text-sm text-purple-900 dark:text-purple-100">
                {user?.email?.address || 'Not provided'}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-purple-700 dark:text-purple-300">Phone</label>
              <p className="text-sm text-purple-900 dark:text-purple-100">
                {user?.phone?.number || 'Not provided'}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-purple-700 dark:text-purple-300">Wallet Address</label>
              <p className="font-mono text-xs text-purple-900 dark:text-purple-100 break-all">
                {walletAddress || 'Not connected'}
              </p>
              {walletAddress && (
                <button 
                  onClick={() => navigator.clipboard.writeText(walletAddress)}
                  className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200 mt-1"
                >
                  📋 Copy
                </button>
              )}
            </div>
            
            <div>
              <label className="text-sm font-medium text-purple-700 dark:text-purple-300">Account Type</label>
              <p className="text-sm text-purple-900 dark:text-purple-100">
                Investor
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-purple-700 dark:text-purple-300">Member Since</label>
              <p className="text-sm text-purple-900 dark:text-purple-100">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          💰 Portfolio Summary
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-700 dark:text-green-300 text-sm">USDC Balance</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {balanceLoading ? '...' : `$${usdcBalance.toFixed(2)}`}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-200 dark:bg-green-700 rounded-full flex items-center justify-center">
                <span className="text-green-600 dark:text-green-300 text-xl">💵</span>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-700 dark:text-purple-300 text-sm">Vault Shares (CVXS)</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {balanceLoading ? '...' : vaultBalance.toFixed(6)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-200 dark:bg-purple-700 rounded-full flex items-center justify-center">
                <span className="text-purple-600 dark:text-purple-300 text-xl">🏦</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-center">
          <Button 
            onClick={loadBalances}
            variant="outline"
            size="small"
            disabled={!walletAddress || balanceLoading}
          >
            {balanceLoading ? '🔄 Loading...' : '🔄 Refresh Balances'}
          </Button>
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
          <Button variant="outline" size="small">
            📋 Export Investment Data
          </Button>
          <Button variant="outline" size="small">
            🔐 Security Settings
          </Button>
          <Button variant="outline" size="small">
            📞 Contact Support
          </Button>
          <Button 
            onClick={() => window.open('https://sepolia.basescan.org/address/' + walletAddress, '_blank')}
            variant="outline" 
            size="small"
            disabled={!walletAddress}
          >
            🔍 View on BaseScan
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InvestorProfile;

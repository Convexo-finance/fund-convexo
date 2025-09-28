import React, { useState, useEffect } from 'react';
import { useWallets } from '@privy-io/react-auth';
import Button from '../wallet/shared/Button';
import { contractService } from '../../services/contractService';

interface AdminProfileProps {
  user: any;
}

const AdminProfile: React.FC<AdminProfileProps> = ({ user }) => {
  const { wallets } = useWallets();
  const [usdcBalance, setUsdcBalance] = useState(0);
  const [balanceLoading, setBalanceLoading] = useState(false);

  const embeddedWallet = wallets.find(w => w.walletClientType === 'privy');
  const walletAddress = embeddedWallet?.address as `0x${string}` | undefined;

  const loadBalance = async () => {
    if (!walletAddress) return;
    
    setBalanceLoading(true);
    try {
      const balance = await contractService.getUSDCBalance(walletAddress);
      setUsdcBalance(balance);
    } catch (error) {
      console.error('Error loading balance:', error);
    } finally {
      setBalanceLoading(false);
    }
  };

  useEffect(() => {
    loadBalance();
  }, [walletAddress]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Administrator Profile</h2>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${walletAddress ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {walletAddress ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Admin Info Card */}
      <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-lg p-6 border border-red-200 dark:border-red-700">
        <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-4">
          👨‍💼 Administrator Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-red-700 dark:text-red-300">Admin ID</label>
              <p className="font-mono text-xs text-red-900 dark:text-red-100 break-all">
                {user?.id || 'Not available'}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-red-700 dark:text-red-300">Email</label>
              <p className="text-sm text-red-900 dark:text-red-100">
                {user?.email?.address || 'Not provided'}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-red-700 dark:text-red-300">Access Level</label>
              <p className="text-sm text-red-900 dark:text-red-100">
                Full Administrator
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-red-700 dark:text-red-300">Admin Wallet</label>
              <p className="font-mono text-xs text-red-900 dark:text-red-100 break-all">
                {walletAddress || 'Not connected'}
              </p>
              {walletAddress && (
                <button 
                  onClick={() => navigator.clipboard.writeText(walletAddress)}
                  className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 mt-1"
                >
                  📋 Copy
                </button>
              )}
            </div>
            
            <div>
              <label className="text-sm font-medium text-red-700 dark:text-red-300">USDC Balance</label>
              <p className="text-lg font-bold text-red-900 dark:text-red-100">
                {balanceLoading ? 'Loading...' : `${usdcBalance.toFixed(2)} USDC`}
              </p>
              <button 
                onClick={loadBalance}
                className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 mt-1"
                disabled={!walletAddress || balanceLoading}
              >
                🔄 Refresh
              </button>
            </div>
            
            <div>
              <label className="text-sm font-medium text-red-700 dark:text-red-300">Admin Since</label>
              <p className="text-sm text-red-900 dark:text-red-100">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Permissions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          🔐 Administrator Permissions
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Approve Loan Requests:</span>
              <span className="text-green-600 dark:text-green-400 font-medium">✓ Enabled</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Mint Loan NFTs:</span>
              <span className="text-green-600 dark:text-green-400 font-medium">✓ Enabled</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Manage User KYC:</span>
              <span className="text-green-600 dark:text-green-400 font-medium">✓ Enabled</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Platform Monitoring:</span>
              <span className="text-green-600 dark:text-green-400 font-medium">✓ Enabled</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Fee Management:</span>
              <span className="text-green-600 dark:text-green-400 font-medium">✓ Enabled</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Contract Interaction:</span>
              <span className="text-green-600 dark:text-green-400 font-medium">✓ Enabled</span>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Actions */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          🚀 Quick Admin Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            size="small"
            onClick={() => window.open('https://sepolia.basescan.org/address/0xd61bc1202D0B920D80b69762B78B4ce05dF03D1C', '_blank')}
          >
            🔍 View Vault Contract
          </Button>
          <Button 
            variant="outline" 
            size="small"
            onClick={() => window.open('https://sepolia.basescan.org/address/0x0B6962F7468BA68A8715ccb67233B54c8dEb5b73', '_blank')}
          >
            📄 View Loan NFTs
          </Button>
          <Button 
            variant="outline" 
            size="small"
            onClick={() => window.open('https://sepolia.basescan.org/address/0xf489d4c235895750Cf6EC06C7B26187aD5Ef1207', '_blank')}
          >
            💳 View Collector
          </Button>
          <Button variant="outline" size="small">
            📊 Export Platform Data
          </Button>
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2">
          🔒 Security Notice
        </h4>
        <div className="text-red-800 dark:text-red-200 text-sm space-y-1">
          <p>• Administrator actions are logged and auditable</p>
          <p>• Loan approvals require careful financial review</p>
          <p>• All contract interactions are immutable on blockchain</p>
          <p>• Report any suspicious activity immediately</p>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;

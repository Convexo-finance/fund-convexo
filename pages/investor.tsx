import React from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useAccount } from 'wagmi';
import Layout from '../components/wallet/shared/Layout';
import Loading from '../components/wallet/shared/Loading';
import Button from '../components/wallet/shared/Button';
import VaultStats from '../components/vault/VaultStats';
import DepositButton from '../components/vault/DepositButton';
import WithdrawButton from '../components/vault/WithdrawButton';
import { useVaultBalance, useUSDCBalance } from '../hooks/useVault';

const InvestorPage: React.FC = () => {
  const { login, ready, authenticated, user, logout } = usePrivy();
  const { address, isConnected } = useAccount();
  
  // Fetch user balances
  const { balance: vaultBalance } = useVaultBalance(address);
  const { balance: usdcBalance } = useUSDCBalance(address);

  if (!ready) {
    return <Loading fullScreen={true} text="Loading..." />;
  }

  if (!authenticated) {
    return (
      <Layout title="Convexo - Investor Dashboard">
        <div className="text-center py-12 px-6 bg-white dark:bg-gray-800 rounded-lg shadow-md max-w-md mx-auto">
          <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-purple-600 dark:text-purple-400 text-2xl">💼</span>
          </div>
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">
            Investor Dashboard
          </h2>
          <p className="mb-8 text-gray-600 dark:text-gray-300">
            Connect your wallet to access the Convexo investment platform and start earning yield on your USDC.
          </p>
          <Button onClick={login} variant="primary" size="large" className="w-full">
            Connect Wallet
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Convexo - Investor Dashboard">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">Welcome, Investor! 💼</h1>
              <p className="text-purple-100">
                Manage your investments in the Convexo vault and earn yield from enterprise loans.
              </p>
            </div>
            <div className="text-right">
              <p className="text-purple-200 text-sm">Connected as:</p>
              <p className="font-mono text-sm truncate max-w-32">
                {user?.email?.address || user?.phone?.number || address}
              </p>
              <Button 
                onClick={logout} 
                variant="outline" 
                size="small" 
                className="mt-2 text-white border-white hover:bg-white hover:text-purple-600"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Connection Status */}
        {!isConnected && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-center">
              <span className="text-yellow-600 dark:text-yellow-400 text-xl mr-3">⚠️</span>
              <div>
                <h3 className="font-medium text-yellow-800 dark:text-yellow-200">
                  Wallet Not Connected
                </h3>
                <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                  Connect your wallet to interact with the vault contracts.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* User Portfolio Overview */}
        {isConnected && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* USDC Balance */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">USDC Balance</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${usdcBalance.toFixed(2)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 text-xl">💵</span>
                </div>
              </div>
            </div>

            {/* Vault Shares */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Vault Shares (CVXS)</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {vaultBalance.toFixed(6)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 dark:text-purple-400 text-xl">🏦</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Vault Statistics */}
        <VaultStats />

        {/* Action Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Deposit Card */}
          <DepositButton />
          
          {/* Withdraw Card */}
          <WithdrawButton />
        </div>

        {/* Information Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            📋 How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 dark:text-blue-400 text-xl">1️⃣</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Deposit USDC</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Deposit your USDC into the Convexo vault to start earning yield.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-600 dark:text-purple-400 text-xl">2️⃣</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Earn Yield</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Your funds are lent to verified enterprises, generating interest income.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 dark:text-green-400 text-xl">3️⃣</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Withdraw Anytime</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Redeem your vault shares back to USDC whenever you need liquidity.
              </p>
            </div>
          </div>
        </div>

        {/* Risk Disclaimer */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <h3 className="flex items-center font-medium text-amber-800 dark:text-amber-200 mb-2">
            ⚠️ Risk Disclaimer
          </h3>
          <p className="text-amber-700 dark:text-amber-300 text-sm">
            Investing in the Convexo vault involves risks, including the potential loss of principal. 
            Loan defaults, market conditions, and smart contract risks may affect returns. 
            Please invest responsibly and only with funds you can afford to lose.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default InvestorPage;

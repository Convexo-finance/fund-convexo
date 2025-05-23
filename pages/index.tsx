import { useState } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import Layout from '../components/shared/Layout';
import Loading from '../components/shared/Loading';
import Button from '../components/shared/Button';
import WalletInfoTailwind from '../components/wallet/WalletInfoTailwind';
import { TokenBalance, Wallet } from '../types/index';
import { useTokenBalances } from '../hooks/useTokenBalances';

export default function Home() {
  const { login, ready, authenticated, user, logout } = usePrivy();
  const { wallets } = useWallets();

  // Get embedded wallet from Privy
  const userWallet = wallets?.[0];
  
  // Use our custom hook to fetch real balances from Optimism
  const { 
    balances, 
    isLoading: isBalanceLoading, 
    refetch: refreshBalances 
  } = useTokenBalances(userWallet?.address);

  // Show loading state while Privy initializes
  if (!ready) {
    return <Loading fullScreen={true} text="Loading ETH CALI Wallet..." />;
  }

  return (
    <Layout>
      {!authenticated ? (
        // Login view with Tailwind CSS
        <div className="text-center py-12 px-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">Welcome to ETH CALI Wallet</h2>
          <p className="mb-8 text-gray-600 dark:text-gray-300">Login with email or phone to access your wallet</p>
          <Button 
            onClick={login} 
            variant="primary" 
            size="large"
          >
            Login with Privy
          </Button>
        </div>
      ) : (
        // Authenticated view with Tailwind CSS
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-2 text-gray-800 dark:text-white">Welcome back!</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Logged in as: {user?.email?.address || user?.phone?.number || 'User'}
            </p>
            
            {userWallet ? (
              <div className="space-y-8">
                {/* Embedded Wallet with Tailwind CSS */}
                <div className="space-y-2">
                  <h3 className="text-xl font-medium text-gray-800 dark:text-white">Embedded Wallet</h3>
                  <WalletInfoTailwind 
                    wallet={userWallet as unknown as Wallet} 
                    balances={balances}
                    isLoading={isBalanceLoading}
                    onRefresh={refreshBalances}
                  />
                </div>
              </div>
            ) : (
              // Loading wallet state with Tailwind CSS
              <div className="bg-white dark:bg-gray-800 p-8 rounded-lg text-center shadow">
                <p className="mb-4 text-gray-600 dark:text-gray-400">Your wallet is being created...</p>
                <div className="flex justify-center">
                  <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              </div>
            )}
            
            {/* Logout button with Tailwind CSS */}
            <div className="mt-8 text-center">
              <button 
                onClick={logout}
                className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 font-medium transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
} 
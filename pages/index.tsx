import { usePrivy, useWallets } from '@privy-io/react-auth';
import Layout from '../components/shared/Layout';
import Loading from '../components/shared/Loading';
import Button from '../components/shared/Button';
import WalletManager from '../components/wallet/WalletManager';
import { TokenBalance, Wallet } from '../types/index';

export default function Home() {
  const { login, ready, authenticated, user, logout } = usePrivy();

  if (!ready) {
    return <Loading fullScreen={true} text="Loading..." />;
  }

  return (
    <Layout>
      {!authenticated ? (
        // Simple login - Privy handles embedded + external wallets
        <div className="text-center py-12 px-6 bg-white dark:bg-gray-800 rounded-lg shadow-md max-w-md mx-auto">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">ETH CALI Wallet</h2>
          <p className="mb-8 text-gray-600 dark:text-gray-300">
            Connect with email, social, or external wallet
          </p>
          <Button onClick={login} variant="primary" size="large" className="w-full">
            Connect Wallet
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Welcome!</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {user?.email?.address || user?.phone?.number || 'User'}
                </p>
              </div>
              <button 
                onClick={logout}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Logout
              </button>
            </div>
            
            {/* Wallet Manager handles all wallet types */}
            <WalletManager />
          </div>
        </div>
      )}
    </Layout>
  );
}
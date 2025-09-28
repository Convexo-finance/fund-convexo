import React, { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import Layout from '../components/wallet/shared/Layout';
import Loading from '../components/wallet/shared/Loading';
import Button from '../components/wallet/shared/Button';
import EnterpriseProfile from '../components/enterprise/EnterpriseProfile';
import InvestorVerification from '../components/investor/InvestorVerification';

type TabType = 'profile' | 'verification' | 'investments' | 'portfolio';

const InvestorDashboard: React.FC = () => {
  const { login, ready, authenticated, user, logout } = usePrivy();
  const [activeTab, setActiveTab] = useState<TabType>('profile');

  if (!ready) {
    return <Loading fullScreen={true} text="Loading..." />;
  }

  if (!authenticated) {
    return (
      <Layout title="Convexo - Investor Platform">
        <div className="text-center py-12 px-6 bg-white dark:bg-gray-800 rounded-lg shadow-md max-w-md mx-auto">
          <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-purple-600 dark:text-purple-400 text-2xl">💼</span>
          </div>
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">
            Investor Platform
          </h2>
          <p className="mb-8 text-gray-600 dark:text-gray-300">
            Connect your wallet to access Convexo's investor platform for vault investments 
            and high-yield opportunities.
          </p>
          <Button onClick={login} variant="primary" size="large" className="w-full">
            Connect Wallet
          </Button>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
            investors.convexo.xyz - Powered by Privy
          </p>
        </div>
      </Layout>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤', description: 'Account & wallet info' },
    { id: 'verification', label: 'Verification', icon: '🆔', description: 'Veriff identity check' },
    { id: 'investments', label: 'Investments', icon: '💰', description: 'Vault operations' },
    { id: 'portfolio', label: 'Portfolio', icon: '📈', description: 'Performance tracking' },
  ] as const;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <EnterpriseProfile />;
      case 'verification':
        return <InvestorVerification />;
      case 'investments':
        return (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-purple-600 dark:text-purple-400 text-2xl">💰</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Investment Module
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Vault deposits, withdrawals, and yield tracking coming soon.
            </p>
          </div>
        );
      case 'portfolio':
        return (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-green-600 dark:text-green-400 text-2xl">📈</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Portfolio Tracking
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Performance analytics and portfolio insights coming soon.
            </p>
          </div>
        );
      default:
        return <EnterpriseProfile />;
    }
  };

  return (
    <Layout title="Convexo - Investor Dashboard">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">Investor Platform 💼</h1>
              <p className="text-purple-100">
                Simple identity verification and access to high-yield investment opportunities
              </p>
            </div>
            <div className="text-right">
              <p className="text-purple-200 text-sm">Connected as:</p>
              <p className="font-mono text-sm truncate max-w-32">
                {user?.email?.address || user?.phone?.number || 'Investor'}
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

        {/* Tab Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-1 p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex-1 flex flex-col items-center space-y-1 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                    ${activeTab === tab.id
                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span>{tab.label}</span>
                  <span className="text-xs opacity-75">{tab.description}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {renderTabContent()}
          </div>
        </div>

        {/* Investor Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Platform</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">Investor</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                <span className="text-purple-600 dark:text-purple-400 text-xl">💼</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Verification</p>
                <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">Pending</p>
              </div>
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 dark:text-yellow-400 text-xl">⏳</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Vault APY</p>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">12.5%</p>
              </div>
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <span className="text-green-600 dark:text-green-400 text-xl">📈</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Portfolio Value</p>
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">$0.00</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-400 text-xl">💎</span>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Info */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <h3 className="flex items-center font-medium text-amber-800 dark:text-amber-200 mb-2">
            💡 Investor Platform Features
          </h3>
          <div className="text-amber-700 dark:text-amber-300 text-sm space-y-1">
            <p>• Simple identity verification with passport using Veriff AI</p>
            <p>• Access to high-yield vault investments with enterprise loan backing</p>
            <p>• Real-time portfolio tracking and performance analytics</p>
            <p>• Instant liquidity with 24/7 deposit and withdrawal access</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default InvestorDashboard;

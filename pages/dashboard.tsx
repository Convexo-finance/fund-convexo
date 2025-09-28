import React, { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import Layout from '../components/wallet/shared/Layout';
import Loading from '../components/wallet/shared/Loading';
import Button from '../components/wallet/shared/Button';
import ProfileModule from '../components/dashboard/ProfileModule';
import FundingModule from '../components/dashboard/FundingModule';
import FinancialModule from '../components/dashboard/FinancialModule';
import KYCModule from '../components/dashboard/KYCModule';

type TabType = 'profile' | 'funding' | 'financial' | 'kyc';

const Dashboard: React.FC = () => {
  const { login, ready, authenticated, user, logout } = usePrivy();
  const [activeTab, setActiveTab] = useState<TabType>('profile');

  if (!ready) {
    return <Loading fullScreen={true} text="Loading..." />;
  }

  if (!authenticated) {
    return (
      <Layout title="Convexo Dashboard">
        <div className="text-center py-12 px-6 bg-white dark:bg-gray-800 rounded-lg shadow-md max-w-md mx-auto">
          <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-purple-600 dark:text-purple-400 text-2xl">🏦</span>
          </div>
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">
            Convexo Dashboard
          </h2>
          <p className="mb-8 text-gray-600 dark:text-gray-300">
            Connect your wallet to access the Convexo platform with modular financial services.
          </p>
          <Button onClick={login} variant="primary" size="large" className="w-full">
            Connect Wallet
          </Button>
        </div>
      </Layout>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'funding', label: 'Funding', icon: '💰' },
    { id: 'financial', label: 'Financial', icon: '📊' },
    { id: 'kyc', label: 'KYC', icon: '📋' },
  ] as const;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileModule user={user} />;
      case 'funding':
        return <FundingModule />;
      case 'financial':
        return <FinancialModule />;
      case 'kyc':
        return <KYCModule />;
      default:
        return <ProfileModule user={user} />;
    }
  };

  return (
    <Layout title="Convexo Dashboard">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">Convexo Dashboard 🏦</h1>
              <p className="text-purple-100">
                Modular financial platform for enterprise crowdfunding
              </p>
            </div>
            <div className="text-right">
              <p className="text-purple-200 text-sm">Connected as:</p>
              <p className="font-mono text-sm truncate max-w-32">
                {user?.email?.address || user?.phone?.number || 'User'}
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
                    flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                    ${activeTab === tab.id
                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {renderTabContent()}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Network</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">Base Sepolia</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-400 text-xl">🔗</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Provider</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">Privy</p>
              </div>
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <span className="text-green-600 dark:text-green-400 text-xl">🔐</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Status</p>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                  Connected
                </p>
              </div>
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                <span className="text-purple-600 dark:text-purple-400 text-xl">✅</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;

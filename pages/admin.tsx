import React, { useState, useEffect } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import Layout from '../components/wallet/shared/Layout';
import Loading from '../components/wallet/shared/Loading';
import Button from '../components/wallet/shared/Button';
import AdminProfile from '../components/admin/AdminProfile';
import LoanApprovals from '../components/admin/LoanApprovals';
import UserManagement from '../components/admin/UserManagement';
import PlatformMonitoring from '../components/admin/PlatformMonitoring';
import { contractService } from '../services/contractService';

type TabType = 'profile' | 'loans' | 'users' | 'monitoring';

const AdminDashboard: React.FC = () => {
  const { login, ready, authenticated, user, logout } = usePrivy();
  const { wallets } = useWallets();
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [contractsInitialized, setContractsInitialized] = useState(false);

  // Initialize contract service
  useEffect(() => {
    if (authenticated && wallets.length > 0) {
      const embeddedWallet = wallets.find(w => w.walletClientType === 'privy');
      if (embeddedWallet) {
        contractService.initialize(embeddedWallet).then(success => {
          setContractsInitialized(success);
        });
      }
    }
  }, [authenticated, wallets]);

  if (!ready) {
    return <Loading fullScreen={true} text="Loading..." />;
  }

  if (!authenticated) {
    return (
      <Layout title="Convexo - Admin Platform">
        <div className="text-center py-12 px-6 bg-white dark:bg-gray-800 rounded-lg shadow-md max-w-md mx-auto">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 dark:text-red-400 text-2xl">👨‍💼</span>
          </div>
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">
            Admin Platform
          </h2>
          <p className="mb-8 text-gray-600 dark:text-gray-300">
            Connect your wallet to access Convexo's admin platform for loan approvals, 
            user management, and platform monitoring.
          </p>
          <Button onClick={login} variant="primary" size="large" className="w-full">
            Connect Admin Wallet
          </Button>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
            convexus.xyz/admin - Admin Access Required
          </p>
        </div>
      </Layout>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤', description: 'Admin account info' },
    { id: 'loans', label: 'Loan Approvals', icon: '📋', description: 'Review & approve loans' },
    { id: 'users', label: 'User Management', icon: '👥', description: 'KYC & user status' },
    { id: 'monitoring', label: 'Monitoring', icon: '📊', description: 'Platform health' },
  ] as const;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <AdminProfile user={user} />;
      case 'loans':
        return <LoanApprovals contractsInitialized={contractsInitialized} />;
      case 'users':
        return <UserManagement />;
      case 'monitoring':
        return <PlatformMonitoring contractsInitialized={contractsInitialized} />;
      default:
        return <AdminProfile user={user} />;
    }
  };

  return (
    <Layout title="Convexo - Admin Dashboard">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">Admin Platform 👨‍💼</h1>
              <p className="text-red-100">
                Loan approvals, user management, and platform monitoring
              </p>
            </div>
            <div className="text-right">
              <p className="text-red-200 text-sm">Admin:</p>
              <p className="font-mono text-sm truncate max-w-32">
                {user?.email?.address || user?.phone?.number || 'Administrator'}
              </p>
              <Button 
                onClick={logout} 
                variant="outline" 
                size="small" 
                className="mt-2 text-white border-white hover:bg-white hover:text-red-600"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Admin Warning */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-amber-600 dark:text-amber-400 text-xl mr-3">⚠️</span>
            <div>
              <h3 className="font-medium text-amber-800 dark:text-amber-200">
                Administrator Access
              </h3>
              <p className="text-amber-700 dark:text-amber-300 text-sm">
                You have elevated permissions to approve loans, manage users, and monitor the platform.
              </p>
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
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
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

        {/* Admin Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Platform Role</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">Administrator</p>
              </div>
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <span className="text-red-600 dark:text-red-400 text-xl">👨‍💼</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Pending Loans</p>
                <p className="text-lg font-bold text-orange-600 dark:text-orange-400">3</p>
              </div>
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                <span className="text-orange-600 dark:text-orange-400 text-xl">📋</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Active Users</p>
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">47</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-400 text-xl">👥</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Vault Health</p>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">Healthy</p>
              </div>
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <span className="text-green-600 dark:text-green-400 text-xl">💚</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;

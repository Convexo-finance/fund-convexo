import React from 'react';
import Link from 'next/link';
import { usePrivy } from '@privy-io/react-auth';
import Button from '../wallet/shared/Button';

interface AppNavigationProps {
  currentView: 'onboarding' | 'funding';
  onViewChange: (view: 'onboarding' | 'funding') => void;
  user?: any;
}

const AppNavigation: React.FC<AppNavigationProps> = ({
  currentView,
  onViewChange,
  user
}) => {
  const { logout } = usePrivy();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 mb-6">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* User Info */}
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">
                {user?.email?.address?.[0]?.toUpperCase() || user?.phone?.number?.[0] || 'U'}
              </span>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                {user?.email?.address || user?.phone?.number || 'Usuario'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Bienvenido a Convexo
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => onViewChange('onboarding')}
              className={`
                px-4 py-2 rounded-md text-sm font-medium transition-colors
                ${currentView === 'onboarding'
                  ? 'bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }
              `}
            >
              📋 Onboarding
            </button>
            <button
              onClick={() => onViewChange('funding')}
              className={`
                px-4 py-2 rounded-md text-sm font-medium transition-colors
                ${currentView === 'funding'
                  ? 'bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }
              `}
            >
              💰 Funding
            </button>
          </div>

          {/* Quick Links */}
          <div className="flex items-center space-x-2">
            <Link href="/investor">
              <Button
                variant="outline"
                size="small"
                className="text-purple-600 dark:text-purple-400 border-purple-300 dark:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
              >
                💼 Investor
              </Button>
            </Link>
            <Link href="/enterprise">
              <Button
                variant="outline"
                size="small"
                className="text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                🏢 Enterprise
              </Button>
            </Link>
            <Button
              onClick={logout}
              variant="outline"
              size="small"
              className="text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 border-gray-300 dark:border-gray-600"
            >
              🚪 Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppNavigation;

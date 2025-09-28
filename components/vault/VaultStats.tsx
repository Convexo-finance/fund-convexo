import React from 'react';
import { useVaultAPY, useVaultValuePerShare } from '../../hooks/useVault';
import Loading from '../wallet/shared/Loading';

const VaultStats: React.FC = () => {
  const { apy, isLoading: apyLoading, isError: apyError } = useVaultAPY();
  const { valuePerShare, isLoading: valueLoading, isError: valueError } = useVaultValuePerShare();

  if (apyLoading || valueLoading) {
    return <Loading text="Loading vault statistics..." />;
  }

  if (apyError || valueError) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <h3 className="text-red-800 dark:text-red-200 font-medium">Error Loading Vault Data</h3>
        <p className="text-red-600 dark:text-red-300 text-sm mt-1">
          Unable to fetch vault statistics. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        📊 Convexo Vault Statistics
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* APY Card */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-700 dark:text-purple-300 text-sm font-medium">Current APY</p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {apy.toFixed(2)}%
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-200 dark:bg-purple-700 rounded-full flex items-center justify-center">
              <span className="text-purple-600 dark:text-purple-300 text-xl">📈</span>
            </div>
          </div>
          <p className="text-purple-600 dark:text-purple-400 text-xs mt-2">
            Annual Percentage Yield for vault depositors
          </p>
        </div>

        {/* Value Per Share Card */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-700 dark:text-green-300 text-sm font-medium">Value Per Share</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                ${valuePerShare.toFixed(4)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-200 dark:bg-green-700 rounded-full flex items-center justify-center">
              <span className="text-green-600 dark:text-green-300 text-xl">💰</span>
            </div>
          </div>
          <p className="text-green-600 dark:text-green-400 text-xs mt-2">
            Current USDC value of each CVXS share
          </p>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          ℹ️ About Convexo Vault
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          The Convexo Vault pools USDC deposits to fund enterprise loans, generating returns for investors 
          through loan interest payments. Your vault shares (CVXS) represent your proportional ownership 
          of the vault's underlying assets.
        </p>
      </div>
    </div>
  );
};

export default VaultStats;

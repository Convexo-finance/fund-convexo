import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Button from '../wallet/shared/Button';
import { usePrivyContracts } from '../../hooks/usePrivyContracts';

type FundingMode = 'investor' | 'enterprise';

const FundingModule: React.FC = () => {
  const { isConnected } = usePrivyContracts();
  const router = useRouter();
  const [mode, setMode] = useState<FundingMode>('investor');

  if (!isConnected) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-yellow-600 dark:text-yellow-400 text-2xl">⚠️</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Wallet Not Connected
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Connect your Privy wallet to access funding features.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Funding Operations</h2>
        
        {/* Mode Toggle */}
        <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setMode('investor')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              mode === 'investor'
                ? 'bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            💼 Investor
          </button>
          <button
            onClick={() => setMode('enterprise')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              mode === 'enterprise'
                ? 'bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            🏢 Enterprise
          </button>
        </div>
      </div>

      {mode === 'investor' ? (
        // Investor Mode: Vault Operations
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
            <h3 className="text-green-800 dark:text-green-200 font-semibold mb-2">
              💼 Investor Mode
            </h3>
            <p className="text-green-700 dark:text-green-300 text-sm">
              Deposit USDC into the vault to earn yield from enterprise loans. Withdraw your shares anytime.
            </p>
          </div>

          {/* Simplified Investment Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">💰 Deposit USDC</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                Deposit USDC to earn yield from the Convexo vault.
              </p>
              <Button 
                onClick={() => router.push('/contracts')}
                variant="primary" 
                className="w-full"
              >
                🧪 Test Live Vault
              </Button>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">💸 Withdraw</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                Redeem your vault shares back to USDC.
              </p>
              <Button 
                onClick={() => router.push('/contracts')}
                variant="secondary" 
                className="w-full"
              >
                🧪 Test Live Vault
              </Button>
            </div>
          </div>
        </div>
      ) : (
        // Enterprise Mode: Loan Operations
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
            <h3 className="text-blue-800 dark:text-blue-200 font-semibold mb-2">
              🏢 Enterprise Mode
            </h3>
            <p className="text-blue-700 dark:text-blue-300 text-sm">
              Manage your loans and make repayments. View loan status and payment history.
            </p>
          </div>

          {/* Simplified Loan Management */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">📄 Loan Status</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                Check your active loans and payment history.
              </p>
              <Button 
                onClick={() => router.push('/contracts')}
                variant="outline" 
                className="w-full"
              >
                🧪 Test Live Loans
              </Button>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">💳 Repay Loan</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                Make payments towards your active loans.
              </p>
              <Button 
                onClick={() => router.push('/contracts')}
                variant="primary" 
                className="w-full"
              >
                🧪 Test Live Payments
              </Button>
            </div>
          </div>

          {/* Additional Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              📊 Loan Management Tools
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" className="text-left justify-start">
                📈 View Payment History
              </Button>
              <Button variant="outline" className="text-left justify-start">
                📄 Download Loan Documents
              </Button>
              <Button variant="outline" className="text-left justify-start">
                📞 Contact Support
              </Button>
              <Button variant="outline" className="text-left justify-start">
                ⚙️ Loan Settings
              </Button>
            </div>
          </div>

          {/* Info Section */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
              💡 Loan Repayment Tips
            </h4>
            <div className="text-amber-800 dark:text-amber-200 text-sm space-y-1">
              <p>• <strong>On-time payments:</strong> Maintain good standing and avoid late fees</p>
              <p>• <strong>Full payment:</strong> Use the "FULL" button to pay off remaining balance</p>
              <p>• <strong>Partial payments:</strong> Make any amount payment to reduce your debt</p>
              <p>• <strong>USDC required:</strong> Ensure sufficient USDC balance before payment</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FundingModule;

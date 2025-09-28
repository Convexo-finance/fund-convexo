import React, { useState, useEffect } from 'react';
import Button from '../wallet/shared/Button';
import { usePrivyContracts } from '../../hooks/usePrivyContracts';

interface LoanData {
  borrower: string;
  principal: number;
  interestRate: number;
  termLength: number;
  startTime: number;
  amountPaid: number;
  isActive: boolean;
}

const LoanNFTInterface: React.FC = () => {
  const { walletAddress, isConnected, getLoanStatus } = usePrivyContracts();
  
  const [loanId, setLoanId] = useState('1');
  const [loanData, setLoanData] = useState<LoanData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadLoanData = async () => {
    if (!loanId || parseInt(loanId) <= 0) return;
    
    setLoading(true);
    setError('');
    
    try {
      const data = await getLoanStatus(parseInt(loanId));
      setLoanData(data);
      if (!data) {
        setError('Loan not found or invalid loan ID');
      }
    } catch (err: any) {
      setError(`Error: ${err.message}`);
      setLoanData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loanId && parseInt(loanId) > 0) {
      loadLoanData();
    }
  }, [loanId]);

  const calculateRemainingBalance = (loan: LoanData) => {
    const totalOwed = loan.principal * (1 + loan.interestRate / 10000);
    return Math.max(0, totalOwed - loan.amountPaid);
  };

  const calculateProgress = (loan: LoanData) => {
    const totalOwed = loan.principal * (1 + loan.interestRate / 10000);
    return totalOwed > 0 ? (loan.amountPaid / totalOwed) * 100 : 0;
  };

  if (!isConnected) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-yellow-600 dark:text-yellow-400 text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Wallet Not Connected
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Connect your Privy wallet to view loan information.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          📄 Loan NFT Interface
        </h2>
      </div>

      {/* Loan ID Input */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          🔍 Query Loan by ID
        </h3>
        
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Loan ID
            </label>
            <input
              type="number"
              value={loanId}
              onChange={(e) => setLoanId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter loan ID (1, 2, 3...)"
              min="1"
            />
          </div>
          <div className="pt-6">
            <Button
              onClick={loadLoanData}
              variant="primary"
              disabled={loading || !loanId || parseInt(loanId) <= 0}
            >
              {loading ? '🔄' : '🔍'} Query
            </Button>
          </div>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Loan Details */}
      {loanData && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              📋 Loan #{loanId} Details
            </h3>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              loanData.isActive 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
            }`}>
              {loanData.isActive ? '🟢 Active' : '⚪ Inactive'}
            </div>
          </div>

          {/* Loan Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Principal</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                ${loanData.principal.toFixed(2)}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Interest Rate</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {loanData.interestRate.toFixed(2)}%
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Amount Paid</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">
                ${loanData.amountPaid.toFixed(2)}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Remaining</p>
              <p className="text-xl font-bold text-red-600 dark:text-red-400">
                ${calculateRemainingBalance(loanData).toFixed(2)}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Term Length</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {Math.floor(loanData.termLength / (24 * 60 * 60))} days
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Start Date</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {new Date(loanData.startTime * 1000).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Repayment Progress
              </p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {calculateProgress(loanData).toFixed(1)}%
              </p>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
              <div 
                className="bg-purple-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(calculateProgress(loanData), 100)}%` }}
              />
            </div>
          </div>

          {/* Borrower Info */}
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-blue-800 dark:text-blue-200 text-sm">
              <strong>Borrower:</strong> <span className="font-mono">{loanData.borrower}</span>
            </p>
          </div>
        </div>
      )}

      {/* Contract Info */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
          📋 Contract Information
        </h4>
        <div className="text-gray-600 dark:text-gray-400 text-sm space-y-1">
          <p><strong>LoanNoteNFT:</strong> <span className="font-mono">0x0B6962F7468BA68A8715ccb67233B54c8dEb5b73</span></p>
          <p><strong>Network:</strong> Base Sepolia (Chain ID: 84532)</p>
          <p><strong>Explorer:</strong> <a href="https://sepolia.basescan.org/address/0x0B6962F7468BA68A8715ccb67233B54c8dEb5b73" target="_blank" className="text-blue-600 dark:text-blue-400 hover:underline">View on BaseScan</a></p>
        </div>
      </div>
    </div>
  );
};

export default LoanNFTInterface;

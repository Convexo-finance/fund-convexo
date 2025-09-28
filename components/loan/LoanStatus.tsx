import React, { useState } from 'react';
import { useLoanStatus, calculateRemainingBalance, calculateLoanProgress } from '../../hooks/useLoans';
import Loading from '../wallet/shared/Loading';
import Button from '../wallet/shared/Button';

interface LoanStatusProps {
  defaultLoanId?: number;
}

const LoanStatus: React.FC<LoanStatusProps> = ({ defaultLoanId = 1 }) => {
  const [loanId, setLoanId] = useState(defaultLoanId.toString());
  const { loan, isLoading, isError, refetch } = useLoanStatus(parseInt(loanId));

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) {
    return <Loading text="Loading loan information..." />;
  }

  if (isError) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          📄 Loan Status
        </h2>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h3 className="text-red-800 dark:text-red-200 font-medium">Error Loading Loan</h3>
          <p className="text-red-600 dark:text-red-300 text-sm mt-1">
            Unable to fetch loan information. Please check the loan ID and try again.
          </p>
          <Button onClick={handleRefresh} variant="outline" size="small" className="mt-3">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const remainingBalance = loan ? calculateRemainingBalance(loan) : 0;
  const progress = loan ? calculateLoanProgress(loan) : 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          📄 Loan Status
        </h2>
        <Button onClick={handleRefresh} variant="outline" size="small">
          🔄 Refresh
        </Button>
      </div>

      {/* Loan ID Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Loan ID
        </label>
        <input
          type="number"
          value={loanId}
          onChange={(e) => setLoanId(e.target.value)}
          placeholder="Enter loan ID"
          min="1"
          className="w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                   bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                   focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      {loan ? (
        <div className="space-y-6">
          {/* Loan Status Banner */}
          <div className={`p-4 rounded-lg border ${
            loan.isActive 
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
              : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`font-semibold ${
                  loan.isActive 
                    ? 'text-green-800 dark:text-green-200' 
                    : 'text-gray-700 dark:text-gray-300'
                }`}>
                  Loan #{loanId}
                </h3>
                <p className={`text-sm ${
                  loan.isActive 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  Status: {loan.isActive ? 'Active' : 'Inactive/Paid Off'}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                loan.isActive 
                  ? 'bg-green-200 dark:bg-green-700' 
                  : 'bg-gray-200 dark:bg-gray-600'
              }`}>
                <span className={`text-xl ${
                  loan.isActive 
                    ? 'text-green-600 dark:text-green-300' 
                    : 'text-gray-600 dark:text-gray-300'
                }`}>
                  {loan.isActive ? '📄' : '✅'}
                </span>
              </div>
            </div>
          </div>

          {/* Loan Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Principal Amount */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Principal Amount</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                ${loan.principal.toFixed(2)} USDC
              </p>
            </div>

            {/* Interest Rate */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Interest Rate</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {loan.interestRate.toFixed(2)}%
              </p>
            </div>

            {/* Amount Paid */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Amount Paid</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">
                ${loan.amountPaid.toFixed(2)} USDC
              </p>
            </div>

            {/* Remaining Balance */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Remaining Balance</p>
              <p className="text-xl font-bold text-red-600 dark:text-red-400">
                ${remainingBalance.toFixed(2)} USDC
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
                {progress.toFixed(1)}%
              </p>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
              <div 
                className="bg-purple-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>

          {/* Additional Info */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
            <h4 className="font-semibold text-gray-700 dark:text-gray-300">Additional Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Borrower:</span>
                <span className="ml-2 font-mono text-gray-900 dark:text-white">
                  {loan.borrower}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Term Length:</span>
                <span className="ml-2 text-gray-900 dark:text-white">
                  {loan.termLength} seconds
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Start Time:</span>
                <span className="ml-2 text-gray-900 dark:text-white">
                  {new Date(loan.startTime * 1000).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-gray-400 dark:text-gray-500 text-2xl">🔍</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Loan Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Enter a valid loan ID to view loan information.
          </p>
        </div>
      )}
    </div>
  );
};

export default LoanStatus;

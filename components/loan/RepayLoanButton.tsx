import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { 
  useRepayLoan, 
  useUSDCBalance, 
  useUSDCAllowanceForCollector, 
  useLoanStatus,
  calculateRemainingBalance 
} from '../../hooks/useLoans';
import Button from '../wallet/shared/Button';

interface RepayLoanButtonProps {
  defaultLoanId?: number;
}

const RepayLoanButton: React.FC<RepayLoanButtonProps> = ({ defaultLoanId = 1 }) => {
  const { address } = useAccount();
  const [loanId, setLoanId] = useState(defaultLoanId.toString());
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<'input' | 'approve' | 'repay'>('input');

  const { balance: usdcBalance } = useUSDCBalance(address);
  const { allowance } = useUSDCAllowanceForCollector(address);
  const { loan } = useLoanStatus(parseInt(loanId));
  const { 
    approveUSDC, 
    repayLoan, 
    isPending, 
    isConfirming, 
    isSuccess, 
    error 
  } = useRepayLoan();

  const repayAmount = parseFloat(amount) || 0;
  const remainingBalance = loan ? calculateRemainingBalance(loan) : 0;
  const hasBalance = usdcBalance >= repayAmount;
  const hasAllowance = allowance >= repayAmount;
  const isValidLoan = loan && loan.isActive;

  const handleApprove = () => {
    if (repayAmount > 0) {
      approveUSDC(repayAmount);
      setStep('approve');
    }
  };

  const handleRepay = () => {
    if (repayAmount > 0 && parseInt(loanId) > 0) {
      repayLoan(parseInt(loanId), repayAmount);
      setStep('repay');
    }
  };

  const resetForm = () => {
    setAmount('');
    setStep('input');
  };

  // Success state
  if (isSuccess) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-green-600 dark:text-green-400 text-2xl">✅</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Payment Successful!
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            You have successfully paid {amount} USDC towards loan #{loanId}.
          </p>
          <Button onClick={resetForm} variant="primary">
            Make Another Payment
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        💳 Repay Loan
      </h2>

      {/* Balance Display */}
      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Your USDC Balance: <span className="font-semibold text-gray-900 dark:text-white">
            {usdcBalance.toFixed(2)} USDC
          </span>
        </p>
      </div>

      {/* Loan ID Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Loan ID
        </label>
        <input
          type="number"
          value={loanId}
          onChange={(e) => setLoanId(e.target.value)}
          placeholder="Enter loan ID"
          min="1"
          disabled={isPending || isConfirming}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                   bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                   focus:ring-2 focus:ring-purple-500 focus:border-transparent
                   disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      {/* Loan Information */}
      {isValidLoan && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Loan #{loanId} Details</h4>
          <div className="space-y-1 text-sm">
            <p className="text-blue-800 dark:text-blue-200">
              Principal: <span className="font-semibold">${loan.principal.toFixed(2)} USDC</span>
            </p>
            <p className="text-blue-800 dark:text-blue-200">
              Amount Paid: <span className="font-semibold">${loan.amountPaid.toFixed(2)} USDC</span>
            </p>
            <p className="text-blue-800 dark:text-blue-200">
              Remaining Balance: <span className="font-semibold text-red-600 dark:text-red-400">
                ${remainingBalance.toFixed(2)} USDC
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Amount Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Payment Amount (USDC)
        </label>
        <div className="relative">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
            disabled={isPending || isConfirming || !isValidLoan}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-purple-500 focus:border-transparent
                     disabled:opacity-50 disabled:cursor-not-allowed"
          />
          {isValidLoan && (
            <>
              <button
                onClick={() => setAmount(usdcBalance.toString())}
                className="absolute right-16 top-1/2 transform -translate-y-1/2 
                         text-xs text-purple-600 dark:text-purple-400 hover:text-purple-800 
                         dark:hover:text-purple-200 font-medium"
                disabled={isPending || isConfirming}
              >
                MAX
              </button>
              <button
                onClick={() => setAmount(remainingBalance.toString())}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 
                         text-xs text-green-600 dark:text-green-400 hover:text-green-800 
                         dark:hover:text-green-200 font-medium"
                disabled={isPending || isConfirming}
              >
                FULL
              </button>
            </>
          )}
        </div>
      </div>

      {/* Validation Messages */}
      {!isValidLoan && parseInt(loanId) > 0 && (
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-yellow-700 dark:text-yellow-300 text-sm">
            Loan #{loanId} is not active or does not exist. Please check the loan ID.
          </p>
        </div>
      )}

      {repayAmount > remainingBalance && isValidLoan && (
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-yellow-700 dark:text-yellow-300 text-sm">
            Payment amount exceeds remaining balance. Consider paying ${remainingBalance.toFixed(2)} USDC to fully pay off the loan.
          </p>
        </div>
      )}

      {repayAmount > 0 && !hasBalance && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-700 dark:text-red-300 text-sm">
            Insufficient USDC balance. You need {repayAmount.toFixed(2)} USDC but only have {usdcBalance.toFixed(2)} USDC.
          </p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-700 dark:text-red-300 text-sm">
            Transaction failed: {error.message}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        {!hasAllowance && repayAmount > 0 && hasBalance && isValidLoan ? (
          <Button
            onClick={handleApprove}
            variant="primary"
            size="large"
            className="w-full"
            disabled={isPending || isConfirming || !address}
          >
            {isPending && step === 'approve' ? 'Approving...' : 'Approve USDC'}
          </Button>
        ) : (
          <Button
            onClick={handleRepay}
            variant="primary"
            size="large"
            className="w-full"
            disabled={
              !repayAmount || 
              !hasBalance || 
              !hasAllowance || 
              !isValidLoan ||
              isPending || 
              isConfirming || 
              !address ||
              parseInt(loanId) <= 0
            }
          >
            {isPending && step === 'repay' 
              ? 'Processing Payment...' 
              : isConfirming 
              ? 'Confirming...' 
              : 'Repay Loan'
            }
          </Button>
        )}
      </div>

      {/* Transaction Status */}
      {(isPending || isConfirming) && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-blue-700 dark:text-blue-300 text-sm">
            {isPending ? 'Please confirm the transaction in your wallet...' : 'Transaction confirming on blockchain...'}
          </p>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          💡 <strong>Note:</strong> Loan payments are processed through the Collector contract. 
          Make sure you have sufficient USDC balance and the loan is active before making a payment.
        </p>
      </div>
    </div>
  );
};

export default RepayLoanButton;

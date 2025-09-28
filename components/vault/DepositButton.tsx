import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { useDeposit, useUSDCBalance, useUSDCAllowance } from '../../hooks/useVault';
import Button from '../wallet/shared/Button';

const DepositButton: React.FC = () => {
  const { address } = useAccount();
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<'input' | 'approve' | 'deposit'>('input');

  const { balance: usdcBalance } = useUSDCBalance(address);
  const { allowance } = useUSDCAllowance(address);
  const { 
    approveUSDC, 
    deposit, 
    isPending, 
    isConfirming, 
    isSuccess, 
    error 
  } = useDeposit();

  const depositAmount = parseFloat(amount) || 0;
  const hasBalance = usdcBalance >= depositAmount;
  const hasAllowance = allowance >= depositAmount;

  const handleApprove = () => {
    if (depositAmount > 0) {
      approveUSDC(depositAmount);
      setStep('approve');
    }
  };

  const handleDeposit = () => {
    if (depositAmount > 0 && address) {
      deposit(depositAmount, address);
      setStep('deposit');
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
            Deposit Successful!
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            You have successfully deposited {amount} USDC into the Convexo Vault.
          </p>
          <Button onClick={resetForm} variant="primary">
            Make Another Deposit
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        💰 Deposit USDC
      </h2>

      {/* Balance Display */}
      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Your USDC Balance: <span className="font-semibold text-gray-900 dark:text-white">
            {usdcBalance.toFixed(2)} USDC
          </span>
        </p>
      </div>

      {/* Amount Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Deposit Amount (USDC)
        </label>
        <div className="relative">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
            disabled={isPending || isConfirming}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-purple-500 focus:border-transparent
                     disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={() => setAmount(usdcBalance.toString())}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 
                     text-xs text-purple-600 dark:text-purple-400 hover:text-purple-800 
                     dark:hover:text-purple-200 font-medium"
            disabled={isPending || isConfirming}
          >
            MAX
          </button>
        </div>
      </div>

      {/* Validation Messages */}
      {depositAmount > 0 && !hasBalance && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-700 dark:text-red-300 text-sm">
            Insufficient USDC balance. You need {depositAmount.toFixed(2)} USDC but only have {usdcBalance.toFixed(2)} USDC.
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
        {!hasAllowance && depositAmount > 0 && hasBalance ? (
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
            onClick={handleDeposit}
            variant="primary"
            size="large"
            className="w-full"
            disabled={
              !depositAmount || 
              !hasBalance || 
              !hasAllowance || 
              isPending || 
              isConfirming || 
              !address
            }
          >
            {isPending && step === 'deposit' 
              ? 'Depositing...' 
              : isConfirming 
              ? 'Confirming...' 
              : 'Deposit USDC'
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
    </div>
  );
};

export default DepositButton;

import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { useWithdraw, useVaultBalance, useVaultValuePerShare } from '../../hooks/useVault';
import Button from '../wallet/shared/Button';

const WithdrawButton: React.FC = () => {
  const { address } = useAccount();
  const [shares, setShares] = useState('');
  
  const { balance: vaultBalance } = useVaultBalance(address);
  const { valuePerShare } = useVaultValuePerShare();
  const { 
    withdraw, 
    isPending, 
    isConfirming, 
    isSuccess, 
    error 
  } = useWithdraw();

  const shareAmount = parseFloat(shares) || 0;
  const hasShares = vaultBalance >= shareAmount;
  const estimatedUSDC = shareAmount * valuePerShare;

  const handleWithdraw = () => {
    if (shareAmount > 0 && address) {
      withdraw(shareAmount, address);
    }
  };

  const resetForm = () => {
    setShares('');
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
            Withdrawal Successful!
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            You have successfully withdrawn {shares} CVXS shares from the vault.
          </p>
          <Button onClick={resetForm} variant="primary">
            Make Another Withdrawal
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        💸 Withdraw from Vault
      </h2>

      {/* Balance Display */}
      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="space-y-1">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Your CVXS Shares: <span className="font-semibold text-gray-900 dark:text-white">
              {vaultBalance.toFixed(6)} CVXS
            </span>
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Estimated Value: <span className="font-semibold text-gray-900 dark:text-white">
              ${(vaultBalance * valuePerShare).toFixed(2)} USDC
            </span>
          </p>
        </div>
      </div>

      {/* Shares Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Shares to Withdraw (CVXS)
        </label>
        <div className="relative">
          <input
            type="number"
            value={shares}
            onChange={(e) => setShares(e.target.value)}
            placeholder="0.000000"
            min="0"
            step="0.000001"
            disabled={isPending || isConfirming}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-purple-500 focus:border-transparent
                     disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={() => setShares(vaultBalance.toString())}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 
                     text-xs text-purple-600 dark:text-purple-400 hover:text-purple-800 
                     dark:hover:text-purple-200 font-medium"
            disabled={isPending || isConfirming}
          >
            MAX
          </button>
        </div>
        
        {/* Estimated USDC */}
        {shareAmount > 0 && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Estimated USDC to receive: <span className="font-semibold text-green-600 dark:text-green-400">
              ${estimatedUSDC.toFixed(2)} USDC
            </span>
          </p>
        )}
      </div>

      {/* Validation Messages */}
      {shareAmount > 0 && !hasShares && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-700 dark:text-red-300 text-sm">
            Insufficient vault shares. You need {shareAmount.toFixed(6)} CVXS but only have {vaultBalance.toFixed(6)} CVXS.
          </p>
        </div>
      )}

      {vaultBalance === 0 && (
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-yellow-700 dark:text-yellow-300 text-sm">
            You don't have any vault shares to withdraw. Deposit USDC first to receive CVXS shares.
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

      {/* Action Button */}
      <Button
        onClick={handleWithdraw}
        variant="secondary"
        size="large"
        className="w-full"
        disabled={
          !shareAmount || 
          !hasShares || 
          isPending || 
          isConfirming || 
          !address ||
          vaultBalance === 0
        }
      >
        {isPending 
          ? 'Withdrawing...' 
          : isConfirming 
          ? 'Confirming...' 
          : 'Withdraw Shares'
        }
      </Button>

      {/* Transaction Status */}
      {(isPending || isConfirming) && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-blue-700 dark:text-blue-300 text-sm">
            {isPending ? 'Please confirm the transaction in your wallet...' : 'Transaction confirming on blockchain...'}
          </p>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-blue-700 dark:text-blue-300 text-sm">
          💡 <strong>Note:</strong> Withdrawing converts your CVXS shares back to USDC at the current value per share rate. 
          The amount you receive may differ from your original deposit due to vault performance.
        </p>
      </div>
    </div>
  );
};

export default WithdrawButton;

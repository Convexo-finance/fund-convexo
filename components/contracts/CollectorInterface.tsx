import React, { useState, useEffect } from 'react';
import Button from '../wallet/shared/Button';
import { usePrivyContracts } from '../../hooks/usePrivyContracts';

const CollectorInterface: React.FC = () => {
  const { 
    walletAddress, 
    isConnected, 
    getUSDCBalance,
    getLoanStatus,
    approveUSDC,
    repayLoan,
    isLoading 
  } = usePrivyContracts();

  const [usdcBalance, setUsdcBalance] = useState(0);
  const [loanId, setLoanId] = useState('1');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [loanData, setLoanData] = useState<any>(null);
  const [txStatus, setTxStatus] = useState<string>('');
  const [loadingData, setLoadingData] = useState(false);

  // Load USDC balance
  const loadBalance = async () => {
    if (!walletAddress) return;
    
    try {
      const balance = await getUSDCBalance(walletAddress);
      setUsdcBalance(balance);
    } catch (error) {
      console.error('Error loading USDC balance:', error);
    }
  };

  // Load loan data
  const loadLoanData = async () => {
    if (!loanId || parseInt(loanId) <= 0) return;
    
    setLoadingData(true);
    try {
      const data = await getLoanStatus(parseInt(loanId));
      setLoanData(data);
    } catch (error) {
      console.error('Error loading loan data:', error);
      setLoanData(null);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (isConnected && walletAddress) {
      loadBalance();
    }
  }, [isConnected, walletAddress]);

  useEffect(() => {
    loadLoanData();
  }, [loanId]);

  const handleRepayment = async () => {
    if (!walletAddress || !loanId || !paymentAmount) return;
    
    const amount = parseFloat(paymentAmount);
    const loanIdNum = parseInt(loanId);
    
    if (amount <= 0 || amount > usdcBalance || loanIdNum <= 0) return;

    try {
      setTxStatus('Approving USDC for Collector...');
      
      // First approve USDC to Collector contract
      const collectorAddress = '0xf489d4c235895750Cf6EC06C7B26187aD5Ef1207' as `0x${string}`;
      await approveUSDC(collectorAddress, amount);
      
      setTxStatus('Processing loan payment...');
      
      // Then make the payment
      const hash = await repayLoan(loanIdNum, amount);
      
      setTxStatus(`Success! Payment recorded. Tx: ${hash}`);
      setPaymentAmount('');
      
      // Reload data after successful payment
      setTimeout(() => {
        loadBalance();
        loadLoanData();
      }, 2000);
    } catch (error: any) {
      setTxStatus(`Error: ${error.message}`);
    }
  };

  const calculateRemainingBalance = (loan: any) => {
    if (!loan) return 0;
    const totalOwed = loan.principal * (1 + loan.interestRate / 10000);
    return Math.max(0, totalOwed - loan.amountPaid);
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
            Connect your Privy wallet to make loan payments.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          💳 Collector Interface
        </h2>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          USDC Balance: {usdcBalance.toFixed(2)}
        </div>
      </div>

      {/* Loan Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          📋 Select Loan for Payment
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
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
              placeholder="1"
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Payment Amount (USDC)
            </label>
            <div className="relative">
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="0.00"
                disabled={isLoading}
              />
              <button
                onClick={() => setPaymentAmount(usdcBalance.toString())}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 
                         text-xs text-purple-600 dark:text-purple-400 hover:text-purple-800 
                         dark:hover:text-purple-200 font-medium"
                disabled={isLoading}
              >
                MAX
              </button>
            </div>
          </div>

          <div className="flex items-end">
            <Button
              onClick={handleRepayment}
              variant="primary"
              size="large"
              className="w-full"
              disabled={
                isLoading || 
                !paymentAmount || 
                !loanId ||
                parseFloat(paymentAmount) <= 0 || 
                parseFloat(paymentAmount) > usdcBalance ||
                parseInt(loanId) <= 0
              }
            >
              {isLoading ? 'Processing...' : '💳 Make Payment'}
            </Button>
          </div>
        </div>

        {/* Quick Payment Buttons */}
        {loanData && loanData.isActive && (
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              onClick={() => setPaymentAmount('100')}
              variant="outline"
              size="small"
              disabled={isLoading}
            >
              $100
            </Button>
            <Button
              onClick={() => setPaymentAmount('500')}
              variant="outline"
              size="small"
              disabled={isLoading}
            >
              $500
            </Button>
            <Button
              onClick={() => setPaymentAmount('1000')}
              variant="outline"
              size="small"
              disabled={isLoading}
            >
              $1,000
            </Button>
            <Button
              onClick={() => setPaymentAmount(calculateRemainingBalance(loanData).toString())}
              variant="outline"
              size="small"
              disabled={isLoading}
            >
              Pay Full Balance
            </Button>
          </div>
        )}
      </div>

      {/* Current Loan Info */}
      {loanData && (
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-6 border border-blue-200 dark:border-blue-700">
          <h3 className="text-blue-800 dark:text-blue-200 font-semibold mb-4">
            📊 Loan #{loanId} Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-800 dark:text-blue-200 text-sm">
            <div>
              <p><strong>Borrower:</strong> <span className="font-mono text-xs">{loanData.borrower}</span></p>
              <p><strong>Principal:</strong> ${loanData.principal.toFixed(2)} USDC</p>
              <p><strong>Interest Rate:</strong> {loanData.interestRate.toFixed(2)}%</p>
            </div>
            <div>
              <p><strong>Amount Paid:</strong> ${loanData.amountPaid.toFixed(2)} USDC</p>
              <p><strong>Remaining:</strong> ${calculateRemainingBalance(loanData).toFixed(2)} USDC</p>
              <p><strong>Status:</strong> {loanData.isActive ? 'Active' : 'Inactive'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Status */}
      {txStatus && (
        <div className={`rounded-lg p-4 border ${
          txStatus.includes('Success') 
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
            : txStatus.includes('Error')
            ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
            : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
        }`}>
          <p className={`text-sm font-medium ${
            txStatus.includes('Success') 
              ? 'text-green-800 dark:text-green-200'
              : txStatus.includes('Error')
              ? 'text-red-800 dark:text-red-200'
              : 'text-blue-800 dark:text-blue-200'
          }`}>
            {txStatus}
          </p>
        </div>
      )}

      {/* Contract Info */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
          📋 Contract Information
        </h4>
        <div className="text-gray-600 dark:text-gray-400 text-sm space-y-1">
          <p><strong>Collector Address:</strong> <span className="font-mono">0xf489d4c235895750Cf6EC06C7B26187aD5Ef1207</span></p>
          <p><strong>USDC Address:</strong> <span className="font-mono">0x036CbD53842c5426634e7929541eC2318f3dCF7e</span></p>
          <p><strong>Network:</strong> Base Sepolia (Chain ID: 84532)</p>
          <p><strong>Function:</strong> recordPayment(uint256 loanId, uint256 amount)</p>
        </div>
      </div>
    </div>
  );
};

export default CollectorInterface;

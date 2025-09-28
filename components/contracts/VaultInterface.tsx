import React, { useState, useEffect } from 'react';
import Button from '../wallet/shared/Button';
import Loading from '../wallet/shared/Loading';
import { usePrivyContracts } from '../../hooks/usePrivyContracts';

const VaultInterface: React.FC = () => {
  const { 
    walletAddress, 
    isConnected, 
    getUSDCBalance, 
    getVaultAPY, 
    getVaultValuePerShare,
    getVaultBalance,
    approveUSDC,
    depositToVault,
    withdrawFromVault,
    isLoading 
  } = usePrivyContracts();

  const [usdcBalance, setUsdcBalance] = useState(0);
  const [vaultBalance, setVaultBalance] = useState(0);
  const [apy, setApy] = useState(0);
  const [valuePerShare, setValuePerShare] = useState(1);
  const [loadingData, setLoadingData] = useState(false);
  
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawShares, setWithdrawShares] = useState('');
  const [txStatus, setTxStatus] = useState<string>('');

  // Load all data
  const loadData = async () => {
    if (!walletAddress || !isConnected) return;
    
    setLoadingData(true);
    try {
      const [usdc, vault, apyData, valueData] = await Promise.all([
        getUSDCBalance(walletAddress),
        getVaultBalance(walletAddress),
        getVaultAPY(),
        getVaultValuePerShare(),
      ]);
      
      setUsdcBalance(usdc);
      setVaultBalance(vault);
      setApy(apyData);
      setValuePerShare(valueData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [walletAddress, isConnected]);

  const handleDeposit = async () => {
    if (!walletAddress || !depositAmount) return;
    
    const amount = parseFloat(depositAmount);
    if (amount <= 0 || amount > usdcBalance) return;

    try {
      setTxStatus('Approving USDC...');
      await approveUSDC(walletAddress, amount);
      
      setTxStatus('Depositing to vault...');
      const hash = await depositToVault(amount, walletAddress);
      
      setTxStatus(`Success! Tx: ${hash}`);
      setDepositAmount('');
      
      // Reload data after successful deposit
      setTimeout(loadData, 2000);
    } catch (error: any) {
      setTxStatus(`Error: ${error.message}`);
    }
  };

  const handleWithdraw = async () => {
    if (!walletAddress || !withdrawShares) return;
    
    const shares = parseFloat(withdrawShares);
    if (shares <= 0 || shares > vaultBalance) return;

    try {
      setTxStatus('Withdrawing from vault...');
      const hash = await withdrawFromVault(shares, walletAddress);
      
      setTxStatus(`Success! Tx: ${hash}`);
      setWithdrawShares('');
      
      // Reload data after successful withdrawal
      setTimeout(loadData, 2000);
    } catch (error: any) {
      setTxStatus(`Error: ${error.message}`);
    }
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
            Connect your Privy wallet to interact with the Convexo Vault.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          🏦 Convexo Vault Interface
        </h2>
        <Button onClick={loadData} variant="outline" size="small" disabled={loadingData}>
          {loadingData ? '🔄' : '🔄 Refresh'}
        </Button>
      </div>

      {/* Vault Statistics */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-700">
        <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-4">
          📊 Live Vault Data
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {loadingData ? '...' : `${apy.toFixed(2)}%`}
            </div>
            <div className="text-sm text-purple-700 dark:text-purple-300">Current APY</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              ${loadingData ? '...' : valuePerShare.toFixed(4)}
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300">Value/Share</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {loadingData ? '...' : `${usdcBalance.toFixed(2)}`}
            </div>
            <div className="text-sm text-green-700 dark:text-green-300">USDC Balance</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {loadingData ? '...' : `${vaultBalance.toFixed(6)}`}
            </div>
            <div className="text-sm text-orange-700 dark:text-orange-300">CVXS Shares</div>
          </div>
        </div>
      </div>

      {/* Contract Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deposit */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            💰 Deposit USDC
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Amount (USDC)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0.00"
                  disabled={isLoading}
                />
                <button
                  onClick={() => setDepositAmount(usdcBalance.toString())}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 
                           text-xs text-purple-600 dark:text-purple-400 hover:text-purple-800 
                           dark:hover:text-purple-200 font-medium"
                  disabled={isLoading}
                >
                  MAX
                </button>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                You will receive: <span className="font-semibold text-gray-900 dark:text-white">
                  {depositAmount && valuePerShare > 0 
                    ? `${(parseFloat(depositAmount) / valuePerShare).toFixed(6)} CVXS` 
                    : '0 CVXS'
                  }
                </span>
              </p>
            </div>

            <Button
              onClick={handleDeposit}
              variant="primary"
              size="large"
              className="w-full"
              disabled={
                isLoading || 
                !depositAmount || 
                parseFloat(depositAmount) <= 0 || 
                parseFloat(depositAmount) > usdcBalance
              }
            >
              {isLoading ? 'Processing...' : '💰 Deposit to Vault'}
            </Button>
          </div>
        </div>

        {/* Withdraw */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            💸 Withdraw CVXS
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Shares (CVXS)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={withdrawShares}
                  onChange={(e) => setWithdrawShares(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0.000000"
                  disabled={isLoading}
                />
                <button
                  onClick={() => setWithdrawShares(vaultBalance.toString())}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 
                           text-xs text-purple-600 dark:text-purple-400 hover:text-purple-800 
                           dark:hover:text-purple-200 font-medium"
                  disabled={isLoading}
                >
                  MAX
                </button>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                You will receive: <span className="font-semibold text-gray-900 dark:text-white">
                  {withdrawShares 
                    ? `${(parseFloat(withdrawShares) * valuePerShare).toFixed(2)} USDC` 
                    : '0 USDC'
                  }
                </span>
              </p>
            </div>

            <Button
              onClick={handleWithdraw}
              variant="secondary"
              size="large"
              className="w-full"
              disabled={
                isLoading || 
                !withdrawShares || 
                parseFloat(withdrawShares) <= 0 || 
                parseFloat(withdrawShares) > vaultBalance
              }
            >
              {isLoading ? 'Processing...' : '💸 Withdraw from Vault'}
            </Button>
          </div>
        </div>
      </div>

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
          <p><strong>Vault Address:</strong> <span className="font-mono">0xd61bc1202D0B920D80b69762B78B4ce05dF03D1C</span></p>
          <p><strong>USDC Address:</strong> <span className="font-mono">0x036CbD53842c5426634e7929541eC2318f3dCF7e</span></p>
          <p><strong>Network:</strong> Base Sepolia (Chain ID: 84532)</p>
          <p><strong>Your Wallet:</strong> <span className="font-mono break-all">{walletAddress}</span></p>
        </div>
      </div>
    </div>
  );
};

export default VaultInterface;

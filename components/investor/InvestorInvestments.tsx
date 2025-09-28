import React, { useState, useEffect } from 'react';
import { useWallets } from '@privy-io/react-auth';
import Button from '../wallet/shared/Button';
import { contractService } from '../../services/contractService';
import { CONTRACTS } from '../../config/contracts';

interface InvestorInvestmentsProps {
  contractsInitialized: boolean;
}

const InvestorInvestments: React.FC<InvestorInvestmentsProps> = ({ contractsInitialized }) => {
  const { wallets } = useWallets();
  const [vaultStats, setVaultStats] = useState({
    apy: 0,
    valuePerShare: 1,
    totalAssets: 0,
    totalSupply: 0,
  });
  const [userBalances, setUserBalances] = useState({
    usdc: 0,
    vault: 0,
  });
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawShares, setWithdrawShares] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [txStatus, setTxStatus] = useState('');

  const embeddedWallet = wallets.find(w => w.walletClientType === 'privy');
  const walletAddress = embeddedWallet?.address as `0x${string}` | undefined;

  const loadData = async () => {
    if (!contractsInitialized || !walletAddress) return;

    try {
      const [apy, valuePerShare, totalAssets, totalSupply, usdcBalance, vaultBalance] = await Promise.all([
        contractService.getVaultAPY(),
        contractService.getVaultValuePerShare(),
        contractService.getVaultTotalAssets(),
        contractService.getVaultTotalSupply(),
        contractService.getUSDCBalance(walletAddress),
        contractService.getVaultBalance(walletAddress),
      ]);

      setVaultStats({ apy, valuePerShare, totalAssets, totalSupply });
      setUserBalances({ usdc: usdcBalance, vault: vaultBalance });
    } catch (error) {
      console.error('Error loading vault data:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, [contractsInitialized, walletAddress]);

  const handleDeposit = async () => {
    if (!walletAddress || !depositAmount) return;
    
    const amount = parseFloat(depositAmount);
    if (amount <= 0 || amount > userBalances.usdc) return;

    setIsLoading(true);
    try {
      setTxStatus('Step 1/2: Approving USDC...');
      await contractService.approveUSDC(CONTRACTS.vault.address, amount);
      
      setTxStatus('Step 2/2: Depositing to vault...');
      const hash = await contractService.depositToVault(amount, walletAddress);
      
      setTxStatus(`✅ Success! Tx: ${hash}`);
      setDepositAmount('');
      
      // Reload data
      setTimeout(loadData, 3000);
    } catch (error: any) {
      setTxStatus(`❌ Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!walletAddress || !withdrawShares) return;
    
    const shares = parseFloat(withdrawShares);
    if (shares <= 0 || shares > userBalances.vault) return;

    setIsLoading(true);
    try {
      setTxStatus('Withdrawing from vault...');
      const hash = await contractService.withdrawFromVault(shares, walletAddress, walletAddress);
      
      setTxStatus(`✅ Success! Tx: ${hash}`);
      setWithdrawShares('');
      
      // Reload data
      setTimeout(loadData, 3000);
    } catch (error: any) {
      setTxStatus(`❌ Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!contractsInitialized) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-yellow-600 dark:text-yellow-400 text-2xl">⏳</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Initializing Contracts
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Setting up connection to Base Sepolia contracts...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Investment Operations</h2>
        <Button onClick={loadData} variant="outline" size="small">
          🔄 Refresh Data
        </Button>
      </div>

      {/* Vault Statistics */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-6 border border-blue-200 dark:border-blue-700">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
          📊 Live Vault Statistics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
              {vaultStats.apy.toFixed(2)}%
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300">Current APY</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-green-600 dark:text-green-400">
              ${vaultStats.valuePerShare.toFixed(4)}
            </div>
            <div className="text-sm text-green-700 dark:text-green-300">Value/Share</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
              ${vaultStats.totalAssets.toLocaleString()}
            </div>
            <div className="text-sm text-purple-700 dark:text-purple-300">Total Assets</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-orange-600 dark:text-orange-400">
              {vaultStats.totalSupply.toLocaleString()}
            </div>
            <div className="text-sm text-orange-700 dark:text-orange-300">Total Shares</div>
          </div>
        </div>
      </div>

      {/* Investment Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deposit */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            💰 Deposit USDC
          </h3>
          
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Available: <span className="font-semibold text-gray-900 dark:text-white">
                  ${userBalances.usdc.toFixed(2)} USDC
                </span>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Deposit Amount (USDC)
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
                  onClick={() => setDepositAmount(userBalances.usdc.toString())}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 
                           text-xs text-purple-600 dark:text-purple-400 hover:text-purple-800 
                           dark:hover:text-purple-200 font-medium"
                  disabled={isLoading}
                >
                  MAX
                </button>
              </div>
            </div>

            {depositAmount && vaultStats.valuePerShare > 0 && (
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                <p className="text-sm text-green-700 dark:text-green-300">
                  You will receive: <span className="font-semibold">
                    {(parseFloat(depositAmount) / vaultStats.valuePerShare).toFixed(6)} CVXS
                  </span>
                </p>
              </div>
            )}

            <Button
              onClick={handleDeposit}
              variant="primary"
              size="large"
              className="w-full"
              disabled={
                isLoading || 
                !depositAmount || 
                parseFloat(depositAmount) <= 0 || 
                parseFloat(depositAmount) > userBalances.usdc ||
                !contractsInitialized
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
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Available: <span className="font-semibold text-gray-900 dark:text-white">
                  {userBalances.vault.toFixed(6)} CVXS
                </span>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Withdraw Shares (CVXS)
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
                  onClick={() => setWithdrawShares(userBalances.vault.toString())}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 
                           text-xs text-purple-600 dark:text-purple-400 hover:text-purple-800 
                           dark:hover:text-purple-200 font-medium"
                  disabled={isLoading}
                >
                  MAX
                </button>
              </div>
            </div>

            {withdrawShares && (
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                <p className="text-sm text-green-700 dark:text-green-300">
                  You will receive: <span className="font-semibold">
                    ${(parseFloat(withdrawShares) * vaultStats.valuePerShare).toFixed(2)} USDC
                  </span>
                </p>
              </div>
            )}

            <Button
              onClick={handleWithdraw}
              variant="secondary"
              size="large"
              className="w-full"
              disabled={
                isLoading || 
                !withdrawShares || 
                parseFloat(withdrawShares) <= 0 || 
                parseFloat(withdrawShares) > userBalances.vault ||
                !contractsInitialized
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
          txStatus.includes('✅') 
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
            : txStatus.includes('❌')
            ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
            : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
        }`}>
          <div className="flex items-center justify-between">
            <p className={`text-sm font-medium ${
              txStatus.includes('✅') 
                ? 'text-green-800 dark:text-green-200'
                : txStatus.includes('❌')
                ? 'text-red-800 dark:text-red-200'
                : 'text-blue-800 dark:text-blue-200'
            }`}>
              {txStatus}
            </p>
            {txStatus.includes('Tx:') && (
              <Button
                onClick={() => {
                  const hash = txStatus.split('Tx: ')[1];
                  window.open(`https://sepolia.basescan.org/tx/${hash}`, '_blank');
                }}
                variant="outline"
                size="small"
              >
                View Tx
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Investment Guide */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
          💡 How Vault Investment Works
        </h4>
        <div className="text-blue-800 dark:text-blue-200 text-sm space-y-1">
          <p>• <strong>Deposit:</strong> Your USDC is pooled with other investors</p>
          <p>• <strong>Lending:</strong> Funds are lent to verified enterprises as loans</p>
          <p>• <strong>Yield:</strong> Interest payments from loans generate APY for investors</p>
          <p>• <strong>Shares:</strong> Your CVXS shares represent proportional ownership</p>
          <p>• <strong>Withdraw:</strong> Redeem shares for USDC anytime (subject to liquidity)</p>
        </div>
      </div>

      {/* Contract Information */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
          🔧 Contract Details
        </h4>
        <div className="text-gray-600 dark:text-gray-400 text-sm space-y-1">
          <p><strong>Vault:</strong> <span className="font-mono">{CONTRACTS.vault.address}</span></p>
          <p><strong>USDC:</strong> <span className="font-mono">{CONTRACTS.usdc.address}</span></p>
          <p><strong>Network:</strong> Base Sepolia (Chain ID: 84532)</p>
          <p><strong>Standard:</strong> ERC4626 Vault with USDC as underlying asset</p>
        </div>
      </div>
    </div>
  );
};

export default InvestorInvestments;

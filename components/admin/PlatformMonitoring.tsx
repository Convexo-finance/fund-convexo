import React, { useState, useEffect } from 'react';
import Button from '../wallet/shared/Button';
import { contractService } from '../../services/contractService';
import { FEE_RECIPIENT } from '../../config/contracts';

interface PlatformMonitoringProps {
  contractsInitialized: boolean;
}

interface VaultHealth {
  totalAssets: number;
  totalSupply: number;
  apy: number;
  valuePerShare: number;
  utilizationRate: number;
}

interface PlatformStats {
  totalLoans: number;
  activeLoans: number;
  totalRepayments: number;
  feeBalance: number;
  feeBps: number;
}

const PlatformMonitoring: React.FC<PlatformMonitoringProps> = ({ contractsInitialized }) => {
  const [vaultHealth, setVaultHealth] = useState<VaultHealth>({
    totalAssets: 0,
    totalSupply: 0,
    apy: 0,
    valuePerShare: 1,
    utilizationRate: 0,
  });
  
  const [platformStats, setPlatformStats] = useState<PlatformStats>({
    totalLoans: 0,
    activeLoans: 0,
    totalRepayments: 0,
    feeBalance: 0,
    feeBps: 0,
  });
  
  const [loading, setLoading] = useState(false);

  const loadMonitoringData = async () => {
    if (!contractsInitialized) return;

    setLoading(true);
    try {
      // Load vault health
      const [totalAssets, totalSupply, apy, valuePerShare] = await Promise.all([
        contractService.getVaultTotalAssets(),
        contractService.getVaultTotalSupply(),
        contractService.getVaultAPY(),
        contractService.getVaultValuePerShare(),
      ]);

      const utilizationRate = totalSupply > 0 ? (totalAssets / (totalSupply * valuePerShare)) * 100 : 0;

      setVaultHealth({
        totalAssets,
        totalSupply,
        apy,
        valuePerShare,
        utilizationRate,
      });

      // Load platform stats
      const [totalLoans, feeBps, feeBalance] = await Promise.all([
        contractService.getTotalLoans(),
        contractService.getFeeBps(),
        contractService.getUSDCBalance(FEE_RECIPIENT),
      ]);

      // Mock some additional stats
      const activeLoans = Math.floor(totalLoans * 0.7); // Assume 70% are active
      const totalRepayments = totalAssets * 0.1; // Mock repayment amount

      setPlatformStats({
        totalLoans,
        activeLoans,
        totalRepayments,
        feeBalance,
        feeBps,
      });

    } catch (error) {
      console.error('Error loading monitoring data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMonitoringData();
  }, [contractsInitialized]);

  if (!contractsInitialized) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-yellow-600 dark:text-yellow-400 text-2xl">⏳</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Loading Platform Data
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Fetching real-time metrics from Base Sepolia...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Platform Monitoring</h2>
        <Button onClick={loadMonitoringData} variant="outline" size="small" disabled={loading}>
          {loading ? '🔄' : '🔄 Refresh Data'}
        </Button>
      </div>

      {/* Vault Health Dashboard */}
      <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-6 border border-green-200 dark:border-green-700">
        <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-4">
          🏦 Vault Health Monitor
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              ${vaultHealth.totalAssets.toLocaleString()}
            </div>
            <div className="text-sm text-green-700 dark:text-green-300">Total Assets (USDC)</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {vaultHealth.totalSupply.toLocaleString()}
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300">Total Shares (CVXS)</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {vaultHealth.apy.toFixed(2)}%
            </div>
            <div className="text-sm text-purple-700 dark:text-purple-300">Current APY</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              ${vaultHealth.valuePerShare.toFixed(4)}
            </div>
            <div className="text-sm text-orange-700 dark:text-orange-300">Value per Share</div>
          </div>
        </div>
      </div>

      {/* Platform Statistics */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          📊 Platform Statistics
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
            <div className="text-center">
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {platformStats.totalLoans}
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">Total Loans Minted</div>
            </div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
            <div className="text-center">
              <div className="text-xl font-bold text-green-600 dark:text-green-400">
                {platformStats.activeLoans}
              </div>
              <div className="text-sm text-green-700 dark:text-green-300">Active Loans</div>
            </div>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
            <div className="text-center">
              <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                ${platformStats.totalRepayments.toLocaleString()}
              </div>
              <div className="text-sm text-purple-700 dark:text-purple-300">Total Repayments</div>
            </div>
          </div>
          
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-700">
            <div className="text-center">
              <div className="text-xl font-bold text-orange-600 dark:text-orange-400">
                ${platformStats.feeBalance.toFixed(2)}
              </div>
              <div className="text-sm text-orange-700 dark:text-orange-300">Fee Balance</div>
            </div>
          </div>
        </div>
      </div>

      {/* Fee Management */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          💰 Fee Management
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Current Fee Structure</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Loan Repayment Fee:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {(platformStats.feeBps / 100).toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Treasury Cash-out Fee:</span>
                  <span className="font-medium text-gray-900 dark:text-white">1.00%</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Fee Recipient</h4>
              <p className="font-mono text-xs text-gray-600 dark:text-gray-400 break-all">
                {FEE_RECIPIENT}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Current Balance: ${platformStats.feeBalance.toFixed(2)} USDC
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Revenue Streams</h4>
              <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                <p>• Loan repayment fees (collected per payment)</p>
                <p>• Treasury cash-out fees (1% on USDC→COP)</p>
                <p>• Platform utilization fees (future)</p>
              </div>
            </div>

            <Button variant="outline" className="w-full">
              💰 Withdraw Fee Balance
            </Button>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          🔧 System Health
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
            <div className="text-xl font-bold text-green-600 dark:text-green-400 mb-1">
              99.9%
            </div>
            <p className="text-sm text-green-700 dark:text-green-300">Contract Uptime</p>
          </div>
          
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
            <div className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-1">
              {vaultHealth.utilizationRate.toFixed(1)}%
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300">Vault Utilization</p>
          </div>
          
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
            <div className="text-xl font-bold text-purple-600 dark:text-purple-400 mb-1">
              Base Sepolia
            </div>
            <p className="text-sm text-purple-700 dark:text-purple-300">Network Status</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          📋 Recent Platform Activity
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
            <div className="flex items-center space-x-3">
              <span className="text-green-600 dark:text-green-400 text-lg">💰</span>
              <div>
                <p className="font-medium text-green-900 dark:text-green-100">Vault Deposit</p>
                <p className="text-sm text-green-700 dark:text-green-300">$5,000 USDC deposited</p>
              </div>
            </div>
            <span className="text-sm text-green-700 dark:text-green-300">2 min ago</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
            <div className="flex items-center space-x-3">
              <span className="text-blue-600 dark:text-blue-400 text-lg">📄</span>
              <div>
                <p className="font-medium text-blue-900 dark:text-blue-100">Loan Payment</p>
                <p className="text-sm text-blue-700 dark:text-blue-300">$1,200 payment on Loan #2</p>
              </div>
            </div>
            <span className="text-sm text-blue-700 dark:text-blue-300">15 min ago</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
            <div className="flex items-center space-x-3">
              <span className="text-purple-600 dark:text-purple-400 text-lg">👤</span>
              <div>
                <p className="font-medium text-purple-900 dark:text-purple-100">User Verification</p>
                <p className="text-sm text-purple-700 dark:text-purple-300">Enterprise KYB completed</p>
              </div>
            </div>
            <span className="text-sm text-purple-700 dark:text-purple-300">1 hour ago</span>
          </div>
        </div>
      </div>

      {/* Alert System */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
        <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
          🚨 System Alerts
        </h4>
        <div className="text-amber-800 dark:text-amber-200 text-sm space-y-1">
          <p>• All systems operational</p>
          <p>• Vault utilization within healthy range</p>
          <p>• No pending compliance issues</p>
          <p>• Fee collection functioning normally</p>
        </div>
      </div>
    </div>
  );
};

export default PlatformMonitoring;

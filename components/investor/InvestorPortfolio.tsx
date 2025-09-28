import React, { useState, useEffect } from 'react';
import { useWallets } from '@privy-io/react-auth';
import Button from '../wallet/shared/Button';
import { contractService } from '../../services/contractService';

interface InvestorPortfolioProps {
  contractsInitialized: boolean;
}

interface PortfolioData {
  usdcBalance: number;
  vaultShares: number;
  shareValue: number;
  totalInvestment: number;
  currentValue: number;
  profitLoss: number;
  profitLossPercent: number;
  apy: number;
}

const InvestorPortfolio: React.FC<InvestorPortfolioProps> = ({ contractsInitialized }) => {
  const { wallets } = useWallets();
  const [portfolio, setPortfolio] = useState<PortfolioData>({
    usdcBalance: 0,
    vaultShares: 0,
    shareValue: 1,
    totalInvestment: 0,
    currentValue: 0,
    profitLoss: 0,
    profitLossPercent: 0,
    apy: 0,
  });
  const [loading, setLoading] = useState(false);

  const embeddedWallet = wallets.find(w => w.walletClientType === 'privy');
  const walletAddress = embeddedWallet?.address as `0x${string}` | undefined;

  const loadPortfolioData = async () => {
    if (!contractsInitialized || !walletAddress) return;

    setLoading(true);
    try {
      const [usdcBalance, vaultShares, shareValue, apy] = await Promise.all([
        contractService.getUSDCBalance(walletAddress),
        contractService.getVaultBalance(walletAddress),
        contractService.getVaultValuePerShare(),
        contractService.getVaultAPY(),
      ]);

      const currentValue = vaultShares * shareValue;
      // For demo purposes, assume initial investment was at $1/share
      const totalInvestment = vaultShares * 1; 
      const profitLoss = currentValue - totalInvestment;
      const profitLossPercent = totalInvestment > 0 ? (profitLoss / totalInvestment) * 100 : 0;

      setPortfolio({
        usdcBalance,
        vaultShares,
        shareValue,
        totalInvestment,
        currentValue,
        profitLoss,
        profitLossPercent,
        apy,
      });
    } catch (error) {
      console.error('Error loading portfolio data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPortfolioData();
  }, [contractsInitialized, walletAddress]);

  if (!contractsInitialized) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-yellow-600 dark:text-yellow-400 text-2xl">⏳</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Loading Portfolio
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Fetching your investment data...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Investment Portfolio</h2>
        <Button onClick={loadPortfolioData} variant="outline" size="small" disabled={loading}>
          {loading ? '🔄' : '🔄 Refresh'}
        </Button>
      </div>

      {/* Portfolio Overview */}
      <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-6 border border-green-200 dark:border-green-700">
        <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-4">
          📈 Portfolio Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
              ${portfolio.currentValue.toFixed(2)}
            </div>
            <p className="text-green-700 dark:text-green-300 text-sm">Total Portfolio Value</p>
          </div>
          <div>
            <div className={`text-3xl font-bold mb-2 ${
              portfolio.profitLoss >= 0 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {portfolio.profitLoss >= 0 ? '+' : ''}${portfolio.profitLoss.toFixed(2)}
            </div>
            <p className="text-green-700 dark:text-green-300 text-sm">
              Profit/Loss ({portfolio.profitLossPercent.toFixed(2)}%)
            </p>
          </div>
        </div>
      </div>

      {/* Holdings Breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          🏦 Holdings Breakdown
        </h3>
        
        <div className="space-y-4">
          {/* USDC Holdings */}
          <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-200 dark:bg-blue-700 rounded-full flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-300 text-lg">💵</span>
              </div>
              <div>
                <p className="font-semibold text-blue-900 dark:text-blue-100">USDC (Available)</p>
                <p className="text-sm text-blue-700 dark:text-blue-300">Ready for investment</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
                ${portfolio.usdcBalance.toFixed(2)}
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">Available</p>
            </div>
          </div>

          {/* Vault Shares */}
          <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-200 dark:bg-purple-700 rounded-full flex items-center justify-center">
                <span className="text-purple-600 dark:text-purple-300 text-lg">🏦</span>
              </div>
              <div>
                <p className="font-semibold text-purple-900 dark:text-purple-100">CVXS (Vault Shares)</p>
                <p className="text-sm text-purple-700 dark:text-purple-300">Earning {portfolio.apy.toFixed(2)}% APY</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-purple-900 dark:text-purple-100">
                {portfolio.vaultShares.toFixed(6)}
              </p>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                ≈ ${portfolio.currentValue.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          📊 Performance Metrics
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
              {portfolio.apy.toFixed(2)}%
            </div>
            <p className="text-sm text-green-700 dark:text-green-300">Current APY</p>
          </div>
          
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
              ${portfolio.shareValue.toFixed(4)}
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300">Share Value</p>
          </div>
          
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
            <div className={`text-2xl font-bold mb-1 ${
              portfolio.profitLossPercent >= 0 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {portfolio.profitLossPercent >= 0 ? '+' : ''}{portfolio.profitLossPercent.toFixed(2)}%
            </div>
            <p className="text-sm text-purple-700 dark:text-purple-300">Total Return</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          📋 Recent Activity
        </h3>
        
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-gray-400 dark:text-gray-500 text-xl">📝</span>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            No recent activity. Your investment transactions will appear here.
          </p>
        </div>
      </div>

      {/* Risk Disclaimer */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
        <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
          ⚠️ Investment Disclaimer
        </h4>
        <div className="text-amber-800 dark:text-amber-200 text-sm space-y-1">
          <p>• Vault investments carry risk of loss due to loan defaults</p>
          <p>• APY is variable and depends on loan performance</p>
          <p>• Share redemption subject to vault liquidity</p>
          <p>• This is a testnet deployment - use only test funds</p>
        </div>
      </div>
    </div>
  );
};

export default InvestorPortfolio;

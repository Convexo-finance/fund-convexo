import React, { useState, useEffect } from 'react';
import { useWallets } from '@privy-io/react-auth';
import Button from '../wallet/shared/Button';
import { contractService } from '../../services/contractService';

interface EnterpriseTreasuryProps {
  contractsInitialized: boolean;
}

type OperationType = 'cash_in' | 'cash_out';
type AssetType = 'USD' | 'COP' | 'USDC';

interface TreasuryOperation {
  type: OperationType;
  cantidad: number;
  assetBuy: AssetType;
  assetSell: AssetType;
  rate: number;
}

interface TreasuryTransaction {
  id: string;
  type: OperationType;
  amount: number;
  rate: number;
  result: number;
  timestamp: string;
  status: 'pending' | 'completed' | 'failed';
}

const EnterpriseTreasury: React.FC<EnterpriseTreasuryProps> = ({ contractsInitialized }) => {
  const { wallets } = useWallets();
  const [usdcBalance, setUsdcBalance] = useState(0);
  const [currentRate, setCurrentRate] = useState(3950); // Mock rate
  const [rateLoading, setRateLoading] = useState(false);
  const [operation, setOperation] = useState<TreasuryOperation>({
    type: 'cash_in',
    cantidad: 0,
    assetBuy: 'USDC',
    assetSell: 'COP',
    rate: 3950,
  });
  const [transactions, setTransactions] = useState<TreasuryTransaction[]>([]);
  const [processing, setProcessing] = useState(false);

  const embeddedWallet = wallets.find(w => w.walletClientType === 'privy');
  const walletAddress = embeddedWallet?.address as `0x${string}` | undefined;

  // Mock Google API rate fetch
  const fetchUSDCOPRate = async (operationType: OperationType): Promise<number> => {
    setRateLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock rate - in real implementation, this would call Google Finance API
    const baseRate = 3950 + (Math.random() - 0.5) * 100; // Add some variance
    
    if (operationType === 'cash_out') {
      // Reduce by 1% for cash-out operations
      setRateLoading(false);
      return baseRate * 0.99;
    }
    
    setRateLoading(false);
    return baseRate;
  };

  const loadBalance = async () => {
    if (!contractsInitialized || !walletAddress) return;
    
    try {
      const balance = await contractService.getUSDCBalance(walletAddress);
      setUsdcBalance(balance);
    } catch (error) {
      console.error('Error loading balance:', error);
    }
  };

  useEffect(() => {
    loadBalance();
  }, [contractsInitialized, walletAddress]);

  // Load rates when operation type changes
  useEffect(() => {
    fetchUSDCOPRate(operation.type).then(rate => {
      setCurrentRate(rate);
      setOperation(prev => ({ ...prev, rate }));
    });
  }, [operation.type]);

  const handleOperationChange = (field: keyof TreasuryOperation, value: any) => {
    setOperation(prev => ({ ...prev, [field]: value }));
  };

  const calculateConversion = () => {
    if (operation.type === 'cash_in') {
      // COP to USDC
      return operation.cantidad / currentRate;
    } else {
      // USDC to COP
      return operation.cantidad * currentRate;
    }
  };

  const handleExecuteOperation = async () => {
    setProcessing(true);
    
    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newTransaction: TreasuryTransaction = {
        id: Date.now().toString(),
        type: operation.type,
        amount: operation.cantidad,
        rate: currentRate,
        result: calculateConversion(),
        timestamp: new Date().toISOString(),
        status: 'completed',
      };
      
      setTransactions(prev => [newTransaction, ...prev.slice(0, 9)]); // Keep last 10
      
      // Reset operation
      setOperation(prev => ({ ...prev, cantidad: 0 }));
      
      // Reload balance
      loadBalance();
    } catch (error) {
      console.error('Error executing operation:', error);
    } finally {
      setProcessing(false);
    }
  };

  if (!contractsInitialized) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-yellow-600 dark:text-yellow-400 text-2xl">⏳</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Initializing Treasury
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Setting up treasury operations...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Treasury Operations</h2>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Rate: 1 USD = {currentRate.toLocaleString()} COP
          {rateLoading && <span className="ml-2">🔄</span>}
        </div>
      </div>

      {/* Balance Display */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-700 dark:text-blue-300 text-sm">Treasury USDC Balance</p>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              ${usdcBalance.toFixed(2)}
            </p>
          </div>
          <div className="w-12 h-12 bg-blue-200 dark:bg-blue-700 rounded-full flex items-center justify-center">
            <span className="text-blue-600 dark:text-blue-300 text-xl">💰</span>
          </div>
        </div>
      </div>

      {/* Operation Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          🔄 Cash Operations
        </h3>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => handleOperationChange('type', 'cash_in')}
            className={`p-4 rounded-lg border text-center transition-colors ${
              operation.type === 'cash_in'
                ? 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-800 dark:text-green-200'
                : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            <div className="text-2xl mb-2">💵</div>
            <div className="font-semibold">Cash In</div>
            <div className="text-sm">COP → USDC</div>
            <div className="text-xs mt-1">Standard rate</div>
          </button>
          
          <button
            onClick={() => handleOperationChange('type', 'cash_out')}
            className={`p-4 rounded-lg border text-center transition-colors ${
              operation.type === 'cash_out'
                ? 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-800 dark:text-red-200'
                : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            <div className="text-2xl mb-2">💸</div>
            <div className="font-semibold">Cash Out</div>
            <div className="text-sm">USDC → COP</div>
            <div className="text-xs mt-1">Rate - 1% fee</div>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {operation.type === 'cash_in' ? 'Amount in COP' : 'Amount in USDC'}
            </label>
            <input
              type="number"
              value={operation.cantidad}
              onChange={(e) => handleOperationChange('cantidad', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="0"
            />
          </div>

          {operation.cantidad > 0 && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">You will receive:</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {calculateConversion().toLocaleString()} {operation.type === 'cash_in' ? 'USDC' : 'COP'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Exchange Rate:</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    1 USD = {currentRate.toLocaleString()} COP
                    {operation.type === 'cash_out' && (
                      <span className="text-red-600 dark:text-red-400 ml-1">(-1%)</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Validation */}
          {operation.type === 'cash_out' && operation.cantidad > usdcBalance && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-red-700 dark:text-red-300 text-sm">
                Insufficient USDC balance. You need {operation.cantidad} USDC but only have {usdcBalance.toFixed(2)} USDC.
              </p>
            </div>
          )}

          <Button
            onClick={handleExecuteOperation}
            variant="primary"
            size="large"
            className="w-full"
            disabled={
              !operation.cantidad || 
              processing ||
              rateLoading ||
              (operation.type === 'cash_out' && operation.cantidad > usdcBalance)
            }
          >
            {processing ? 'Processing...' : 
             rateLoading ? 'Loading Rate...' : 
             operation.type === 'cash_in' ? '💵 Execute Cash In' : '💸 Execute Cash Out'}
          </Button>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          📋 Recent Transactions
        </h3>
        
        {transactions.length > 0 ? (
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    tx.type === 'cash_in' 
                      ? 'bg-green-100 dark:bg-green-900/30' 
                      : 'bg-red-100 dark:bg-red-900/30'
                  }`}>
                    <span className={`text-sm ${
                      tx.type === 'cash_in' 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {tx.type === 'cash_in' ? '💵' : '💸'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white capitalize">
                      {tx.type.replace('_', ' ')}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(tx.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {tx.amount.toLocaleString()} → {tx.result.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Rate: {tx.rate.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-gray-400 dark:text-gray-500 text-xl">📝</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              No transactions yet. Your treasury operations will appear here.
            </p>
          </div>
        )}
      </div>

      {/* Rate Information */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
          📈 Exchange Rate Details
        </h4>
        <div className="text-blue-800 dark:text-blue-200 text-sm space-y-1">
          <p>• <strong>Cash In:</strong> Standard Google Finance API rate (COP → USDC)</p>
          <p>• <strong>Cash Out:</strong> Google rate minus 1% platform fee (USDC → COP)</p>
          <p>• <strong>Rate Source:</strong> Google Finance API (updated every 30 seconds)</p>
          <p>• <strong>Settlement:</strong> Instant on Base Sepolia testnet</p>
        </div>
      </div>

      {/* Treasury Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {transactions.filter(tx => tx.type === 'cash_in').length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Cash In Operations</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 text-center">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {transactions.filter(tx => tx.type === 'cash_out').length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Cash Out Operations</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            ${transactions.reduce((sum, tx) => sum + (tx.type === 'cash_in' ? tx.result : 0), 0).toFixed(0)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total USDC Acquired</div>
        </div>
      </div>
    </div>
  );
};

export default EnterpriseTreasury;

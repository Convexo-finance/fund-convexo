import React, { useState, useEffect } from 'react';
import Button from '../wallet/shared/Button';
import { usePrivyContracts } from '../../hooks/usePrivyContracts';

type OperationType = 'cash_in' | 'cash_out';
type AssetType = 'USD' | 'COP' | 'USDC';

interface FundingOperation {
  type: OperationType;
  cantidad: number;
  assetBuy: AssetType;
  assetSell: AssetType;
  rate: number;
}

const EnterpriseFunding: React.FC = () => {
  const { walletAddress, getUSDCBalance } = usePrivyContracts();
  const [usdcBalance, setUsdcBalance] = useState(0);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [currentRate, setCurrentRate] = useState(0);
  const [rateLoading, setRateLoading] = useState(false);
  
  const [operation, setOperation] = useState<FundingOperation>({
    type: 'cash_in',
    cantidad: 0,
    assetBuy: 'USDC',
    assetSell: 'COP',
    rate: 0,
  });

  // Mock Google API rate fetch
  const fetchUSDCOPRate = async (operationType: OperationType): Promise<number> => {
    setRateLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock rate (in real implementation, this would call Google Finance API)
    const baseRate = 3950; // 1 USD = 3950 COP
    
    if (operationType === 'cash_out') {
      // Reduce by 1% for cash-out operations
      setRateLoading(false);
      return baseRate * 0.99;
    }
    
    setRateLoading(false);
    return baseRate;
  };

  // Load rates when operation type changes
  useEffect(() => {
    fetchUSDCOPRate(operation.type).then(rate => {
      setCurrentRate(rate);
      setOperation(prev => ({ ...prev, rate }));
    });
  }, [operation.type]);

  // Load USDC balance
  useEffect(() => {
    if (walletAddress) {
      setBalanceLoading(true);
      getUSDCBalance(walletAddress)
        .then(setUsdcBalance)
        .finally(() => setBalanceLoading(false));
    }
  }, [walletAddress, getUSDCBalance]);

  const handleOperationChange = (field: keyof FundingOperation, value: any) => {
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
    // In real implementation, this would process the cash-in/cash-out
    alert(`Operation: ${operation.type}\nAmount: ${operation.cantidad}\nRate: ${currentRate}\nResult: ${calculateConversion().toFixed(2)}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Funding Operations</h2>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Rate: 1 USD = {currentRate.toLocaleString()} COP
          {rateLoading && <span className="ml-2">🔄</span>}
        </div>
      </div>

      {/* Balance Display */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-700 dark:text-blue-300 text-sm">Your USDC Balance</p>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {balanceLoading ? 'Loading...' : `${usdcBalance.toFixed(2)} USDC`}
            </p>
          </div>
          <div className="w-12 h-12 bg-blue-200 dark:bg-blue-700 rounded-full flex items-center justify-center">
            <span className="text-blue-600 dark:text-blue-300 text-xl">💰</span>
          </div>
        </div>
      </div>

      {/* Operation Type Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          🔄 Operation Type
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
            <div className="text-sm">USDC → COP (-1%)</div>
          </button>
        </div>

        {/* Amount Input */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {operation.type === 'cash_in' ? 'Cantidad en COP' : 'Cantidad en USDC'}
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

          {/* Conversion Display */}
          {operation.cantidad > 0 && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">You will receive:</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {calculateConversion().toFixed(2)} {operation.type === 'cash_in' ? 'USDC' : 'COP'}
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

          {/* Validation Messages */}
          {operation.type === 'cash_out' && operation.cantidad > usdcBalance && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-red-700 dark:text-red-300 text-sm">
                Insufficient USDC balance. You need {operation.cantidad} USDC but only have {usdcBalance.toFixed(2)} USDC.
              </p>
            </div>
          )}

          {/* Execute Button */}
          <Button
            onClick={handleExecuteOperation}
            variant="primary"
            size="large"
            className="w-full"
            disabled={
              !operation.cantidad || 
              rateLoading ||
              (operation.type === 'cash_out' && operation.cantidad > usdcBalance)
            }
          >
            {rateLoading ? 'Loading Rate...' : 
             operation.type === 'cash_in' ? '💵 Execute Cash In' : '💸 Execute Cash Out'}
          </Button>
        </div>
      </div>

      {/* Rate Information */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
          📈 Exchange Rate Information
        </h4>
        <div className="text-blue-800 dark:text-blue-200 text-sm space-y-1">
          <p>• <strong>Cash In:</strong> Standard Google API rate (COP → USDC)</p>
          <p>• <strong>Cash Out:</strong> Google API rate minus 1% fee (USDC → COP)</p>
          <p>• <strong>Rate Source:</strong> Google Finance API (updated in real-time)</p>
          <p>• <strong>Network:</strong> Base Sepolia testnet</p>
        </div>
      </div>

      {/* Transaction History Preview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          📋 Recent Operations
        </h3>
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-gray-400 dark:text-gray-500 text-xl">📝</span>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            No operations yet. Your funding history will appear here.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EnterpriseFunding;

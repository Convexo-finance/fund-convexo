import React, { useState, useEffect } from 'react';
import Button from '../shared/Button';
import Loading from '../shared/Loading';
import QRScanner from './QRScanner';

interface SendTokenModalProps {
  onClose: () => void;
  onSend: (recipient: string, amount: string) => Promise<void>;
  tokenType: string;
  balance: string;
  isSending: boolean;
  txHash?: string | null;
  initialRecipient?: string;
}

const SendTokenModalTailwind: React.FC<SendTokenModalProps> = ({
  onClose,
  onSend,
  tokenType,
  balance,
  isSending,
  txHash = null,
  initialRecipient = ''
}) => {
  const [recipient, setRecipient] = useState<string>(initialRecipient);
  const [amount, setAmount] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  
  // Update recipient if initialRecipient changes
  useEffect(() => {
    if (initialRecipient) {
      setRecipient(initialRecipient);
    }
  }, [initialRecipient]);

  const handleSend = async () => {
    // Validate recipient address
    if (!recipient || !recipient.startsWith('0x') || recipient.length !== 42) {
      setError('Please enter a valid Ethereum address');
      return;
    }

    // Validate amount
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    // Validate amount is not more than max
    if (Number(amount) > Number(balance)) {
      setError(`You don't have enough ${tokenType}. Max amount: ${balance}`);
      return;
    }

    setError('');
    
    try {
      await onSend(recipient, amount);
      if (!txHash) {
        // Only close if no transaction hash is returned
        // If we have a txHash, we might want to show the transaction info
        handleClose();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send transaction');
    }
  };

  const handleClose = () => {
    setRecipient('');
    setAmount('');
    setError('');
    onClose();
  };

  const handleSetMaxAmount = () => {
    setAmount(balance);
  };

  // Handle QR code scan result
  const handleQRScan = (address: string) => {
    setRecipient(address);
    setIsQRScannerOpen(false);
    setError(''); // Clear any previous errors
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="w-11/12 max-w-lg bg-white dark:bg-gray-800 rounded-xl shadow-2xl text-gray-900 dark:text-gray-100">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold m-0">Send {tokenType}</h3>
          <button 
            onClick={handleClose} 
            className="text-2xl text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 bg-transparent border-0"
          >
            &times;
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <label htmlFor="recipient" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Recipient Address
            </label>
            <div className="flex gap-2">
              <input
                id="recipient"
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="0x..."
                disabled={isSending}
                className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
              />
              <button 
                onClick={() => setIsQRScannerOpen(true)}
                disabled={isSending}
                className="px-4 py-3 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-700 rounded-md font-bold text-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500 disabled:opacity-60"
                title="Scan QR Code"
              >
                📷
              </button>
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="amount" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Amount
            </label>
            <div className="flex gap-2">
              <input
                id="amount"
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                disabled={isSending}
                className="flex-grow p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
              />
              <button 
                onClick={handleSetMaxAmount} 
                disabled={isSending}
                className="px-3 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-700 rounded-md font-bold text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500 disabled:opacity-60"
              >
                MAX
              </button>
            </div>
            <div className="mt-2 text-right text-sm text-gray-600 dark:text-gray-400">
              Available: {balance} {tokenType}
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}
          
          {txHash && (
            <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-md">
              <p className="font-semibold">Transaction sent!</p>
              <p className="my-2 p-2 bg-gray-200 dark:bg-gray-600 rounded font-mono text-sm break-all">
                {txHash}
              </p>
              <a 
                href={`https://optimistic.etherscan.io/tx/${txHash}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block mt-2 text-blue-600 dark:text-blue-400 hover:underline"
              >
                View on Optimism Explorer
              </a>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleClose}
            disabled={isSending}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 font-medium disabled:opacity-60"
          >
            {txHash ? 'Close' : 'Cancel'}
          </button>
          
          {!txHash && (
            <button
              onClick={handleSend}
              disabled={isSending}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:opacity-60"
            >
              {isSending ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </span>
              ) : (
                `Send ${tokenType}`
              )}
            </button>
          )}
        </div>
      </div>

      {/* QR Scanner */}
      {isQRScannerOpen && (
        <QRScanner 
          onScan={handleQRScan} 
          onClose={() => setIsQRScannerOpen(false)} 
        />
      )}
    </div>
  );
};

export default SendTokenModalTailwind;
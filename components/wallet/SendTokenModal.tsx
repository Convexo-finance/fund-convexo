import React, { useState } from 'react';
import Button from '../shared/Button';
import Loading from '../shared/Loading';

interface SendTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (recipient: string, amount: string) => Promise<void>;
  tokenSymbol: string;
  maxAmount: string;
  isSending: boolean;
}

const SendTokenModal: React.FC<SendTokenModalProps> = ({
  isOpen,
  onClose,
  onSend,
  tokenSymbol,
  maxAmount,
  isSending
}) => {
  const [recipient, setRecipient] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

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
    if (Number(amount) > Number(maxAmount)) {
      setError(`You don't have enough ${tokenSymbol}. Max amount: ${maxAmount}`);
      return;
    }

    setError('');
    
    try {
      await onSend(recipient, amount);
      handleClose();
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
    setAmount(maxAmount);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3>Send {tokenSymbol}</h3>
          <button onClick={handleClose} className="close-button">&times;</button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label htmlFor="recipient">Recipient Address</label>
            <input
              id="recipient"
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="0x..."
              disabled={isSending}
            />
          </div>

          <div className="form-group">
            <label htmlFor="amount">Amount</label>
            <div className="amount-input-container">
              <input
                id="amount"
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                disabled={isSending}
              />
              <button 
                onClick={handleSetMaxAmount} 
                className="max-button"
                disabled={isSending}
              >
                MAX
              </button>
            </div>
            <div className="balance-info">
              Available: {maxAmount} {tokenSymbol}
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}
        </div>

        <div className="modal-footer">
          <Button 
            onClick={handleClose} 
            variant="secondary"
            disabled={isSending}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSend} 
            variant="primary"
            disabled={isSending}
          >
            {isSending ? (
              <span className="sending-indicator">
                <Loading size="small" text="" /> Sending...
              </span>
            ) : (
              `Send ${tokenSymbol}`
            )}
          </Button>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal-container {
          background-color: white;
          border-radius: 8px;
          width: 90%;
          max-width: 500px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #eee;
        }

        .modal-header h3 {
          margin: 0;
          color: #333;
        }

        .close-button {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #999;
        }

        .modal-body {
          padding: 1.5rem;
        }

        .modal-footer {
          padding: 1rem 1.5rem;
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          border-top: 1px solid #eee;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        label {
          display: block;
          margin-bottom: 0.5rem;
          color: #555;
          font-weight: 500;
        }

        input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
        }

        input:focus {
          outline: none;
          border-color: #4B66F3;
          box-shadow: 0 0 0 2px rgba(75, 102, 243, 0.2);
        }

        .amount-input-container {
          display: flex;
          gap: 0.5rem;
        }

        .max-button {
          background-color: #f0f0f0;
          border: 1px solid #ddd;
          padding: 0 0.75rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 700;
          cursor: pointer;
          color: #555;
        }

        .max-button:hover {
          background-color: #e0e0e0;
        }

        .balance-info {
          margin-top: 0.5rem;
          font-size: 0.85rem;
          color: #666;
          text-align: right;
        }

        .error-message {
          color: #d32f2f;
          margin-top: 1rem;
          font-size: 0.9rem;
          padding: 0.5rem;
          background-color: #ffebee;
          border-radius: 4px;
        }

        .sending-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
      `}</style>
    </div>
  );
};

export default SendTokenModal; 
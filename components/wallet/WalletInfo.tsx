import React from 'react';
import { Wallet, TokenBalance } from '@/types/index';
import Button from '@/components/shared/Button';
import Loading from '@/components/shared/Loading';

interface WalletInfoProps {
  wallet: Wallet;
  balances: TokenBalance;
  isLoading: boolean;
  onRefresh: () => void;
}

const WalletInfo: React.FC<WalletInfoProps> = ({
  wallet,
  balances,
  isLoading,
  onRefresh
}) => {
  return (
    <div className="wallet-info">
      <h3>Your Wallet</h3>
      <p className="address">
        <strong>Address:</strong> {wallet.address}
      </p>
      
      <div className="balances">
        <div className="balances-header">
          <h3>Balances</h3>
          {isLoading && <Loading size="small" text="" />}
        </div>
        
        <div className="balance-item">
          <span>ETH:</span>
          <span className="balance-value">{parseFloat(balances.ethBalance).toFixed(6)} ETH</span>
        </div>
        
        <div className="balance-item">
          <span>USC:</span>
          <span className="balance-value">{parseFloat(balances.uscBalance).toFixed(2)} USC</span>
        </div>
        
        <Button 
          onClick={onRefresh} 
          disabled={isLoading}
          size="small"
          variant="secondary"
          className="refresh-button"
        >
          Refresh Balances
        </Button>
      </div>
      
      <style jsx>{`
        .wallet-info {
          background: #f5f5f5;
          padding: 1.5rem;
          border-radius: 8px;
          margin-top: 1rem;
        }
        
        h3 {
          margin: 0 0 1rem 0;
          color: #444;
        }
        
        .balances-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }
        
        .balances-header h3 {
          margin: 0;
        }
        
        .address {
          background: #eee;
          padding: 0.8rem;
          border-radius: 4px;
          font-family: monospace;
          overflow-wrap: break-word;
          font-size: 0.85rem;
          margin-bottom: 1.5rem;
        }
        
        .balances {
          margin-top: 1rem;
        }
        
        .balance-item {
          display: flex;
          justify-content: space-between;
          padding: 0.8rem;
          background: #eee;
          margin-bottom: 0.5rem;
          border-radius: 4px;
        }
        
        .balance-value {
          font-weight: 600;
        }
        
        .refresh-button {
          margin-top: 0.5rem;
        }
      `}</style>
    </div>
  );
};

export default WalletInfo; 
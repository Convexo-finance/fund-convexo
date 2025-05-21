import React from 'react';
import { Wallet, TokenBalance } from '../../types/index';
import Button from '../../components/shared/Button';
import Loading from '../../components/shared/Loading';

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
  // Generate QR code URL using a public QR code service
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${wallet.address}`;
  
  return (
    <div className="wallet-info">
      <h3>Your Wallet</h3>
      
      <div className="wallet-address-container">
        <div className="qr-code">
          <img src={qrCodeUrl} alt="Wallet Address QR Code" />
        </div>
        <div className="address-details">
          <p className="address">
            <strong>Address:</strong> {wallet.address}
          </p>
          <a 
            href={`https://optimistic.etherscan.io/address/${wallet.address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block-explorer-link"
          >
            View on Optimism Explorer
          </a>
        </div>
      </div>
      
      <div className="balances">
        <div className="balances-header">
          <h3>Optimism Balances</h3>
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
        
        .wallet-address-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        
        .qr-code {
          margin-bottom: 1rem;
          background: white;
          padding: 10px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .qr-code img {
          display: block;
          width: 150px;
          height: 150px;
        }
        
        .address-details {
          width: 100%;
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
          margin-bottom: 0.5rem;
        }
        
        .block-explorer-link {
          display: inline-block;
          color: #4B66F3;
          text-decoration: underline;
          margin-bottom: 1rem;
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
        
        @media (min-width: 768px) {
          .wallet-address-container {
            flex-direction: row;
            justify-content: space-between;
            align-items: flex-start;
          }
          
          .qr-code {
            margin-right: 1.5rem;
            margin-bottom: 0;
          }
          
          .address-details {
            flex: 1;
            width: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default WalletInfo; 
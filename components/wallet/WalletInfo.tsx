import React, { useState } from 'react';
import { Wallet, TokenBalance } from '../../types/index';
import Button from '../../components/shared/Button';
import Loading from '../../components/shared/Loading';
import { getTokenLogoUrl, getNetworkLogoUrl, formatTokenBalance } from '../../utils/tokenUtils';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import SendTokenModal from './SendTokenModal';
import { parseUnits } from 'viem';

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
  const { exportWallet } = usePrivy();
  const { wallets } = useWallets();
  
  // States for send token modal
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState<'ETH' | 'USDC'>('ETH');
  const [isSendingTx, setIsSendingTx] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  
  // Get the actual wallet instance from Privy's useWallets hook
  const privyWallet = wallets?.find(w => w.address.toLowerCase() === wallet.address.toLowerCase());
  
  // Generate QR code URL using a public QR code service
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${wallet.address}`;
  
  // Get token logo URLs from CoinGecko
  const ethLogoUrl = getTokenLogoUrl('ETH');
  const usdcLogoUrl = getTokenLogoUrl('USDC');
  
  // Get Optimism network logo
  const optimismLogoUrl = getNetworkLogoUrl(10); // 10 is Optimism Mainnet chain ID
  
  // Handle export wallet button click
  const handleExportWallet = async () => {
    try {
      await exportWallet({ address: wallet.address });
    } catch (error) {
      console.error("Error exporting wallet:", error);
    }
  };
  
  // Handle opening the send token modal
  const openSendModal = (token: 'ETH' | 'USDC') => {
    setSelectedToken(token);
    setIsSendModalOpen(true);
  };
  
  // Handle sending tokens
  const handleSendToken = async (recipient: string, amount: string) => {
    if (!privyWallet) {
      console.error("Wallet not found");
      return;
    }
    
    setIsSendingTx(true);
    setTxHash(null);
    
    try {
      if (selectedToken === 'ETH') {
        // Send ETH
        // Get the provider from the wallet
        const provider = await privyWallet.getEthereumProvider();
        
        // Request the provider to send a transaction
        const tx = await provider.request({
          method: 'eth_sendTransaction',
          params: [{
            from: wallet.address,
            to: recipient,
            value: '0x' + parseUnits(amount, 18).toString(16), // Convert to hex
            chainId: 10, // Optimism
          }]
        });
        
        setTxHash(tx as string);
        
      } else if (selectedToken === 'USDC') {
        // For USDC, we would need to create a contract interaction
        // This is a placeholder - for now we'll just show an error
        alert('USDC transfers require contract integration which is not yet implemented');
        throw new Error('USDC transfers not yet implemented');
      }
      
      // Refresh balances after successful transaction
      onRefresh();
      
    } catch (error) {
      console.error("Error sending transaction:", error);
      throw error;
    } finally {
      setIsSendingTx(false);
    }
  };
  
  return (
    <div className="wallet-info">
      <div className="network-indicator">
        <div className="network-badge">
          <img 
            src={optimismLogoUrl}
            alt="Optimism Logo" 
            className="network-icon"
          />
          <span>Optimism Network</span>
        </div>
      </div>
      
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
          <div className="wallet-actions">
            <Button 
              onClick={handleExportWallet}
              size="small" 
              variant="secondary"
              className="export-button"
            >
              Export Wallet
            </Button>
          </div>
        </div>
      </div>
      
      {/* Show transaction receipt if available */}
      {txHash && (
        <div className="transaction-receipt">
          <p><strong>Transaction sent!</strong></p>
          <p className="tx-hash">Hash: {txHash}</p>
          <a 
            href={`https://optimistic.etherscan.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block-explorer-link"
          >
            View on Optimism Explorer
          </a>
        </div>
      )}
      
      <div className="balances">
        <div className="balances-header">
          <h3>Optimism Balances</h3>
          {isLoading && <Loading size="small" text="" />}
        </div>
        
        <div className="balance-item">
          <div className="token-info">
            <img 
              src={ethLogoUrl}
              alt="ETH" 
              className="token-icon"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/images/ethereum.png';
              }}
            />
            <span>ETH</span>
          </div>
          <div className="balance-actions">
            <span className="balance-value">{formatTokenBalance(balances.ethBalance, 6)} ETH</span>
            <Button
              onClick={() => openSendModal('ETH')}
              size="small"
              variant="outline"
              className="send-button"
              disabled={isLoading || isSendingTx || Number(balances.ethBalance) <= 0}
            >
              Send
            </Button>
          </div>
        </div>
        
        <div className="balance-item">
          <div className="token-info">
            <img 
              src={usdcLogoUrl}
              alt="USDC" 
              className="token-icon"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/images/usdc.png';
              }}
            />
            <span>USDC</span>
          </div>
          <div className="balance-actions">
            <span className="balance-value">{formatTokenBalance(balances.uscBalance, 2)} USDC</span>
            <Button
              onClick={() => openSendModal('USDC')}
              size="small"
              variant="outline"
              className="send-button"
              disabled={isLoading || isSendingTx || Number(balances.uscBalance) <= 0}
            >
              Send
            </Button>
          </div>
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
      
      {/* Send Token Modal */}
      <SendTokenModal
        isOpen={isSendModalOpen}
        onClose={() => setIsSendModalOpen(false)}
        onSend={handleSendToken}
        tokenSymbol={selectedToken}
        maxAmount={selectedToken === 'ETH' ? balances.ethBalance : balances.uscBalance}
        isSending={isSendingTx}
      />
      
      <style jsx>{`
        .wallet-info {
          background: #f5f5f5;
          padding: 1.5rem;
          border-radius: 8px;
          margin-top: 1rem;
          position: relative;
        }
        
        .network-indicator {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 1rem;
        }
        
        .network-badge {
          display: flex;
          align-items: center;
          background: #ff0b521a;
          color: #ff0b51;
          padding: 0.5rem 0.8rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 500;
        }
        
        .network-icon {
          width: 18px;
          height: 18px;
          margin-right: 0.5rem;
          border-radius: 50%;
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

        .wallet-actions {
          margin-top: 0.5rem;
          margin-bottom: 1rem;
        }
        
        .export-button {
          width: 100%;
        }
        
        .transaction-receipt {
          margin: 1rem 0;
          padding: 1rem;
          background-color: #e8f5e9;
          border-radius: 8px;
          border-left: 4px solid #4CAF50;
        }
        
        .transaction-receipt p {
          margin: 0.5rem 0;
        }
        
        .tx-hash {
          font-family: monospace;
          font-size: 0.85rem;
          word-break: break-all;
          background: rgba(255, 255, 255, 0.5);
          padding: 0.5rem;
          border-radius: 4px;
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
          margin-bottom: 0.5rem;
        }
        
        .balances {
          margin-top: 1rem;
        }
        
        .balance-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.8rem;
          background: #eee;
          margin-bottom: 0.5rem;
          border-radius: 4px;
        }
        
        .token-info {
          display: flex;
          align-items: center;
        }
        
        .token-icon {
          width: 24px;
          height: 24px;
          margin-right: 0.5rem;
          border-radius: 50%;
          background-color: white;
          object-fit: contain;
        }
        
        .balance-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .balance-value {
          font-weight: 600;
        }
        
        .send-button {
          padding: 0.25rem 0.75rem;
          font-size: 0.8rem;
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
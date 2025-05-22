import React, { useState } from 'react';
import { Wallet, TokenBalance } from '../../types/index';
import Button from '../../components/shared/Button';
import Loading from '../../components/shared/Loading';
import { getTokenLogoUrl, getNetworkLogoUrl, formatTokenBalance } from '../../utils/tokenUtils';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import SendTokenModal from './SendTokenModal';
import { parseUnits, encodeFunctionData } from 'viem';

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
      // Get the provider from the wallet
      const provider = await privyWallet.getEthereumProvider();
      
      // Always use gas sponsorship with Biconomy paymaster when possible
      if (selectedToken === 'ETH') {
        // Request the provider to send a transaction with gas sponsorship metadata
        const value = parseUnits(amount, 18);
        const valueHex = `0x${value.toString(16)}`;
        
        const tx = await provider.request({
          method: 'eth_sendTransaction',
          params: [{
            from: wallet.address,
            to: recipient,
            value: valueHex,
            chainId: 10, // Optimism
            gasMode: 'SPONSORED' // Signal to use Biconomy sponsorship when available
          }]
        });
        
        setTxHash(tx as string);
        
      } else if (selectedToken === 'USDC') {
        // USDC contract integration
        // Native USDC issued by Circle on Optimism
        const USDC_ADDRESS = '0x0b2c639c533813f4aa9d7837caf62653d097ff85';
        
        // ERC20 transfer function ABI
        const transferAbi = [{
          inputs: [
            { name: 'to', type: 'address' },
            { name: 'amount', type: 'uint256' }
          ],
          name: 'transfer',
          outputs: [{ name: '', type: 'bool' }],
          stateMutability: 'nonpayable',
          type: 'function'
        }] as const;
        
        // Convert the amount to proper units (USDC has 6 decimals)
        const usdcAmount = parseUnits(amount, 6);
        
        // Encode the function call data using viem
        const data = encodeFunctionData({
          abi: transferAbi,
          functionName: 'transfer',
          args: [recipient as `0x${string}`, usdcAmount]
        });
        
        // Create the transaction
        const tx = await provider.request({
          method: 'eth_sendTransaction',
          params: [{
            from: wallet.address,
            to: USDC_ADDRESS,
            data: data,
            chainId: 10, // Optimism
            gasMode: 'SPONSORED' // Signal to use Biconomy sponsorship when available
          }]
        });
        
        setTxHash(tx as string);
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
        <div className="qr-code-container">
          <div className="qr-code">
            <img src={qrCodeUrl} alt="Wallet Address QR Code" />
          </div>
          <p className="qr-help">Scan to view or send funds</p>
        </div>
        <div className="address-details">
          <div className="address-header">
            <h4>Wallet Address</h4>
            <Button 
              onClick={handleExportWallet}
              size="small" 
              variant="outline"
              className="export-button"
            >
              <span className="export-icon">🔑</span>
              Export Wallet
            </Button>
          </div>
          <div className="address-box">
            <code className="address">{wallet.address}</code>
            <button 
              className="copy-button" 
              onClick={() => {
                navigator.clipboard.writeText(wallet.address);
                // You could add a temporary "Copied!" notification here
              }}
              title="Copy address"
            >
              <span className="copy-icon">📋</span>
            </button>
          </div>
          <div className="address-actions">
            <a 
              href={`https://optimistic.etherscan.io/address/${wallet.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="explorer-link"
            >
              <span className="link-icon">🔍</span>
              View on Optimism Explorer
            </a>
          </div>
        </div>
      </div>
      
      <div className="balances">
        <div className="balances-header">
          <h3>Optimism Balances</h3>
          {isLoading && <Loading size="small" text="" />}
        </div>
        
        <div className="gas-sponsorship-indicator">
          <span className="sponsor-icon">🎁</span>
          <span className="sponsor-text">Gas fees sponsored by ETHCALI</span>
        </div>
        
        <div className="powered-by">
          <span className="powered-text">Powered by Biconomy</span>
        </div>
        
        <div className="balance-cards">
          <div className="balance-card">
            <div className="token-info">
              <div className="token-icon-wrapper">
                <img 
                  src={ethLogoUrl}
                  alt="ETH" 
                  className="token-icon"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/images/ethereum.png';
                  }}
                />
              </div>
              <div className="token-details">
                <span className="token-name">Ethereum</span>
                <span className="token-symbol">ETH</span>
              </div>
            </div>
            <div className="balance-details">
              <span className="balance-value">{formatTokenBalance(balances.ethBalance, 6)}</span>
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
          
          <div className="balance-card">
            <div className="token-info">
              <div className="token-icon-wrapper">
                <img 
                  src={usdcLogoUrl}
                  alt="USDC" 
                  className="token-icon"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/images/usdc.png';
                  }}
                />
              </div>
              <div className="token-details">
                <span className="token-name">USD Coin</span>
                <span className="token-symbol">USDC</span>
              </div>
            </div>
            <div className="balance-details">
              <span className="balance-value">{formatTokenBalance(balances.uscBalance, 2)}</span>
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
        </div>
        
        <Button 
          onClick={onRefresh} 
          disabled={isLoading}
          size="small"
          variant="secondary"
          className="refresh-button"
        >
          {isLoading ? 'Refreshing...' : 'Refresh Balances'}
        </Button>
      </div>
      
      {/* Show transaction receipt if available */}
      {txHash && (
        <div className="transaction-receipt">
          <div className="receipt-header">
            <div className="success-icon">✓</div>
            <h4>Transaction Sent</h4>
          </div>
          <div className="receipt-content">
            <div className="tx-hash-container">
              <span className="tx-label">Transaction Hash:</span>
              <code className="tx-hash">{txHash.substring(0, 10)}...{txHash.substring(txHash.length - 8)}</code>
              <a 
                href={`https://optimistic.etherscan.io/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="explorer-button"
              >
                View on Explorer
              </a>
            </div>
            <p className="receipt-info">Your transaction has been submitted to the network. It may take a few moments to be confirmed.</p>
          </div>
        </div>
      )}
      
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
          color: #333;
        }
        
        .wallet-address-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 1.5rem;
          background: white;
          border-radius: 12px;
          border: 1px solid #eee;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          padding: 1.5rem;
        }
        
        .qr-code-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        
        .qr-code {
          background: white;
          padding: 10px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          border: 1px solid #eee;
        }
        
        .qr-code img {
          display: block;
          width: 150px;
          height: 150px;
        }
        
        .qr-help {
          margin: 0.5rem 0 0 0;
          font-size: 0.85rem;
          color: #888;
        }
        
        .address-details {
          width: 100%;
        }
        
        .address-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }
        
        .address-header h4 {
          margin: 0;
          color: #333;
        }
        
        .export-button {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.25rem 0.75rem;
          border-radius: 6px;
          font-size: 0.85rem;
        }
        
        .export-icon {
          font-size: 0.9rem;
        }
        
        .address-box {
          position: relative;
          display: flex;
          align-items: center;
          background: #f8f9fa;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          border: 1px solid #e8e8e8;
          margin-bottom: 0.75rem;
        }
        
        .address {
          flex: 1;
          font-family: monospace;
          overflow-wrap: break-word;
          font-size: 0.9rem;
          color: #333;
          user-select: all;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .copy-button {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #555;
          transition: background-color 0.2s;
        }
        
        .copy-button:hover {
          background-color: rgba(0, 0, 0, 0.05);
        }
        
        .copy-icon {
          font-size: 1rem;
        }
        
        .address-actions {
          display: flex;
          gap: 1rem;
        }
        
        .explorer-link {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          color: #4B66F3;
          text-decoration: none;
          font-size: 0.85rem;
          padding: 0.25rem 0;
          transition: color 0.2s;
        }
        
        .explorer-link:hover {
          color: #3D53D9;
          text-decoration: underline;
        }
        
        .link-icon {
          font-size: 0.9rem;
        }
        
        .balances {
          margin-top: 2rem;
        }
        
        .balances-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
        }
        
        .balances-header h3 {
          margin: 0;
          color: #333;
        }
        
        .gas-sponsorship-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background-color: rgba(75, 102, 243, 0.1);
          padding: 0.75rem;
          border-radius: 8px;
          margin-bottom: 1rem;
        }
        
        .sponsor-icon {
          font-size: 1.1rem;
        }
        
        .sponsor-text {
          font-size: 0.9rem;
          color: #4B66F3;
          font-weight: 500;
        }
        
        .powered-by {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 1rem;
          font-size: 0.8rem;
          color: #888;
        }
        
        .powered-text {
          font-style: italic;
        }
        
        .balance-cards {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        
        .balance-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: white;
          border-radius: 12px;
          border: 1px solid #eee;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .balance-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 3px 6px rgba(0, 0, 0, 0.08);
        }
        
        .token-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .token-icon-wrapper {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: #f7f7f7;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .token-icon {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          object-fit: contain;
        }
        
        .token-details {
          display: flex;
          flex-direction: column;
        }
        
        .token-name {
          font-weight: 500;
          color: #333;
        }
        
        .token-symbol {
          font-size: 0.8rem;
          color: #666;
        }
        
        .balance-details {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .balance-value {
          font-weight: 600;
          font-size: 1.1rem;
          color: #333;
        }
        
        .send-button {
          padding: 0.25rem 0.75rem;
          font-size: 0.85rem;
          border-radius: 6px;
        }
        
        .refresh-button {
          width: 100%;
          border-radius: 8px;
          font-weight: 500;
          margin-top: 0.5rem;
        }
        
        .transaction-receipt {
          margin: 1.5rem 0;
          background-color: #f1fbf6;
          border-radius: 12px;
          border: 1px solid #c5e8d1;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }
        
        .receipt-header {
          background-color: #e3f6ea;
          padding: 1rem 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          border-bottom: 1px solid #c5e8d1;
        }
        
        .receipt-header h4 {
          margin: 0;
          color: #2a9d5c;
          font-size: 1.1rem;
        }
        
        .success-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          background-color: #2a9d5c;
          color: white;
          border-radius: 50%;
          font-weight: bold;
        }
        
        .receipt-content {
          padding: 1.25rem 1.5rem;
        }
        
        .tx-hash-container {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }
        
        .tx-label {
          font-weight: 500;
          color: #444;
          font-size: 0.9rem;
        }
        
        .tx-hash {
          font-family: monospace;
          background: rgba(0, 0, 0, 0.05);
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          color: #555;
          font-size: 0.9rem;
        }
        
        .explorer-button {
          display: inline-flex;
          align-items: center;
          background-color: #2a9d5c;
          color: white;
          text-decoration: none;
          padding: 0.25rem 0.75rem;
          border-radius: 4px;
          font-size: 0.85rem;
          transition: background-color 0.2s;
        }
        
        .explorer-button:hover {
          background-color: #237a49;
        }
        
        .receipt-info {
          margin: 0;
          color: #666;
          font-size: 0.9rem;
        }
        
        @media (min-width: 768px) {
          .wallet-address-container {
            flex-direction: row;
            align-items: flex-start;
          }
          
          .qr-code-container {
            margin-right: 1.5rem;
            margin-bottom: 0;
          }
          
          .address-details {
            flex: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default WalletInfo; 
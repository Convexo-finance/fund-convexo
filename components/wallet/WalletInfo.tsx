import React, { useState } from 'react';
import { Wallet, TokenBalance } from '../../types/index';
import Button from '../../components/shared/Button';
import Loading from '../../components/shared/Loading';
import { getTokenLogoUrl, getNetworkLogoUrl, formatTokenBalance } from '../../utils/tokenUtils';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import SendTokenModal from './SendTokenModal';
import QRScanner from './QRScanner';
import { parseUnits, encodeFunctionData } from 'viem';
import { useTokenPrices } from '../../hooks/useTokenPrices';

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
  const { getPriceForToken } = useTokenPrices();
  
  // States for send token modal
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState<'ETH' | 'USDC' | 'PAPAYOS'>('ETH');
  const [isSendingTx, setIsSendingTx] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  
  // New state for QR scanner
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [scannedAddress, setScannedAddress] = useState<string | null>(null);
  
  // Get the actual wallet instance from Privy's useWallets hook
  const privyWallet = wallets?.find(w => w.address.toLowerCase() === wallet.address.toLowerCase());
  
  // Generate QR code URL using a public QR code service
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${wallet.address}`;
  
  // Get token logo URLs from CoinGecko
  const ethLogoUrl = getTokenLogoUrl('ETH');
  const usdcLogoUrl = getTokenLogoUrl('USDC');
  const papayosLogoUrl = getTokenLogoUrl('PAPAYOS');
  
  // Get Optimism network logo
  const optimismLogoUrl = getNetworkLogoUrl(10); // 10 is Optimism Mainnet chain ID
  
  // Calculate USD values
  const ethPrice = getPriceForToken('ETH');
  const usdcPrice = getPriceForToken('USDC');
  
  const ethValueUsd = parseFloat(balances.ethBalance) * ethPrice.price;
  const usdcValueUsd = parseFloat(balances.uscBalance) * usdcPrice.price;
  // For PAPAYOS, we'll assume $0 price for now since it might not be on CoinGecko
  const papayosValueUsd = 0;
  const totalValueUsd = ethValueUsd + usdcValueUsd + papayosValueUsd;
  
  // Format USD values
  const formatUsd = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };
  
  // Handle export wallet button click
  const handleExportWallet = async () => {
    try {
      await exportWallet({ address: wallet.address });
    } catch (error) {
      console.error("Error exporting wallet:", error);
    }
  };
  
  // Handle opening the send token modal
  const openSendModal = (token: 'ETH' | 'USDC' | 'PAPAYOS') => {
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
      } else if (selectedToken === 'PAPAYOS') {
        // PAPAYOS contract integration
        const PAPAYOS_ADDRESS = '0xfeEF2ce2B94B8312EEB05665e2F03efbe3B0a916';
        
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
        
        // Convert the amount to proper units (PAPAYOS has 18 decimals)
        const papayosAmount = parseUnits(amount, 18);
        
        // Encode the function call data using viem
        const data = encodeFunctionData({
          abi: transferAbi,
          functionName: 'transfer',
          args: [recipient as `0x${string}`, papayosAmount]
        });
        
        // Create the transaction
        const tx = await provider.request({
          method: 'eth_sendTransaction',
          params: [{
            from: wallet.address,
            to: PAPAYOS_ADDRESS,
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
  
  // Handle QR code scan result
  const handleQRScan = (address: string) => {
    setScannedAddress(address);
    setIsQRScannerOpen(false);
    
    // Open send modal with the scanned address
    setSelectedToken('ETH'); // Default to ETH
    setIsSendModalOpen(true);
  };
  
  // Open QR scanner
  const openQRScanner = () => {
    setIsQRScannerOpen(true);
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
          
          <div className="address-display">
            <p className="wallet-address">{wallet.address}</p>
            <div className="address-actions">
              <button 
                className="copy-button"
                onClick={() => {
                  navigator.clipboard.writeText(wallet.address);
                  // Show copy success message (you could add a state for this)
                }}
              >
                📋 Copy
              </button>
              <a 
                href={`https://optimistic.etherscan.io/address/${wallet.address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="view-button"
              >
                🔍 View
              </a>
            </div>
          </div>
        </div>
      </div>
      
      <div className="balance-section">
        <div className="balance-header">
          <h4>Balances</h4>
          <div className="balance-actions">
            <Button
              onClick={onRefresh}
              size="small"
              variant="outline"
              className="refresh-button"
              disabled={isLoading}
            >
              🔄 Refresh
            </Button>
            <Button
              onClick={openQRScanner}
              size="small"
              variant="outline"
              className="scan-button"
            >
              📷 Scan Wallet
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="loading-balances">
            <Loading size="small" text="Loading balances..." />
          </div>
        ) : (
          <div className="token-list">
            {/* ETH Balance */}
            <div className="token-item">
              <div className="token-info">
                <img src={ethLogoUrl} alt="ETH" className="token-icon" />
                <div className="token-details">
                  <span className="token-name">Ethereum</span>
                  <span className="token-symbol">ETH</span>
                </div>
              </div>
              <div className="token-balance">
                <div className="balance-amount">{formatTokenBalance(balances.ethBalance, 6)}</div>
                <div className="balance-usd">{formatUsd(ethValueUsd)}</div>
              </div>
              <div className="token-actions">
                <Button onClick={() => openSendModal('ETH')} size="small" variant="primary">
                  Send
                </Button>
              </div>
            </div>
            
            {/* USDC Balance */}
            <div className="token-item">
              <div className="token-info">
                <img src={usdcLogoUrl} alt="USDC" className="token-icon" />
                <div className="token-details">
                  <span className="token-name">USD Coin</span>
                  <span className="token-symbol">USDC</span>
                </div>
              </div>
              <div className="token-balance">
                <div className="balance-amount">{formatTokenBalance(balances.uscBalance, 6)}</div>
                <div className="balance-usd">{formatUsd(usdcValueUsd)}</div>
              </div>
              <div className="token-actions">
                <Button onClick={() => openSendModal('USDC')} size="small" variant="primary">
                  Send
                </Button>
              </div>
            </div>
            
            {/* PAPAYOS Balance */}
            <div className="token-item">
              <div className="token-info">
                <img src={papayosLogoUrl} alt="PAPAYOS" className="token-icon" />
                <div className="token-details">
                  <span className="token-name">PAPAYOS</span>
                  <span className="token-symbol">PAPAYOS</span>
                </div>
              </div>
              <div className="token-balance">
                <div className="balance-amount">{formatTokenBalance(balances.papayosBalance, 6)}</div>
                <div className="balance-usd">{formatUsd(papayosValueUsd)}</div>
              </div>
              <div className="token-actions">
                <Button onClick={() => openSendModal('PAPAYOS')} size="small" variant="primary">
                  Send
                </Button>
              </div>
            </div>
            
            {/* Total Balance */}
            <div className="total-balance">
              <div className="total-label">Total Value</div>
              <div className="total-amount">{formatUsd(totalValueUsd)}</div>
            </div>
          </div>
        )}
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
      
      {/* Add the QR Scanner component */}
      {isQRScannerOpen && (
        <QRScanner 
          onScan={handleQRScan} 
          onClose={() => setIsQRScannerOpen(false)} 
        />
      )}
      
      {/* Send Token Modal */}
      {isSendModalOpen && (
        <SendTokenModal
          onClose={() => setIsSendModalOpen(false)}
          onSend={handleSendToken}
          tokenType={selectedToken}
          balance={selectedToken === 'ETH' ? balances.ethBalance : selectedToken === 'USDC' ? balances.uscBalance : balances.papayosBalance}
          isSending={isSendingTx}
          txHash={txHash}
          initialRecipient={scannedAddress || ''}
        />
      )}
      
      <style jsx>{`
        .wallet-info {
          background: var(--bg-secondary);
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
          color: var(--text-color);
        }
        
        .wallet-address-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 1.5rem;
          background: var(--card-bg);
          border-radius: 12px;
          border: 1px solid var(--card-border);
          box-shadow: 0 1px 3px var(--card-shadow);
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
          box-shadow: 0 2px 8px var(--card-shadow);
          border: 1px solid var(--card-border);
        }
        
        .qr-code img {
          display: block;
          width: 150px;
          height: 150px;
        }
        
        .qr-help {
          margin: 0.5rem 0 0 0;
          font-size: 0.85rem;
          color: var(--text-tertiary);
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
          color: var(--text-color);
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
        
        .address-display {
          position: relative;
          display: flex;
          align-items: center;
          background: var(--bg-tertiary);
          padding: 0.75rem 1rem;
          border-radius: 8px;
          border: 1px solid var(--card-border);
          margin-bottom: 0.75rem;
        }
        
        .wallet-address {
          flex: 1;
          font-family: monospace;
          overflow-wrap: break-word;
          font-size: 0.9rem;
          color: var(--text-color);
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
          color: var(--text-secondary);
          transition: background-color 0.2s;
        }
        
        .copy-button:hover {
          background-color: var(--toggle-hover-bg);
        }
        
        .view-button {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          color: var(--primary-color);
          text-decoration: none;
          font-size: 0.85rem;
          padding: 0.25rem 0;
          transition: color 0.2s;
        }
        
        .view-button:hover {
          color: #3D53D9;
          text-decoration: underline;
        }
        
        .address-actions {
          display: flex;
          gap: 1rem;
        }
        
        .balance-section {
          margin-top: 2rem;
        }
        
        .balance-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
        }
        
        .balance-header h4 {
          margin: 0;
          color: var(--text-color);
        }
        
        .balance-actions {
          display: flex;
          gap: 8px;
        }
        
        .refresh-button {
          width: 100%;
          border-radius: 8px;
          font-weight: 500;
          margin-top: 0.5rem;
        }
        
        .scan-button {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .loading-balances {
          margin-top: 1rem;
          text-align: center;
        }
        
        .token-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .token-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: var(--card-bg);
          border-radius: 12px;
          border: 1px solid var(--card-border);
          box-shadow: 0 1px 3px var(--card-shadow);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .token-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 3px 6px var(--card-shadow);
        }
        
        .token-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .token-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: contain;
        }
        
        .token-details {
          display: flex;
          flex-direction: column;
        }
        
        .token-name {
          font-weight: 500;
          color: var(--text-color);
        }
        
        .token-symbol {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }
        
        .token-balance {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }
        
        .balance-amount {
          font-weight: 600;
          font-size: 1.1rem;
          color: var(--text-color);
        }
        
        .balance-usd {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-top: 0.2rem;
        }
        
        .token-actions {
          display: flex;
          gap: 0.75rem;
        }
        
        .total-balance {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1rem;
          background: rgba(75, 102, 243, 0.05);
          border-radius: 8px;
          margin-bottom: 1rem;
        }
        
        .total-label {
          font-weight: 500;
          color: var(--text-secondary);
        }
        
        .total-amount {
          font-weight: 700;
          font-size: 1.2rem;
          color: var(--text-color);
        }
        
        .transaction-receipt {
          margin: 1.5rem 0;
          background-color: #f1fbf6;
          border-radius: 12px;
          border: 1px solid #c5e8d1;
          overflow: hidden;
          box-shadow: 0 1px 3px var(--card-shadow);
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
          color: var(--text-color);
          font-size: 0.9rem;
        }
        
        .tx-hash {
          font-family: monospace;
          background: var(--bg-tertiary);
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          color: var(--text-color);
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
          color: var(--text-secondary);
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
        
        @media (max-width: 768px) {
          .wallet-address-container {
            flex-direction: column;
            align-items: center;
          }
          
          .qr-code-container {
            margin-bottom: 1.5rem;
          }
          
          .address-details {
            width: 100%;
          }
          
          .token-item {
            padding: 0.75rem;
          }
          
          .token-icon {
            width: 32px;
            height: 32px;
          }
          
          .token-name {
            font-size: 0.9rem;
          }
          
          .balance-amount {
            font-size: 1rem;
          }
          
          .balance-usd {
            font-size: 0.8rem;
          }
        }
        
        @media (max-width: 480px) {
          .balance-actions {
            flex-direction: column;
            align-items: flex-end;
            gap: 6px;
          }
          
          .scan-button,
          .refresh-button {
            font-size: 0.75rem;
            padding: 4px 8px;
          }
          
          .token-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
          }
          
          .token-info {
            width: 100%;
          }
          
          .token-balance {
            width: 100%;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          }
          
          .token-actions {
            width: 100%;
          }
          
          .token-actions button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default WalletInfo; 
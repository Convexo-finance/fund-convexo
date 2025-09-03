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
  
  // State for QR scanner
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
      
      if (selectedToken === 'ETH') {
        // Send ETH transaction using embedded wallet
        const value = parseUnits(amount, 18);
        const valueHex = `0x${value.toString(16)}`;
        
        const tx = await provider.request({
          method: 'eth_sendTransaction',
          params: [{
            from: wallet.address,
            to: recipient,
            value: valueHex,
            chainId: 10 // Optimism
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
            chainId: 10 // Optimism
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
            chainId: 10 // Optimism
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
    <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-lg mt-4">
      {/* Network indicator */}
      <div className="flex justify-end mb-4">
        <div className="flex items-center bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-full text-sm font-medium">
          <img 
            src={optimismLogoUrl}
            alt="Optimism Logo" 
            className="w-4 h-4 mr-2 rounded-full"
          />
          <span>Optimism Network</span>
        </div>
      </div>
      
      <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Your Wallet</h3>
      
      {/* Wallet Address Container */}
      <div className="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-start">
          {/* QR Code Container */}
          <div className="flex flex-col items-center mb-6 md:mb-0 md:mr-6">
            <div className="bg-white p-2 rounded-lg shadow border border-gray-200">
              <img src={qrCodeUrl} alt="Wallet Address QR Code" className="w-36 h-36" />
            </div>
            <p className="text-xs text-gray-500 mt-2">Scan to view or send funds</p>
          </div>
          
          {/* Address Details */}
          <div className="w-full">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300">Wallet Address</h4>
              <button 
                onClick={handleExportWallet}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <span className="text-xs">🔑</span>
                Export Wallet
              </button>
            </div>
            
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-600 mb-3">
              <p className="font-mono text-sm break-all text-gray-800 dark:text-gray-200 select-all overflow-hidden truncate">
                {wallet.address}
              </p>
              <div className="flex gap-4 mt-2">
                <button 
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  onClick={() => {
                    navigator.clipboard.writeText(wallet.address);
                  }}
                >
                  📋 Copy
                </button>
                <a 
                  href={`https://optimistic.etherscan.io/address/${wallet.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                >
                  🔍 View
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Balances Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-medium text-gray-800 dark:text-white">Balances</h4>
          <div className="flex gap-2 flex-col sm:flex-row">
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
            >
              <span>🔄</span> Refresh
            </button>
            <button
              onClick={openQRScanner}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              <span>📷</span> Scan Wallet
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">Loading balances...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* ETH Balance */}
            <div className="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 p-4 shadow-sm hover:shadow transition-shadow duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img src={ethLogoUrl} alt="ETH" className="w-10 h-10 rounded-full" />
                  <div>
                    <div className="font-medium text-gray-800 dark:text-gray-200">Ethereum</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">ETH</div>
                  </div>
                </div>
                <div className="flex-1 sm:text-right">
                  <div className="font-semibold text-lg text-gray-800 dark:text-white">
                    {formatTokenBalance(balances.ethBalance, 6)}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {formatUsd(ethValueUsd)}
                  </div>
                </div>
                <button 
                  onClick={() => openSendModal('ETH')} 
                  className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                >
                  Send
                </button>
              </div>
            </div>
            
            {/* USDC Balance */}
            <div className="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 p-4 shadow-sm hover:shadow transition-shadow duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img src={usdcLogoUrl} alt="USDC" className="w-10 h-10 rounded-full" />
                  <div>
                    <div className="font-medium text-gray-800 dark:text-gray-200">USD Coin</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">USDC</div>
                  </div>
                </div>
                <div className="flex-1 sm:text-right">
                  <div className="font-semibold text-lg text-gray-800 dark:text-white">
                    {formatTokenBalance(balances.uscBalance, 6)}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {formatUsd(usdcValueUsd)}
                  </div>
                </div>
                <button 
                  onClick={() => openSendModal('USDC')} 
                  className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                >
                  Send
                </button>
              </div>
            </div>
            
            {/* PAPAYOS Balance */}
            <div className="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 p-4 shadow-sm hover:shadow transition-shadow duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img src={papayosLogoUrl} alt="PAPAYOS" className="w-10 h-10 rounded-full" />
                  <div>
                    <div className="font-medium text-gray-800 dark:text-gray-200">PAPAYOS</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">PAPAYOS</div>
                  </div>
                </div>
                <div className="flex-1 sm:text-right">
                  <div className="font-semibold text-lg text-gray-800 dark:text-white">
                    {formatTokenBalance(balances.papayosBalance, 6)}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {formatUsd(papayosValueUsd)}
                  </div>
                </div>
                <button 
                  onClick={() => openSendModal('PAPAYOS')} 
                  className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                >
                  Send
                </button>
              </div>
            </div>
            
            {/* Total Balance */}
            <div className="flex justify-between items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="font-medium text-gray-700 dark:text-gray-300">Total Value</div>
              <div className="font-bold text-xl text-gray-800 dark:text-white">{formatUsd(totalValueUsd)}</div>
            </div>
          </div>
        )}
      </div>
      
      {/* Transaction Receipt */}
      {txHash && (
        <div className="mb-6 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 overflow-hidden shadow-sm">
          <div className="flex items-center gap-3 p-4 bg-green-100 dark:bg-green-800/30 border-b border-green-200 dark:border-green-800">
            <div className="flex items-center justify-center w-6 h-6 bg-green-600 text-white rounded-full font-bold text-sm">✓</div>
            <h4 className="text-green-800 dark:text-green-400 font-medium">Transaction Sent</h4>
          </div>
          <div className="p-4">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Transaction Hash:</span>
              <code className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded text-sm font-mono">
                {txHash.substring(0, 10)}...{txHash.substring(txHash.length - 8)}
              </code>
              <a 
                href={`https://optimistic.etherscan.io/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
              >
                View on Explorer
              </a>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your transaction has been submitted to the network. It may take a few moments to be confirmed.
            </p>
          </div>
        </div>
      )}
      
      {/* QR Scanner */}
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
    </div>
  );
};

export default WalletInfo; 
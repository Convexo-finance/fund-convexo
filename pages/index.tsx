import { useState, useEffect } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import Layout from '../components/shared/Layout';
import Loading from '../components/shared/Loading';
import Button from '../components/shared/Button';
import WalletInfo from '../components/wallet/WalletInfo';
import { TokenBalance, Wallet } from '../types/index';
import { useTokenBalances } from '../hooks/useTokenBalances';
import { useSmartWallets } from '../components/SmartWalletsProvider';

export default function Home() {
  const { login, ready, authenticated, user, logout } = usePrivy();
  const { wallets } = useWallets();
  const { smartAccountAddress, isLoading: isSmartWalletLoading, sendTransaction } = useSmartWallets();
  const [smartWalletTxHash, setSmartWalletTxHash] = useState<string>('');
  const [isSendingTx, setIsSendingTx] = useState<boolean>(false);

  // Get embedded wallet from Privy
  const userWallet = wallets?.[0];
  
  // Use our custom hook to fetch real balances from Optimism
  const { 
    balances, 
    isLoading: isBalanceLoading, 
    refetch: refreshBalances 
  } = useTokenBalances(userWallet?.address);

  // Send a test transaction via the smart wallet
  const sendSmartWalletTransaction = async () => {
    if (!smartAccountAddress) {
      console.error("Smart wallet not available");
      return;
    }

    setIsSendingTx(true);
    try {
      // Use the sendTransaction function from context
      const hash = await sendTransaction({
        to: smartAccountAddress as `0x${string}`,
        value: BigInt(0),
        data: '0x'
      });
      setSmartWalletTxHash(hash);
    } catch (error) {
      console.error("Error sending transaction:", error);
    } finally {
      setIsSendingTx(false);
    }
  };

  // Show loading state while Privy initializes
  if (!ready) {
    return <Loading fullScreen={true} text="Loading ETH CALI Wallet..." />;
  }

  return (
    <Layout>
      {!authenticated ? (
        // Login view
        <div className="login-section">
          <h2>Welcome to ETH CALI Wallet</h2>
          <p>Login with email or phone to access your wallet</p>
          <Button 
            onClick={login} 
            variant="primary" 
            size="large"
          >
            Login with Privy
          </Button>
        </div>
      ) : (
        // Wallet view after authentication
        <div className="wallet-section">
          <h2>Welcome back!</h2>
          <p className="user-info">Logged in as: {user?.email?.address || user?.phone?.number || 'User'}</p>
          
          {userWallet ? (
            <>
              {/* Embedded Wallet Info */}
              <div className="wallet-card">
                <h3>Embedded Wallet</h3>
                <WalletInfo 
                  wallet={userWallet as unknown as Wallet} 
                  balances={balances}
                  isLoading={isBalanceLoading}
                  onRefresh={refreshBalances}
                />
              </div>
              
              {/* Smart Wallet Info */}
              <div className="wallet-card">
                <h3>Smart Wallet (Account Abstraction)</h3>
                {isSmartWalletLoading ? (
                  <Loading size="small" text="Creating smart wallet..." />
                ) : smartAccountAddress ? (
                  <div className="smart-wallet-info">
                    <p><strong>Address:</strong> {smartAccountAddress}</p>
                    <div className="smart-wallet-actions">
                      <Button
                        onClick={sendSmartWalletTransaction}
                        variant="secondary"
                        size="small"
                        disabled={isSendingTx}
                      >
                        {isSendingTx ? 'Sending...' : 'Send Test Transaction'}
                      </Button>
                    </div>
                    {smartWalletTxHash && (
                      <div className="transaction-info">
                        <p><strong>Transaction Hash:</strong></p>
                        <p className="tx-hash">{smartWalletTxHash}</p>
                        <a 
                          href={`https://optimistic.etherscan.io/tx/${smartWalletTxHash}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="block-explorer-link"
                        >
                          View on Optimism Explorer
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <p>Smart wallet not available</p>
                )}
              </div>
            </>
          ) : (
            // No wallet found yet - show loading
            <div className="loading-wallet">
              <p>Your wallet is being created...</p>
              <Loading size="medium" text="" />
            </div>
          )}
          
          <div className="logout-section">
            <Button onClick={logout} variant="secondary" size="medium">
              Logout
            </Button>
          </div>
        </div>
      )}

      <style jsx>{`
        .login-section {
          text-align: center;
          margin: 3rem 0;
          padding: 2.5rem;
          background: rgba(255, 255, 255, 0.98);
          border-radius: 8px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
        }
        
        h2 {
          margin-bottom: 1.5rem;
          color: #333;
          font-weight: 600;
        }
        
        h3 {
          margin-bottom: 1rem;
          color: #444;
          font-size: 1.2rem;
          font-weight: 600;
        }
        
        .user-info {
          color: #666;
          margin-bottom: 1.5rem;
          font-size: 0.95rem;
        }
        
        .loading-wallet {
          text-align: center;
          margin: 2rem 0;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.98);
          border-radius: 8px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
        }
        
        .wallet-card {
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.98);
          border-radius: 8px;
          border: 1px solid #eee;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .wallet-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
        }
        
        .smart-wallet-info {
          margin-top: 1rem;
        }
        
        .smart-wallet-actions {
          margin: 1rem 0;
        }
        
        .transaction-info {
          margin-top: 1rem;
          padding: 1rem;
          background: #f0f0f0;
          border-radius: 4px;
        }
        
        .tx-hash {
          word-break: break-all;
          font-family: monospace;
          font-size: 0.9rem;
          margin: 0.5rem 0;
          padding: 0.5rem;
          background: #e8e8e8;
          border-radius: 4px;
        }
        
        .block-explorer-link {
          display: inline-block;
          margin-top: 0.5rem;
          color: #4B66F3;
          text-decoration: underline;
        }
        
        .logout-section {
          text-align: center;
          margin-top: 2rem;
        }
        
        /* Responsive styling for mobile devices */
        @media (max-width: 768px) {
          .wallet-card {
            padding: 1.25rem;
          }
          
          h2 {
            font-size: 1.5rem;
          }
          
          h3 {
            font-size: 1.1rem;
          }
        }
        
        @media (max-width: 480px) {
          .login-section {
            margin: 1.5rem 0;
            padding: 1.5rem;
          }
          
          .wallet-card {
            padding: 1rem;
            margin-bottom: 1.5rem;
          }
          
          h2 {
            font-size: 1.4rem;
          }
          
          h3 {
            font-size: 1rem;
            margin-bottom: 0.75rem;
          }
          
          .transaction-info {
            padding: 0.75rem;
          }
          
          .tx-hash {
            font-size: 0.8rem;
            padding: 0.375rem;
          }
        }
      `}</style>
    </Layout>
  );
} 
import { useState, useEffect } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import Layout from '@/components/shared/Layout';
import Loading from '@/components/shared/Loading';
import Button from '@/components/shared/Button';
import WalletInfo from '@/components/wallet/WalletInfo';
import { TokenBalance, Wallet } from '@/types/index';
import { getMockBalances } from '@/lib/walletService';
import { useSmartWallets } from '@/components/SmartWalletsProvider';
import { sendSmartAccountTransaction } from '@/utils/smartAccountHelper';

export default function SimpleWallet() {
  const { login, ready, authenticated, user, logout } = usePrivy();
  const { wallets } = useWallets();
  const { client, smartAccountAddress, isLoading: isSmartWalletLoading } = useSmartWallets();
  const [balances, setBalances] = useState<TokenBalance>({ ethBalance: '0', uscBalance: '0' });
  const [loading, setLoading] = useState<boolean>(false);
  const [smartWalletTxHash, setSmartWalletTxHash] = useState<string>('');
  const [isSendingTx, setIsSendingTx] = useState<boolean>(false);

  // Get embedded wallet from Privy
  const userWallet = wallets?.[0];

  // Load balances when wallet is available
  useEffect(() => {
    if (userWallet?.address) {
      fetchBalances(userWallet.address);
    }
  }, [userWallet?.address]);

  // Get balances (using mock data for demo)
  const fetchBalances = async (address: string) => {
    setLoading(true);
    try {
      // In a real app, you would fetch from an API or blockchain
      // For demo, we use mock data
      const mockBalances = getMockBalances(address);
      setBalances(mockBalances);
    } catch (error) {
      console.error('Error fetching balances:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle login
  const handleLogin = () => {
    login();
  };

  // Handle refresh balances
  const handleRefreshBalances = () => {
    if (userWallet?.address) {
      fetchBalances(userWallet.address);
    }
  };

  // Send a test transaction via the smart wallet
  const sendSmartWalletTransaction = async () => {
    if (!client || !smartAccountAddress) {
      console.error("Smart wallet client not available");
      return;
    }

    setIsSendingTx(true);
    try {
      // Use our helper function to avoid chain property issues
      const hash = await sendSmartAccountTransaction(client, {
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
    return <Loading fullScreen={true} text="Loading Papayapp..." />;
  }

  return (
    <Layout>
      {!authenticated ? (
        // Login view
        <div className="login-section">
          <h2>Welcome to Papayapp</h2>
          <p>Login with email or phone to access your wallet</p>
          <Button 
            onClick={handleLogin} 
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
                  isLoading={loading}
                  onRefresh={handleRefreshBalances}
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
          padding: 2rem;
          background: #f5f5f5;
          border-radius: 8px;
        }
        
        h2 {
          margin-bottom: 1rem;
          color: #444;
        }
        
        h3 {
          margin-bottom: 1rem;
          color: #555;
          font-size: 1.2rem;
        }
        
        .user-info {
          color: #666;
          margin-bottom: 1.5rem;
        }
        
        .loading-wallet {
          text-align: center;
          margin: 2rem 0;
          padding: 1.5rem;
          background: #f5f5f5;
          border-radius: 8px;
        }
        
        .wallet-card {
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: #f9f9f9;
          border-radius: 8px;
          border: 1px solid #eee;
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
      `}</style>
    </Layout>
  );
} 
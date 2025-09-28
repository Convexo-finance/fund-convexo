import React, { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import Layout from '../components/wallet/shared/Layout';
import Loading from '../components/wallet/shared/Loading';
import Button from '../components/wallet/shared/Button';
import VaultInterface from '../components/contracts/VaultInterface';
import LoanNFTInterface from '../components/contracts/LoanNFTInterface';
import CollectorInterface from '../components/contracts/CollectorInterface';

type ContractType = 'vault' | 'loans' | 'collector';

const ContractsPage: React.FC = () => {
  const { login, ready, authenticated, user, logout } = usePrivy();
  const [activeContract, setActiveContract] = useState<ContractType>('vault');

  if (!ready) {
    return <Loading fullScreen={true} text="Loading..." />;
  }

  if (!authenticated) {
    return (
      <Layout title="Convexo - Contract Testing">
        <div className="text-center py-12 px-6 bg-white dark:bg-gray-800 rounded-lg shadow-md max-w-md mx-auto">
          <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-purple-600 dark:text-purple-400 text-2xl">🔧</span>
          </div>
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">
            Contract Testing
          </h2>
          <p className="mb-8 text-gray-600 dark:text-gray-300">
            Connect your wallet to test live contract interactions on Base Sepolia.
          </p>
          <Button onClick={login} variant="primary" size="large" className="w-full">
            Connect Wallet
          </Button>
        </div>
      </Layout>
    );
  }

  const contracts = [
    { 
      id: 'vault', 
      label: 'Convexo Vault', 
      icon: '🏦', 
      description: 'Deposit/Withdraw USDC',
      address: '0xd61bc1202D0B920D80b69762B78B4ce05dF03D1C'
    },
    { 
      id: 'loans', 
      label: 'Loan NFTs', 
      icon: '📄', 
      description: 'View loan details',
      address: '0x0B6962F7468BA68A8715ccb67233B54c8dEb5b73'
    },
    { 
      id: 'collector', 
      label: 'Collector', 
      icon: '💳', 
      description: 'Loan payments',
      address: '0xf489d4c235895750Cf6EC06C7B26187aD5Ef1207'
    },
  ] as const;

  const renderContractContent = () => {
    switch (activeContract) {
      case 'vault':
        return <VaultInterface />;
      case 'loans':
        return <LoanNFTInterface />;
      case 'collector':
        return <CollectorInterface />;
      default:
        return <VaultInterface />;
    }
  };

  return (
    <Layout title="Convexo - Contract Testing">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">Contract Testing 🔧</h1>
              <p className="text-purple-100">
                Live interaction with deployed Base Sepolia contracts
              </p>
            </div>
            <div className="text-right">
              <p className="text-purple-200 text-sm">Connected as:</p>
              <p className="font-mono text-sm truncate max-w-32">
                {user?.email?.address || user?.phone?.number || 'User'}
              </p>
              <Button 
                onClick={logout} 
                variant="outline" 
                size="small" 
                className="mt-2 text-white border-white hover:bg-white hover:text-purple-600"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Contract Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-1 p-1">
              {contracts.map((contract) => (
                <button
                  key={contract.id}
                  onClick={() => setActiveContract(contract.id)}
                  className={`
                    flex-1 flex flex-col items-center space-y-1 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                    ${activeContract === contract.id
                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <span className="text-lg">{contract.icon}</span>
                  <span>{contract.label}</span>
                  <span className="text-xs opacity-75">{contract.description}</span>
                  <span className="font-mono text-xs opacity-75">
                    {contract.address.slice(0, 8)}...{contract.address.slice(-6)}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* Contract Content */}
          <div className="p-6">
            {renderContractContent()}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            🚀 Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="text-left justify-start"
              onClick={() => window.open('https://sepolia.basescan.org/address/0xd61bc1202D0B920D80b69762B78B4ce05dF03D1C', '_blank')}
            >
              🔍 View Vault on BaseScan
            </Button>
            <Button 
              variant="outline" 
              className="text-left justify-start"
              onClick={() => window.open('https://sepolia.basescan.org/address/0x0B6962F7468BA68A8715ccb67233B54c8dEb5b73', '_blank')}
            >
              📄 View Loan NFT on BaseScan
            </Button>
            <Button 
              variant="outline" 
              className="text-left justify-start"
              onClick={() => window.open('https://sepolia.basescan.org/address/0xf489d4c235895750Cf6EC06C7B26187aD5Ef1207', '_blank')}
            >
              💳 View Collector on BaseScan
            </Button>
          </div>
        </div>

        {/* Network & Contract Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Network Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              🔗 Network Information
            </h4>
            <div className="text-blue-800 dark:text-blue-200 text-sm space-y-1">
              <p><strong>Network:</strong> Base Sepolia</p>
              <p><strong>Chain ID:</strong> 84532</p>
              <p><strong>RPC:</strong> https://sepolia.base.org</p>
              <p><strong>Explorer:</strong> sepolia.basescan.org</p>
            </div>
          </div>

          {/* Contract Addresses */}
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
            <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
              📋 Contract Addresses
            </h4>
            <div className="text-purple-800 dark:text-purple-200 text-sm space-y-1">
              <p><strong>USDC:</strong> <span className="font-mono text-xs">0x036C...3dCF7e</span></p>
              <p><strong>Vault:</strong> <span className="font-mono text-xs">0xd61b...03D1C</span></p>
              <p><strong>Loans:</strong> <span className="font-mono text-xs">0x0B69...5b73</span></p>
              <p><strong>Collector:</strong> <span className="font-mono text-xs">0xf489...1207</span></p>
            </div>
          </div>
        </div>

        {/* Testing Instructions */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
            🧪 Testing Instructions
          </h4>
          <div className="text-amber-800 dark:text-amber-200 text-sm space-y-1">
            <p>• <strong>Get Test USDC:</strong> Use Base Sepolia faucet or bridge to get test USDC</p>
            <p>• <strong>Vault Testing:</strong> Deposit USDC to receive CVXS shares, then withdraw</p>
            <p>• <strong>Loan Testing:</strong> Query existing loans by ID (try 1, 2, 3...)</p>
            <p>• <strong>Payment Testing:</strong> Make payments against active loans</p>
            <p>• <strong>Monitor:</strong> Watch transactions on BaseScan for confirmation</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ContractsPage;

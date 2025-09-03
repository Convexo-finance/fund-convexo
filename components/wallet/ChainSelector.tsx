import { useState } from 'react';
import { useWallets } from '@privy-io/react-auth';
import { mainnet, optimism, base } from 'viem/chains';

const SUPPORTED_CHAINS = [
  {
    ...mainnet,
    name: 'Ethereum',
    logo: '/images/ethereum.png',
    color: '#627EEA'
  },
  {
    ...optimism,
    name: 'Optimism',
    logo: '/images/optimism.png', 
    color: '#FF0420'
  },
  {
    ...base,
    name: 'Base',
    logo: 'https://avatars.githubusercontent.com/u/108554348?s=280&v=4',
    color: '#0052FF'
  }
];

interface ChainSelectorProps {
  selectedChainId: number;
  onChainChange: (chainId: number) => void;
  walletAddress?: string;
}

export default function ChainSelector({ 
  selectedChainId, 
  onChainChange, 
  walletAddress 
}: ChainSelectorProps) {
  const { wallets } = useWallets();
  const [isSwitching, setIsSwitching] = useState(false);

  const selectedChain = SUPPORTED_CHAINS.find(chain => chain.id === selectedChainId);
  const activeWallet = wallets?.find(w => w.address === walletAddress);

  const handleChainSwitch = async (chainId: number) => {
    if (!activeWallet || chainId === selectedChainId) return;

    setIsSwitching(true);
    try {
      // Switch wallet to the selected chain
      await activeWallet.switchChain(chainId);
      onChainChange(chainId);
    } catch (error) {
      console.error('Error switching chain:', error);
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-600">
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        Network ({selectedChain?.name})
      </h4>
      
      <div className="grid grid-cols-3 gap-2">
        {SUPPORTED_CHAINS.map((chain) => (
          <button
            key={chain.id}
            onClick={() => handleChainSwitch(chain.id)}
            disabled={isSwitching || chain.id === selectedChainId}
            className={`p-3 rounded-lg border text-center transition-all ${
              chain.id === selectedChainId
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            } ${isSwitching ? 'opacity-50' : ''}`}
          >
            <img 
              src={chain.logo} 
              alt={chain.name}
              className="w-8 h-8 mx-auto mb-2 rounded-full"
            />
            <div className="text-xs font-medium text-gray-800 dark:text-gray-200">
              {chain.name}
            </div>
            {chain.id === selectedChainId && (
              <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">✓</div>
            )}
          </button>
        ))}
      </div>

      {isSwitching && (
        <div className="mt-3 text-center">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Switching network...
          </div>
        </div>
      )}
    </div>
  );
}

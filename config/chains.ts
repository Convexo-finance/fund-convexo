import { mainnet, optimism, base } from 'viem/chains';

/**
 * Supported chains configuration for ETH CALI Wallet
 * All are Tier 3 EVM chains with full Privy support
 */

export const SUPPORTED_CHAINS = {
  ethereum: {
    id: 1,
    name: 'Ethereum',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
      default: { http: ['https://eth.llamarpc.com'] },
    },
    blockExplorers: {
      default: { name: 'Etherscan', url: 'https://etherscan.io' },
    },
    viemChain: mainnet,
    logo: '/images/ethereum.png',
    color: '#627EEA'
  },
  optimism: {
    id: 10,
    name: 'Optimism',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
      default: { http: ['https://mainnet.optimism.io'] },
    },
    blockExplorers: {
      default: { name: 'Optimistic Etherscan', url: 'https://optimistic.etherscan.io' },
    },
    viemChain: optimism,
    logo: '/images/optimism.png',
    color: '#FF0420'
  },
  base: {
    id: 8453,
    name: 'Base',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
      default: { http: ['https://mainnet.base.org'] },
    },
    blockExplorers: {
      default: { name: 'BaseScan', url: 'https://basescan.org' },
    },
    viemChain: base,
    logo: 'https://avatars.githubusercontent.com/u/108554348?s=280&v=4',
    color: '#0052FF'
  }
} as const;

export type SupportedChainId = keyof typeof SUPPORTED_CHAINS;

export const DEFAULT_CHAIN: SupportedChainId = 'optimism';

/**
 * Get chain configuration by ID
 */
export function getChainById(chainId: number) {
  return Object.values(SUPPORTED_CHAINS).find(chain => chain.id === chainId);
}

/**
 * Get chain configuration by key
 */
export function getChain(chainKey: SupportedChainId) {
  return SUPPORTED_CHAINS[chainKey];
}

/**
 * Get all supported chain IDs
 */
export function getSupportedChainIds(): number[] {
  return Object.values(SUPPORTED_CHAINS).map(chain => chain.id);
}

import { Network } from '../types/index';

// Optimism network configuration
export const OPTIMISM: Network = {
  id: 10,
  name: 'Optimism Mainnet',
  shortName: 'Optimism',
  icon: 'https://optimism.io/images/favicon.ico',
  explorerUrl: 'https://optimistic.etherscan.io',
  rpcUrl: 'https://mainnet.optimism.io',
  testnet: false,
  color: '#FF0B51'
};

// Optimism Goerli (testnet) configuration
export const OPTIMISM_GOERLI: Network = {
  id: 420,
  name: 'Optimism Goerli',
  shortName: 'Optimism Goerli',
  icon: 'https://optimism.io/images/favicon.ico',
  explorerUrl: 'https://goerli-optimism.etherscan.io',
  rpcUrl: 'https://goerli.optimism.io',
  testnet: true,
  color: '#FF0B51'
};

// Default network
export const DEFAULT_NETWORK = OPTIMISM;

// Get network by chain ID
export function getNetworkById(chainId: number): Network {
  switch (chainId) {
    case 10:
      return OPTIMISM;
    case 420:
      return OPTIMISM_GOERLI;
    default:
      return DEFAULT_NETWORK;
  }
}

// Token configurations
export const TOKENS = {
  // Optimism tokens
  [OPTIMISM.id]: {
    ETH: {
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: 18,
      icon: 'https://ethereum.org/static/6b935ac0e6194247347855dc3d328e83/6ed5f/eth-diamond-black.webp'
    },
    USDC: {
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      address: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
      icon: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png'
    }
  },
  // Add other networks as needed
}; 
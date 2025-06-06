import { TokenBalance } from '../types/index';

// CoinGecko IDs for tokens
export const COINGECKO_IDS = {
  ETH: 'ethereum',
  USDC: 'usd-coin',
  OP: 'optimism',
  PAPAYOS: 'papayos'
};

// Base URL for CoinGecko images
const COINGECKO_IMAGE_URL = 'https://assets.coingecko.com/coins/images';

// Fallback images in case CoinGecko fails
const FALLBACK_IMAGES = {
  ETH: '/images/ethereum.png',
  USDC: '/images/usdc.png',
  OP: '/images/optimism.png',
  PAPAYOS: '/ppytoken.jpg',
  DEFAULT: '/images/token-default.png'
};

/**
 * Get token logo URL from CoinGecko
 * @param tokenSymbol The token symbol (ETH, USDC, etc)
 * @returns The URL to the token logo
 */
export function getTokenLogoUrl(tokenSymbol: string): string {
  const symbol = tokenSymbol.toUpperCase();
  const id = COINGECKO_IDS[symbol];
  
  if (!id) {
    return FALLBACK_IMAGES[symbol] || FALLBACK_IMAGES.DEFAULT;
  }
  
  // For ETH: https://assets.coingecko.com/coins/images/279/large/ethereum.png
  // For USDC: https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png
  // For OP: https://assets.coingecko.com/coins/images/25244/large/Optimism.png
  switch (symbol) {
    case 'ETH':
      return `${COINGECKO_IMAGE_URL}/279/large/ethereum.png`;
    case 'USDC':
      return `${COINGECKO_IMAGE_URL}/6319/large/USD_Coin_icon.png`;
    case 'OP':
      return `${COINGECKO_IMAGE_URL}/25244/large/Optimism.png`;
    case 'PAPAYOS':
      return '/ppytoken.jpg';
    default:
      return FALLBACK_IMAGES.DEFAULT;
  }
}

/**
 * Get network logo URL
 * @param networkId The network ID (10 for Optimism)
 * @returns The URL to the network logo
 */
export function getNetworkLogoUrl(networkId: number): string {
  switch (networkId) {
    case 10: // Optimism
      return `${COINGECKO_IMAGE_URL}/25244/small/Optimism.png`;
    default:
      return '/images/network-default.png';
  }
}

/**
 * Format token balance for display
 * @param balance The balance as a string
 * @param decimals Number of decimals to display
 * @returns Formatted balance string
 */
export function formatTokenBalance(balance: string, decimals: number = 6): string {
  const value = parseFloat(balance);
  if (isNaN(value)) return '0.00';
  
  // For very small amounts, don't show scientific notation
  if (value < 0.000001 && value > 0) {
    return '< 0.000001';
  }
  
  return value.toFixed(decimals);
} 
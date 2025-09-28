import { ExchangeRate, RateResponse, SupportedAsset } from '../types/funding';

class RateService {
  private cache: Map<string, ExchangeRate> = new Map();
  private readonly CACHE_DURATION = 60000; // 1 minute cache
  private readonly FALLBACK_RATES = {
    'USD/COP': 4100, // Fallback rate if API fails
    'COP/USD': 0.000244
  };

  /**
   * Get exchange rate from various sources with fallbacks
   */
  async getExchangeRate(from: SupportedAsset, to: SupportedAsset): Promise<RateResponse> {
    const pair = `${from}/${to}`;
    const cacheKey = pair;

    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return {
        success: true,
        rate: cached.rate,
        source: cached.source,
        timestamp: cached.timestamp
      };
    }

    try {
      // Try multiple sources in order of preference
      let rate = await this.getFromExchangeAPI(from, to);
      
      if (!rate) {
        rate = await this.getFromBackupAPI(from, to);
      }

      if (!rate) {
        rate = this.getFallbackRate(from, to);
      }

      const exchangeRate: ExchangeRate = {
        rate,
        timestamp: Date.now(),
        source: 'api'
      };

      // Cache the result
      this.cache.set(cacheKey, exchangeRate);

      return {
        success: true,
        rate,
        source: 'api',
        timestamp: exchangeRate.timestamp
      };

    } catch (error) {
      console.error('Error fetching exchange rate:', error);
      
      // Return fallback rate
      const fallbackRate = this.getFallbackRate(from, to);
      
      return {
        success: false,
        rate: fallbackRate,
        source: 'fallback',
        timestamp: Date.now(),
        error: 'Failed to fetch current rate, using fallback'
      };
    }
  }

  /**
   * Primary API source - Using exchangerate-api.com (free tier)
   */
  private async getFromExchangeAPI(from: SupportedAsset, to: SupportedAsset): Promise<number | null> {
    try {
      // Convert crypto assets to USD first if needed
      let sourceAsset = from;
      let targetAsset = to;
      let cryptoToUsdRate = 1;

      // Handle crypto assets
      if (from === 'USDC') {
        sourceAsset = 'USD';
        cryptoToUsdRate = 1; // USDC is pegged to USD
      }

      if (to === 'USDC') {
        targetAsset = 'USD';
      }

      // Only proceed if we have a fiat pair or USD involved
      if ((sourceAsset === 'USD' || sourceAsset === 'COP') && 
          (targetAsset === 'USD' || targetAsset === 'COP')) {
        
        const response = await fetch(
          `https://api.exchangerate-api.com/v4/latest/${sourceAsset}`
        );

        if (!response.ok) throw new Error('API request failed');

        const data = await response.json();
        const rate = data.rates[targetAsset];

        if (rate) {
          return rate * cryptoToUsdRate;
        }
      }

      return null;
    } catch (error) {
      console.error('Exchange API error:', error);
      return null;
    }
  }

  /**
   * Backup API source - Using fixer.io or similar
   */
  private async getFromBackupAPI(from: SupportedAsset, to: SupportedAsset): Promise<number | null> {
    try {
      // Simple backup implementation
      // In production, you would use a backup API service
      
      if (from === 'USD' && to === 'COP') {
        // Simulate API call with current approximate rate
        return new Promise(resolve => {
          setTimeout(() => resolve(4100), 100); // Simulated API delay
        });
      }

      if (from === 'COP' && to === 'USD') {
        return new Promise(resolve => {
          setTimeout(() => resolve(0.000244), 100);
        });
      }

      if (from === 'USDC' && to === 'COP') {
        const usdToCop = await this.getFromBackupAPI('USD', 'COP');
        return usdToCop; // USDC is pegged to USD
      }

      if (from === 'COP' && to === 'USDC') {
        const copToUsd = await this.getFromBackupAPI('COP', 'USD');
        return copToUsd;
      }

      return null;
    } catch (error) {
      console.error('Backup API error:', error);
      return null;
    }
  }

  /**
   * Get fallback rate from static values
   */
  private getFallbackRate(from: SupportedAsset, to: SupportedAsset): number {
    const pair = `${from}/${to}`;
    
    // Handle USDC as USD
    const normalizedPair = pair
      .replace('USDC', 'USD')
      .replace('USD/USD', 'USD/USD');

    if (normalizedPair === 'USD/USD' || normalizedPair === 'USDC/USDC') {
      return 1;
    }

    if (this.FALLBACK_RATES[normalizedPair as keyof typeof this.FALLBACK_RATES]) {
      return this.FALLBACK_RATES[normalizedPair as keyof typeof this.FALLBACK_RATES];
    }

    // Try reverse pair
    const reversePair = `${to}/${from}`.replace('USDC', 'USD');
    const reverseRate = this.FALLBACK_RATES[reversePair as keyof typeof this.FALLBACK_RATES];
    
    if (reverseRate) {
      return 1 / reverseRate;
    }

    // Default fallback
    console.warn(`No fallback rate found for ${pair}, using 1`);
    return 1;
  }

  /**
   * Apply margin to rate based on transaction type
   */
  applyMargin(rate: number, type: 'cashin' | 'cashout'): number {
    if (type === 'cashout') {
      // Reduce by 2% for cash out (less favorable rate)
      return rate * 0.98;
    }
    
    // For cash in, use market rate
    return rate;
  }

  /**
   * Calculate conversion with fees
   */
  calculateConversion(
    amount: number,
    rate: number,
    type: 'cashin' | 'cashout'
  ): {
    adjustedRate: number;
    totalReceived: number;
    fee: number;
    feePercentage: number;
  } {
    const adjustedRate = this.applyMargin(rate, type);
    const feePercentage = type === 'cashout' ? 2 : 0; // 2% fee for cashout
    const totalReceived = amount * adjustedRate;
    const fee = type === 'cashout' ? totalReceived * 0.02 : 0;

    return {
      adjustedRate,
      totalReceived: totalReceived - fee,
      fee,
      feePercentage
    };
  }

  /**
   * Format currency amount
   */
  formatCurrency(amount: number, asset: SupportedAsset): string {
    const formatters = {
      USD: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }),
      COP: new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }),
      USDC: new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 }),
      ETH: new Intl.NumberFormat('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 6 }),
      BTC: new Intl.NumberFormat('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 8 })
    };

    const formatter = formatters[asset] || formatters.USD;
    
    if (asset === 'USDC') {
      return `${formatter.format(amount)} USDC`;
    }
    if (asset === 'ETH') {
      return `${formatter.format(amount)} ETH`;
    }
    if (asset === 'BTC') {
      return `${formatter.format(amount)} BTC`;
    }

    return formatter.format(amount);
  }

  /**
   * Get supported asset information
   */
  getAssetInfo(asset: SupportedAsset) {
    const assetInfo = {
      USDC: {
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 6,
        icon: '💰',
        isStablecoin: true,
        isFiat: false,
        contractAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        network: 'Ethereum'
      },
      USD: {
        symbol: 'USD',
        name: 'US Dollar',
        decimals: 2,
        icon: '💵',
        isStablecoin: false,
        isFiat: true
      },
      COP: {
        symbol: 'COP',
        name: 'Colombian Peso',
        decimals: 0,
        icon: '💸',
        isStablecoin: false,
        isFiat: true
      },
      ETH: {
        symbol: 'ETH',
        name: 'Ethereum',
        decimals: 18,
        icon: '💎',
        isStablecoin: false,
        isFiat: false
      },
      BTC: {
        symbol: 'BTC',
        name: 'Bitcoin',
        decimals: 8,
        icon: '₿',
        isStablecoin: false,
        isFiat: false
      }
    };

    return assetInfo[asset];
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

export const rateService = new RateService();
export default rateService;

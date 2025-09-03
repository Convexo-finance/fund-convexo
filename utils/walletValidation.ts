/**
 * Wallet validation utilities for preventing duplicate external wallets
 */

export interface WalletValidationResult {
  isValid: boolean;
  error?: string;
  conflictType?: 'duplicate_external' | 'already_linked';
}

/**
 * Check if an external wallet address is already linked to another user
 * This provides additional validation beyond Privy's built-in checks
 */
export async function validateExternalWallet(
  walletAddress: string,
  currentUserId?: string
): Promise<WalletValidationResult> {
  try {
    // Call your API to check for existing wallet usage
    const response = await fetch('/api/validate-wallet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        walletAddress: walletAddress.toLowerCase(),
        currentUserId 
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      return {
        isValid: false,
        error: data.error || 'Validation failed'
      };
    }

    return data;
  } catch (error) {
    console.error('Wallet validation error:', error);
    return {
      isValid: false,
      error: 'Unable to validate wallet address'
    };
  }
}

/**
 * Format wallet address for comparison (lowercase, no checksum)
 */
export function normalizeWalletAddress(address: string): string {
  return address.toLowerCase().trim();
}

/**
 * Check if wallet is an external wallet (not Privy embedded)
 */
export function isExternalWallet(wallet: any): boolean {
  return wallet.walletClientType !== 'privy';
}

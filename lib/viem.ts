import { createPublicClient, createWalletClient, http, custom, formatUnits, parseUnits } from 'viem';
import { SEPOLIA_CHAIN } from './addresses';

// Public client for reading blockchain data
export const publicClient = createPublicClient({
  chain: SEPOLIA_CHAIN,
  transport: http(),
});

// Global wallet client instance
let walletClient: any = null;
let currentAddress: `0x${string}` | null = null;

// Initialize wallet client with Privy provider
export async function initializeWalletClient(privyWallet: any): Promise<boolean> {
  try {
    const provider = await privyWallet.getEthereumProvider();
    
    // Ensure we're on Base Sepolia
    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x14a34' }], // Base Sepolia in hex
      });
    } catch (switchError: any) {
      // Add Base Sepolia if it doesn't exist
      if (switchError.code === 4902) {
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0x14a34',
            chainName: 'Base Sepolia',
            nativeCurrency: {
              name: 'Ethereum',
              symbol: 'ETH',
              decimals: 18,
            },
            rpcUrls: ['https://sepolia.base.org'],
            blockExplorerUrls: ['https://sepolia.basescan.org'],
          }],
        });
      }
    }
    
    walletClient = createWalletClient({
      account: privyWallet.address as `0x${string}`,
      chain: SEPOLIA_CHAIN,
      transport: custom(provider),
    });
    
    currentAddress = privyWallet.address as `0x${string}`;
    
    console.log('Viem client initialized for:', currentAddress);
    return true;
  } catch (error) {
    console.error('Failed to initialize viem client:', error);
    return false;
  }
}

// Get current wallet client
export function getWalletClient() {
  if (!walletClient) {
    throw new Error('Wallet client not initialized. Please connect your wallet.');
  }
  return walletClient;
}

// Get current user address
export function getCurrentAddress(): `0x${string}` {
  if (!currentAddress) {
    throw new Error('No wallet address available. Please connect your wallet.');
  }
  return currentAddress;
}

// Check if wallet is connected and on correct chain
export async function ensureConnection(): Promise<void> {
  if (!walletClient || !currentAddress) {
    throw new Error('Wallet not connected. Please refresh and reconnect.');
  }

  try {
    const chainId = await walletClient.getChainId();
    if (chainId !== SEPOLIA_CHAIN.id) {
      throw new Error(`Wrong network. Please switch to Base Sepolia (Chain ID: ${SEPOLIA_CHAIN.id})`);
    }
  } catch (error) {
    console.error('Connection check failed:', error);
    throw new Error('Wallet connection lost. Please refresh and reconnect.');
  }
}

// USDC Helper Functions (6 decimals)
export const USDC_DECIMALS = 6;
export const VAULT_DECIMALS = 18; // ERC4626 shares

export function toUSDC(amount: number): bigint {
  return parseUnits(amount.toString(), USDC_DECIMALS);
}

export function formatUSDC(amount: bigint): string {
  return formatUnits(amount, USDC_DECIMALS);
}

export function toVaultShares(shares: number): bigint {
  return parseUnits(shares.toString(), VAULT_DECIMALS);
}

export function formatVaultShares(shares: bigint): string {
  return formatUnits(shares, VAULT_DECIMALS);
}

// Generic contract read function
export async function readContract(
  address: `0x${string}`,
  abi: any,
  functionName: string,
  args: any[] = []
) {
  try {
    const result = await publicClient.readContract({
      address,
      abi,
      functionName,
      args,
    });
    return result;
  } catch (error) {
    console.error(`Error reading ${functionName}:`, error);
    throw error;
  }
}

// Generic contract write function
export async function writeContract(
  address: `0x${string}`,
  abi: any,
  functionName: string,
  args: any[] = []
) {
  await ensureConnection();
  
  try {
    const client = getWalletClient();
    console.log(`Writing to ${functionName} with args:`, args);
    
    const hash = await client.writeContract({
      address,
      abi,
      functionName,
      args,
    });
    
    console.log(`Transaction hash: ${hash}`);
    return hash;
  } catch (error) {
    console.error(`Error writing ${functionName}:`, error);
    throw error;
  }
}

// Contract addresses from contracts.json - dynamically loaded
export interface ContractAddresses {
  ConvexoVault: `0x${string}`;
  LoanNoteNFT: `0x${string}`;
  Collector: `0x${string}`;
  USDC: `0x${string}`;
  FeeRecipient: `0x${string}`;
}

// Base Sepolia addresses (your deployed contracts)
export const ADDRESSES: ContractAddresses = {
  ConvexoVault: "0xd61bc1202D0B920D80b69762B78B4ce05dF03D1C",
  LoanNoteNFT: "0x0B6962F7468BA68A8715ccb67233B54c8dEb5b73", 
  Collector: "0xf489d4c235895750Cf6EC06C7B26187aD5Ef1207",
  USDC: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
  FeeRecipient: "0x3f9b734394FC1E96afe9523c69d30D227dF4ffca",
};

// Load addresses dynamically from contracts.json (fallback to hardcoded)
export async function loadContractAddresses(): Promise<ContractAddresses> {
  try {
    const response = await fetch('/contracts.json');
    const contracts = await response.json();
    
    if (contracts.baseSepolia) {
      return {
        ConvexoVault: contracts.baseSepolia.ConvexoVault || ADDRESSES.ConvexoVault,
        LoanNoteNFT: contracts.baseSepolia.LoanNoteNFT || ADDRESSES.LoanNoteNFT,
        Collector: contracts.baseSepolia.Collector || ADDRESSES.Collector,
        USDC: ADDRESSES.USDC, // USDC address is standard
        FeeRecipient: ADDRESSES.FeeRecipient,
      };
    }
    
    return ADDRESSES;
  } catch (error) {
    console.warn('Failed to load contracts.json, using fallback addresses:', error);
    return ADDRESSES;
  }
}

// Sepolia Chain Configuration
export const SEPOLIA_CHAIN = {
  id: 84532,
  name: 'Base Sepolia',
  network: 'base-sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://sepolia.base.org'],
    },
    public: {
      http: ['https://sepolia.base.org'],
    },
  },
  blockExplorers: {
    default: { name: 'BaseScan', url: 'https://sepolia.basescan.org' },
  },
  testnet: true,
} as const;

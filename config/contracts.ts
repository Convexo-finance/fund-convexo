import vaultABI from "../src/abi/ConvexoVault.json";
import nftABI from "../src/abi/LoanNoteNFT.json";
import collectorABI from "../src/abi/Collector.json";
import erc20ABI from "../src/abi/ERC20.json";

export const CONTRACTS = {
  usdc: { 
    address: "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as const, 
    abi: erc20ABI 
  },
  vault: { 
    address: "0xd61bc1202D0B920D80b69762B78B4ce05dF03D1C" as const, 
    abi: vaultABI 
  },
  loanNFT: { 
    address: "0x0B6962F7468BA68A8715ccb67233B54c8dEb5b73" as const, 
    abi: nftABI 
  },
  collector: { 
    address: "0xf489d4c235895750Cf6EC06C7B26187aD5Ef1207" as const, 
    abi: collectorABI 
  },
} as const;

export const FEE_RECIPIENT = "0x3f9b734394FC1E96afe9523c69d30D227dF4ffca" as const;

// Base Sepolia Chain Configuration
export const BASE_SEPOLIA = {
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
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 1059647,
    },
  },
  testnet: true,
} as const;

// USDC Decimals
export const USDC_DECIMALS = 6;

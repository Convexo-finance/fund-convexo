import { createPublicClient, createWalletClient, http, custom, formatUnits, parseUnits } from 'viem';
import { CONTRACTS, BASE_SEPOLIA, USDC_DECIMALS, VAULT_DECIMALS } from '../config/contracts';

// Public client for reading data
const publicClient = createPublicClient({
  chain: BASE_SEPOLIA,
  transport: http(),
});

// Contract Service Class
export class ContractService {
  private walletClient: any = null;
  private userAddress: `0x${string}` | null = null;

  // Initialize with Privy wallet
  async initialize(privyWallet: any) {
    try {
      const provider = await privyWallet.getEthereumProvider();
      
      // Ensure we're connected to Base Sepolia
      try {
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x14a34' }], // Base Sepolia chain ID in hex
        });
      } catch (switchError: any) {
        // If the chain doesn't exist, add it
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
      
      this.walletClient = createWalletClient({
        account: privyWallet.address as `0x${string}`,
        chain: BASE_SEPOLIA,
        transport: custom(provider),
      });
      
      this.userAddress = privyWallet.address as `0x${string}`;
      
      console.log('Contract service initialized for:', this.userAddress);
      return true;
    } catch (error) {
      console.error('Failed to initialize contract service:', error);
      return false;
    }
  }

  // Generic read contract function
  async readContract(contractKey: keyof typeof CONTRACTS, functionName: string, args: any[] = []) {
    try {
      const contract = CONTRACTS[contractKey];
      const result = await publicClient.readContract({
        address: contract.address,
        abi: contract.abi as any,
        functionName,
        args,
      });
      return result;
    } catch (error) {
      console.error(`Error reading ${contractKey}.${functionName}:`, error);
      throw error;
    }
  }

  // Check if wallet is properly connected
  async ensureConnection() {
    if (!this.walletClient || !this.userAddress) {
      throw new Error('Wallet not initialized. Please refresh and try again.');
    }

    try {
      // Test connection by getting the chain ID
      const chainId = await this.walletClient.getChainId();
      if (chainId !== BASE_SEPOLIA.id) {
        throw new Error(`Wrong network. Please switch to Base Sepolia (Chain ID: ${BASE_SEPOLIA.id})`);
      }
      return true;
    } catch (error) {
      console.error('Connection check failed:', error);
      throw new Error('Wallet connection lost. Please refresh and reconnect.');
    }
  }

  // Generic write contract function
  async writeContract(contractKey: keyof typeof CONTRACTS, functionName: string, args: any[] = []) {
    // Ensure connection before any write operation
    await this.ensureConnection();

    try {
      const contract = CONTRACTS[contractKey];
      console.log(`Writing to ${contractKey}.${functionName} with args:`, args);
      
      const hash = await this.walletClient.writeContract({
        address: contract.address,
        abi: contract.abi as any,
        functionName,
        args,
      });
      
      console.log(`Transaction hash: ${hash}`);
      return hash;
    } catch (error) {
      console.error(`Error writing ${contractKey}.${functionName}:`, error);
      throw error;
    }
  }

  // USDC Functions
  async getUSDCBalance(address: `0x${string}`) {
    const balance = await this.readContract('usdc', 'balanceOf', [address]);
    return Number(formatUnits(balance as unknown as bigint, USDC_DECIMALS));
  }

  async approveUSDC(spender: `0x${string}`, amount: number) {
    const amountWei = parseUnits(amount.toString(), USDC_DECIMALS);
    return this.writeContract('usdc', 'approve', [spender, amountWei]);
  }

  async getUSDCAllowance(owner: `0x${string}`, spender: `0x${string}`) {
    const allowance = await this.readContract('usdc', 'allowance', [owner, spender]);
    return Number(formatUnits(allowance as unknown as bigint, USDC_DECIMALS));
  }

  // Vault Functions
  async getVaultAPY() {
    const apy = await this.readContract('vault', 'previewAPY', []);
    return Number(formatUnits(apy as unknown as bigint, 4)); // APY with 4 decimals (basis points)
  }

  async getVaultValuePerShare() {
    const value = await this.readContract('vault', 'vaultValuePerShare', []);
    return Number(formatUnits(value as unknown as bigint, USDC_DECIMALS));
  }

  async getVaultBalance(address: `0x${string}`) {
    const balance = await this.readContract('vault', 'balanceOf', [address]);
    return Number(formatUnits(balance as unknown as bigint, VAULT_DECIMALS));
  }

  async getVaultTotalAssets() {
    const total = await this.readContract('vault', 'totalAssets', []);
    return Number(formatUnits(total as unknown as bigint, USDC_DECIMALS));
  }

  async getVaultTotalSupply() {
    const supply = await this.readContract('vault', 'totalSupply', []);
    return Number(formatUnits(supply as unknown as bigint, VAULT_DECIMALS));
  }

  async depositToVault(amount: number, receiver: `0x${string}`) {
    const amountWei = parseUnits(amount.toString(), USDC_DECIMALS);
    return this.writeContract('vault', 'deposit', [amountWei, receiver]);
  }

  async withdrawFromVault(shares: number, receiver: `0x${string}`, owner: `0x${string}`) {
    const sharesWei = parseUnits(shares.toString(), VAULT_DECIMALS);
    return this.writeContract('vault', 'redeem', [sharesWei, receiver, owner]);
  }

  // Loan NFT Functions
  async getLoanData(loanId: number) {
    try {
      const loanData = await this.readContract('loanNFT', 'getLoan', [BigInt(loanId)]) as any;
      
      return {
        borrower: loanData.borrower,
        principal: Number(formatUnits(loanData.principal as unknown as bigint, USDC_DECIMALS)),
        interestRate: Number(formatUnits(loanData.interestRate as unknown as bigint, 4)), // Basis points
        termLength: Number(loanData.termLength),
        startTime: Number(loanData.startTime),
        amountPaid: Number(formatUnits(loanData.amountPaid as unknown as bigint, USDC_DECIMALS)),
        isActive: loanData.isActive,
      };
    } catch (error) {
      console.error('Error getting loan data:', error);
      return null;
    }
  }

  async mintLoan(borrower: `0x${string}`, principal: number, interestRate: number, termLength: number) {
    const principalWei = parseUnits(principal.toString(), USDC_DECIMALS);
    const rateWei = parseUnits(interestRate.toString(), 4); // Basis points
    return this.writeContract('loanNFT', 'mintLoan', [borrower, principalWei, rateWei, BigInt(termLength)]);
  }

  async getTotalLoans() {
    try {
      const total = await this.readContract('loanNFT', 'totalSupply', []);
      return Number(total);
    } catch (error) {
      console.error('Error getting total loans:', error);
      return 0;
    }
  }

  // Collector Functions
  async recordPayment(loanId: number, amount: number) {
    const amountWei = parseUnits(amount.toString(), USDC_DECIMALS);
    return this.writeContract('collector', 'recordPayment', [BigInt(loanId), amountWei]);
  }

  async getTotalRepaid(loanId: number) {
    const total = await this.readContract('collector', 'totalRepaid', [BigInt(loanId)]);
    return Number(formatUnits(total as unknown as bigint, USDC_DECIMALS));
  }

  async getFeeBps() {
    const fee = await this.readContract('collector', 'feeBps', []);
    return Number(fee);
  }

  // Utility Functions
  calculateRemainingBalance(loan: any) {
    if (!loan) return 0;
    const totalOwed = loan.principal * (1 + loan.interestRate / 10000);
    return Math.max(0, totalOwed - loan.amountPaid);
  }

  calculateLoanProgress(loan: any) {
    if (!loan) return 0;
    const totalOwed = loan.principal * (1 + loan.interestRate / 10000);
    return totalOwed > 0 ? (loan.amountPaid / totalOwed) * 100 : 0;
  }

  // Format helpers
  formatUSDC(amount: bigint) {
    return Number(formatUnits(amount as unknown as bigint, USDC_DECIMALS));
  }

  formatVaultShares(shares: bigint) {
    return Number(formatUnits(shares as unknown as bigint, VAULT_DECIMALS));
  }

  parseUSDC(amount: number) {
    return parseUnits(amount.toString(), USDC_DECIMALS);
  }

  parseVaultShares(shares: number) {
    return parseUnits(shares.toString(), VAULT_DECIMALS);
  }
}

// Singleton instance
export const contractService = new ContractService();

import { useState, useCallback } from 'react';
import { readContract, writeContract, toUSDC, formatUSDC, toVaultShares, formatVaultShares, getCurrentAddress } from '../lib/viem';
import { ADDRESSES } from '../lib/addresses';
import vaultABI from '../src/abi/ConvexoVault.json';
import usdcABI from '../src/abi/ERC20.json';

export function useVault() {
  const [isLoading, setIsLoading] = useState(false);

  // Read Functions
  const getShareBalance = useCallback(async (address: `0x${string}`) => {
    const balance = await readContract(ADDRESSES.ConvexoVault, vaultABI, 'balanceOf', [address]);
    return Number(formatVaultShares(balance as bigint));
  }, []);

  const convertToAssets = useCallback(async (shares: number) => {
    const sharesBigInt = toVaultShares(shares);
    const assets = await readContract(ADDRESSES.ConvexoVault, vaultABI, 'convertToAssets', [sharesBigInt]);
    return Number(formatUSDC(assets as bigint));
  }, []);

  const getVaultValuePerShare = useCallback(async () => {
    const value = await readContract(ADDRESSES.ConvexoVault, vaultABI, 'vaultValuePerShare', []);
    return Number(formatUSDC(value as bigint));
  }, []);

  const getPreviewAPY = useCallback(async () => {
    const apy = await readContract(ADDRESSES.ConvexoVault, vaultABI, 'previewAPY', []);
    return Number(apy) / 100; // Convert from basis points to percentage
  }, []);

  const getTotalAssets = useCallback(async () => {
    const total = await readContract(ADDRESSES.ConvexoVault, vaultABI, 'totalAssets', []);
    return Number(formatUSDC(total as bigint));
  }, []);

  const getTotalSupply = useCallback(async () => {
    const supply = await readContract(ADDRESSES.ConvexoVault, vaultABI, 'totalSupply', []);
    return Number(formatVaultShares(supply as bigint));
  }, []);

  const getUSDCBalance = useCallback(async (address: `0x${string}`) => {
    const balance = await readContract(ADDRESSES.USDC, usdcABI, 'balanceOf', [address]);
    return Number(formatUSDC(balance as bigint));
  }, []);

  const getUSDCAllowance = useCallback(async (owner: `0x${string}`, spender: `0x${string}`) => {
    const allowance = await readContract(ADDRESSES.USDC, usdcABI, 'allowance', [owner, spender]);
    return Number(formatUSDC(allowance as bigint));
  }, []);

  // Write Functions
  const approveUSDC = useCallback(async (spender: `0x${string}`, amount: number) => {
    setIsLoading(true);
    try {
      const amountBigInt = toUSDC(amount);
      const hash = await writeContract(ADDRESSES.USDC, usdcABI, 'approve', [spender, amountBigInt]);
      return hash;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deposit = useCallback(async (assets: number, receiver: `0x${string}`) => {
    setIsLoading(true);
    try {
      const assetsBigInt = toUSDC(assets);
      const hash = await writeContract(ADDRESSES.ConvexoVault, vaultABI, 'deposit', [assetsBigInt, receiver]);
      return hash;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const withdraw = useCallback(async (assets: number, receiver: `0x${string}`, owner: `0x${string}`) => {
    setIsLoading(true);
    try {
      const assetsBigInt = toUSDC(assets);
      const hash = await writeContract(ADDRESSES.ConvexoVault, vaultABI, 'withdraw', [assetsBigInt, receiver, owner]);
      return hash;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const redeem = useCallback(async (shares: number, receiver: `0x${string}`, owner: `0x${string}`) => {
    setIsLoading(true);
    try {
      const sharesBigInt = toVaultShares(shares);
      const hash = await writeContract(ADDRESSES.ConvexoVault, vaultABI, 'redeem', [sharesBigInt, receiver, owner]);
      return hash;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const investInLoan = useCallback(async (borrower: `0x${string}`, amount: number, rateBps: number, maturity: number) => {
    setIsLoading(true);
    try {
      const amountBigInt = toUSDC(amount);
      const hash = await writeContract(ADDRESSES.ConvexoVault, vaultABI, 'investInLoan', [
        borrower,
        amountBigInt,
        BigInt(rateBps),
        BigInt(maturity)
      ]);
      return hash;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Deposit workflow (approve + deposit)
  const depositWorkflow = useCallback(async (amount: number) => {
    const userAddress = getCurrentAddress();
    
    // Step 1: Check allowance
    const allowance = await getUSDCAllowance(userAddress, ADDRESSES.ConvexoVault);
    
    if (allowance < amount) {
      // Step 2: Approve USDC
      console.log('Approving USDC...');
      await approveUSDC(ADDRESSES.ConvexoVault, amount);
      
      // Wait a bit for approval to be mined
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Step 3: Deposit
    console.log('Depositing to vault...');
    return await deposit(amount, userAddress);
  }, [approveUSDC, deposit, getUSDCAllowance]);

  return {
    // Read functions
    getShareBalance,
    convertToAssets,
    getVaultValuePerShare,
    getPreviewAPY,
    getTotalAssets,
    getTotalSupply,
    getUSDCBalance,
    getUSDCAllowance,
    
    // Write functions
    approveUSDC,
    deposit,
    withdraw,
    redeem,
    investInLoan,
    depositWorkflow,
    
    // State
    isLoading,
  };
}
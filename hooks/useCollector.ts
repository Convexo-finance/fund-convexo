import { useState, useCallback } from 'react';
import { readContract, writeContract, toUSDC, formatUSDC } from '../lib/viem';
import { ADDRESSES } from '../lib/addresses';
import collectorABI from '../src/abi/Collector.json';
import usdcABI from '../src/abi/ERC20.json';

export function useCollector() {
  const [isLoading, setIsLoading] = useState(false);

  // Read Functions
  const getTotalRepaid = useCallback(async (loanId: number) => {
    try {
      const result = await readContract(ADDRESSES.Collector, collectorABI, 'totalRepaid', [BigInt(loanId)]);
      const total = Array.isArray(result) ? result[0] : result;
      return Number(formatUSDC(total as bigint));
    } catch (error) {
      console.error('Error getting total repaid:', error);
      return 0;
    }
  }, []);

  const getFeeBps = useCallback(async () => {
    try {
      const result = await readContract(ADDRESSES.Collector, collectorABI, 'feeBps', []);
      const fee = Array.isArray(result) ? result[0] : result;
      return Number(fee);
    } catch (error) {
      console.error('Error getting fee basis points:', error);
      return 0;
    }
  }, []);

  const getFeeRecipient = useCallback(async () => {
    try {
      const result = await readContract(ADDRESSES.Collector, collectorABI, 'feeRecipient', []);
      const recipient = Array.isArray(result) ? result[0] : result;
      return recipient as string;
    } catch (error) {
      console.error('Error getting fee recipient:', error);
      return '';
    }
  }, []);

  const getUSDCBalance = useCallback(async (address: `0x${string}`) => {
    const result = await readContract(ADDRESSES.USDC, usdcABI, 'balanceOf', [address]);
    const balance = Array.isArray(result) ? result[0] : result;
    return Number(formatUSDC(balance as bigint));
  }, []);

  const getUSDCAllowance = useCallback(async (owner: `0x${string}`, spender: `0x${string}`) => {
    const result = await readContract(ADDRESSES.USDC, usdcABI, 'allowance', [owner, spender]);
    const allowance = Array.isArray(result) ? result[0] : result;
    return Number(formatUSDC(allowance as bigint));
  }, []);

  // Write Functions
  const approveUSDC = useCallback(async (amount: number) => {
    setIsLoading(true);
    try {
      const amountBigInt = toUSDC(amount);
      const hash = await writeContract(ADDRESSES.USDC, usdcABI, 'approve', [ADDRESSES.Collector, amountBigInt]);
      return hash;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const recordPayment = useCallback(async (loanId: number, amount: number) => {
    setIsLoading(true);
    try {
      const amountBigInt = toUSDC(amount);
      const hash = await writeContract(ADDRESSES.Collector, collectorABI, 'recordPayment', [BigInt(loanId), amountBigInt]);
      return hash;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Payment workflow (approve + record payment)
  const makePayment = useCallback(async (loanId: number, amount: number, userAddress: `0x${string}`) => {
    // Step 1: Check allowance
    const allowance = await getUSDCAllowance(userAddress, ADDRESSES.Collector);
    
    if (allowance < amount) {
      // Step 2: Approve USDC
      console.log('Approving USDC for Collector...');
      await approveUSDC(amount);
      
      // Wait for approval to be mined
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Step 3: Record payment
    console.log('Recording payment...');
    return await recordPayment(loanId, amount);
  }, [approveUSDC, recordPayment, getUSDCAllowance]);

  // Calculate payment breakdown (principal + interest - fees)
  const calculatePaymentBreakdown = useCallback(async (amount: number) => {
    const feeBps = await getFeeBps();
    const fee = amount * (feeBps / 10000);
    const netAmount = amount - fee;
    
    return {
      grossAmount: amount,
      fee,
      netAmount,
      feeBps,
    };
  }, [getFeeBps]);

  return {
    // Read functions
    getTotalRepaid,
    getFeeBps,
    getFeeRecipient,
    getUSDCBalance,
    getUSDCAllowance,
    
    // Write functions
    approveUSDC,
    recordPayment,
    makePayment,
    
    // Utility functions
    calculatePaymentBreakdown,
    
    // State
    isLoading,
  };
}
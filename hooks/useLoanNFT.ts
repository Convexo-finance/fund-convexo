import { useState, useCallback } from 'react';
import { readContract, writeContract, formatUSDC } from '../lib/viem';
import { ADDRESSES } from '../lib/addresses';
import loanNFTABI from '../src/abi/LoanNoteNFT.json';

export interface LoanData {
  borrower: string;
  principal: number;
  interestRate: number;
  termLength: number;
  startTime: number;
  amountPaid: number;
  isActive: boolean;
}

export function useLoanNFT() {
  const [isLoading, setIsLoading] = useState(false);

  // Read Functions
  const getLoan = useCallback(async (loanId: number): Promise<LoanData | null> => {
    try {
      const loanData = await readContract(ADDRESSES.LoanNoteNFT, loanNFTABI, 'getLoan', [BigInt(loanId)]) as any;
      
      return {
        borrower: loanData.borrower,
        principal: Number(formatUSDC(loanData.principal)),
        interestRate: Number(loanData.interestRate), // Already in basis points
        termLength: Number(loanData.termLength),
        startTime: Number(loanData.startTime),
        amountPaid: Number(formatUSDC(loanData.amountPaid)),
        isActive: loanData.isActive,
      };
    } catch (error) {
      console.error('Error getting loan data:', error);
      return null;
    }
  }, []);

  const getTotalSupply = useCallback(async () => {
    try {
      const result = await readContract(ADDRESSES.LoanNoteNFT, loanNFTABI, 'totalSupply', []);
      const total = Array.isArray(result) ? result[0] : result;
      return Number(total);
    } catch (error) {
      console.error('Error getting total loans:', error);
      return 0;
    }
  }, []);

  const ownerOf = useCallback(async (loanId: number) => {
    try {
      const result = await readContract(ADDRESSES.LoanNoteNFT, loanNFTABI, 'ownerOf', [BigInt(loanId)]);
      const owner = Array.isArray(result) ? result[0] : result;
      return owner as string;
    } catch (error) {
      console.error('Error getting loan owner:', error);
      return null;
    }
  }, []);

  const balanceOf = useCallback(async (address: `0x${string}`) => {
    try {
      const result = await readContract(ADDRESSES.LoanNoteNFT, loanNFTABI, 'balanceOf', [address]);
      const balance = Array.isArray(result) ? result[0] : result;
      return Number(balance);
    } catch (error) {
      console.error('Error getting NFT balance:', error);
      return 0;
    }
  }, []);

  // Write Functions (Vault Owner only)
  const markRepaid = useCallback(async (loanId: number) => {
    setIsLoading(true);
    try {
      const hash = await writeContract(ADDRESSES.LoanNoteNFT, loanNFTABI, 'markRepaid', [BigInt(loanId)]);
      return hash;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const markDefault = useCallback(async (loanId: number) => {
    setIsLoading(true);
    try {
      const hash = await writeContract(ADDRESSES.LoanNoteNFT, loanNFTABI, 'markDefault', [BigInt(loanId)]);
      return hash;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Utility Functions
  const calculateRemainingDebt = useCallback((loan: LoanData, totalRepaid: number) => {
    const totalOwed = loan.principal + (loan.principal * loan.interestRate / 10000);
    return Math.max(0, totalOwed - totalRepaid);
  }, []);

  const calculateLoanProgress = useCallback((loan: LoanData, totalRepaid: number) => {
    const totalOwed = loan.principal + (loan.principal * loan.interestRate / 10000);
    return totalOwed > 0 ? (totalRepaid / totalOwed) * 100 : 0;
  }, []);

  const isLoanOverdue = useCallback((loan: LoanData) => {
    const currentTime = Math.floor(Date.now() / 1000);
    const loanEndTime = loan.startTime + loan.termLength;
    return currentTime > loanEndTime && loan.isActive;
  }, []);

  // Get loans for a specific borrower
  const getBorrowerLoans = useCallback(async (borrowerAddress: `0x${string}`) => {
    try {
      const totalLoans = await getTotalSupply();
      const borrowerLoans: Array<LoanData & { id: number }> = [];
      
      // Check each loan to see if borrower matches
      for (let i = 1; i <= totalLoans; i++) {
        try {
          const loan = await getLoan(i);
          if (loan && loan.borrower.toLowerCase() === borrowerAddress.toLowerCase()) {
            borrowerLoans.push({ ...loan, id: i });
          }
        } catch (error) {
          // Skip loans that don't exist or can't be read
          continue;
        }
      }
      
      return borrowerLoans;
    } catch (error) {
      console.error('Error getting borrower loans:', error);
      return [];
    }
  }, [getLoan, getTotalSupply]);

  return {
    // Read functions
    getLoan,
    getTotalSupply,
    ownerOf,
    balanceOf,
    getBorrowerLoans,
    
    // Write functions
    markRepaid,
    markDefault,
    
    // Utility functions
    calculateRemainingDebt,
    calculateLoanProgress,
    isLoanOverdue,
    
    // State
    isLoading,
  };
}
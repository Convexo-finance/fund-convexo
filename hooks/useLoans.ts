import { useReadContract, useWriteContract, useWaitForTransaction } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { CONTRACTS, USDC_DECIMALS } from '../config/contracts';

export interface LoanData {
  borrower: string;
  principal: bigint;
  interestRate: bigint;
  termLength: bigint;
  startTime: bigint;
  amountPaid: bigint;
  isActive: boolean;
}

// Read loan status by ID
export function useLoanStatus(loanId: number) {
  const { data, isError, isLoading, refetch } = useReadContract({
    address: CONTRACTS.loanNFT.address,
    abi: CONTRACTS.loanNFT.abi,
    functionName: 'getLoan',
    args: [BigInt(loanId)],
    enabled: loanId > 0,
  });

  const loanData = data as LoanData | undefined;

  return {
    loan: loanData ? {
      borrower: loanData.borrower,
      principal: Number(formatUnits(loanData.principal, USDC_DECIMALS)),
      interestRate: Number(formatUnits(loanData.interestRate, 4)), // Assuming 4 decimals for rate
      termLength: Number(loanData.termLength),
      startTime: Number(loanData.startTime),
      amountPaid: Number(formatUnits(loanData.amountPaid, USDC_DECIMALS)),
      isActive: loanData.isActive,
    } : null,
    isLoading,
    isError,
    refetch,
  };
}

// Read USDC allowance for collector
export function useUSDCAllowanceForCollector(userAddress?: `0x${string}`) {
  const { data, isError, isLoading } = useReadContract({
    address: CONTRACTS.usdc.address,
    abi: CONTRACTS.usdc.abi,
    functionName: 'allowance',
    args: userAddress ? [userAddress, CONTRACTS.collector.address] : undefined,
    enabled: !!userAddress,
  });

  return {
    allowance: data ? Number(formatUnits(data as bigint, USDC_DECIMALS)) : 0,
    isLoading,
    isError,
  };
}

// Read user's USDC balance (reusing from vault hooks for consistency)
export function useUSDCBalance(userAddress?: `0x${string}`) {
  const { data, isError, isLoading } = useReadContract({
    address: CONTRACTS.usdc.address,
    abi: CONTRACTS.usdc.abi,
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
    enabled: !!userAddress,
  });

  return {
    balance: data ? Number(formatUnits(data as bigint, USDC_DECIMALS)) : 0,
    isLoading,
    isError,
  };
}

// Hook for repaying loans
export function useRepayLoan() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransaction({
    hash,
  });

  const approveUSDC = (amount: number) => {
    const amountBigInt = parseUnits(amount.toString(), USDC_DECIMALS);
    writeContract({
      address: CONTRACTS.usdc.address,
      abi: CONTRACTS.usdc.abi,
      functionName: 'approve',
      args: [CONTRACTS.collector.address, amountBigInt],
    });
  };

  const repayLoan = (loanId: number, amount: number) => {
    const amountBigInt = parseUnits(amount.toString(), USDC_DECIMALS);
    writeContract({
      address: CONTRACTS.collector.address,
      abi: CONTRACTS.collector.abi,
      functionName: 'recordPayment',
      args: [BigInt(loanId), amountBigInt],
    });
  };

  return {
    approveUSDC,
    repayLoan,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

// Helper function to calculate remaining loan balance
export function calculateRemainingBalance(loan: ReturnType<typeof useLoanStatus>['loan']) {
  if (!loan) return 0;
  
  const totalOwed = loan.principal * (1 + loan.interestRate / 10000); // Assuming rate is in basis points
  return Math.max(0, totalOwed - loan.amountPaid);
}

// Helper function to calculate loan progress percentage
export function calculateLoanProgress(loan: ReturnType<typeof useLoanStatus>['loan']) {
  if (!loan) return 0;
  
  const totalOwed = loan.principal * (1 + loan.interestRate / 10000);
  return totalOwed > 0 ? (loan.amountPaid / totalOwed) * 100 : 0;
}

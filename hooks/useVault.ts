import { useReadContract, useWriteContract, useWaitForTransaction } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { CONTRACTS, USDC_DECIMALS } from '../config/contracts';

// Read vault APY
export function useVaultAPY() {
  const { data, isError, isLoading } = useReadContract({
    address: CONTRACTS.vault.address,
    abi: CONTRACTS.vault.abi,
    functionName: 'previewAPY',
  });

  return {
    apy: data ? Number(formatUnits(data as bigint, 4)) : 0, // APY typically has 4 decimals (e.g., 1000 = 10%)
    isLoading,
    isError,
  };
}

// Read vault value per share
export function useVaultValuePerShare() {
  const { data, isError, isLoading } = useReadContract({
    address: CONTRACTS.vault.address,
    abi: CONTRACTS.vault.abi,
    functionName: 'vaultValuePerShare',
  });

  return {
    valuePerShare: data ? Number(formatUnits(data as bigint, USDC_DECIMALS)) : 0,
    isLoading,
    isError,
  };
}

// Read user's vault balance (CVXS shares)
export function useVaultBalance(userAddress?: `0x${string}`) {
  const { data, isError, isLoading } = useReadContract({
    address: CONTRACTS.vault.address,
    abi: CONTRACTS.vault.abi,
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
    enabled: !!userAddress,
  });

  return {
    balance: data ? Number(formatUnits(data as bigint, 18)) : 0, // Vault shares typically 18 decimals
    isLoading,
    isError,
  };
}

// Read user's USDC balance
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

// Read USDC allowance for vault
export function useUSDCAllowance(userAddress?: `0x${string}`) {
  const { data, isError, isLoading } = useReadContract({
    address: CONTRACTS.usdc.address,
    abi: CONTRACTS.usdc.abi,
    functionName: 'allowance',
    args: userAddress ? [userAddress, CONTRACTS.vault.address] : undefined,
    enabled: !!userAddress,
  });

  return {
    allowance: data ? Number(formatUnits(data as bigint, USDC_DECIMALS)) : 0,
    isLoading,
    isError,
  };
}

// Hook for depositing into vault
export function useDeposit() {
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
      args: [CONTRACTS.vault.address, amountBigInt],
    });
  };

  const deposit = (amount: number, receiver: `0x${string}`) => {
    const amountBigInt = parseUnits(amount.toString(), USDC_DECIMALS);
    writeContract({
      address: CONTRACTS.vault.address,
      abi: CONTRACTS.vault.abi,
      functionName: 'deposit',
      args: [amountBigInt, receiver],
    });
  };

  return {
    approveUSDC,
    deposit,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

// Hook for withdrawing from vault
export function useWithdraw() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransaction({
    hash,
  });

  const withdraw = (shares: number, receiver: `0x${string}`) => {
    const sharesBigInt = parseUnits(shares.toString(), 18); // Vault shares are 18 decimals
    writeContract({
      address: CONTRACTS.vault.address,
      abi: CONTRACTS.vault.abi,
      functionName: 'redeem',
      args: [sharesBigInt, receiver, receiver],
    });
  };

  return {
    withdraw,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

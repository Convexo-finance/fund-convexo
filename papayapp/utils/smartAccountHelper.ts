import { optimism } from 'viem/chains';

/**
 * Helper function to send a transaction via the smart account client
 * This works around TypeScript issues with the permissionless library
 */
export async function sendSmartAccountTransaction(
  client: any, 
  params: { 
    to: `0x${string}`, 
    value: bigint, 
    data: `0x${string}` 
  }
) {
  if (!client) {
    throw new Error("Smart account client not available");
  }
  
  // Explicitly pass chain ID to avoid chain property access issues
  return client.sendTransaction({
    ...params,
    chainId: optimism.id
  });
} 
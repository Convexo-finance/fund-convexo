import type { NextApiRequest, NextApiResponse } from 'next';

// Simple in-memory store for demo - in production use a database
const linkedWallets = new Map<string, string>(); // address -> userId

type ValidationResponse = {
  isValid: boolean;
  error?: string;
  conflictType?: 'duplicate_external' | 'already_linked';
  existingUserId?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ValidationResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      isValid: false, 
      error: 'Method not allowed' 
    });
  }

  const { walletAddress, currentUserId } = req.body;

  if (!walletAddress) {
    return res.status(400).json({ 
      isValid: false, 
      error: 'Wallet address required' 
    });
  }

  const normalizedAddress = walletAddress.toLowerCase();
  const existingUserId = linkedWallets.get(normalizedAddress);

  // Check if wallet is already linked to a different user
  if (existingUserId && existingUserId !== currentUserId) {
    return res.json({
      isValid: false,
      error: 'This wallet is already linked to another account',
      conflictType: 'duplicate_external',
      existingUserId
    });
  }

  // If validation passes, record the wallet-user association
  if (currentUserId) {
    linkedWallets.set(normalizedAddress, currentUserId);
  }

  return res.json({
    isValid: true
  });
}
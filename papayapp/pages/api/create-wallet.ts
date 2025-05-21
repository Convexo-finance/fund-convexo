import type { NextApiRequest, NextApiResponse } from 'next';
import { generateMockWalletAddress } from '@/lib/walletService';

type ResponseData = {
  success: boolean;
  data?: {
    userId: string;
    walletAddress: string;
  };
  error?: string;
}

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse<ResponseData>
) {
  // Set JSON content type
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false,
      error: 'Method not allowed' 
    });
  }

  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false,
        error: 'User ID is required' 
      });
    }
    
    // Generate a stable mock address based on the userId for demo purposes
    const mockAddress = generateMockWalletAddress(userId);
    
    return res.status(200).json({
      success: true,
      data: {
        userId,
        walletAddress: mockAddress
      }
    });
  } catch (error) {
    console.error('Error creating wallet:', error);
    
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create wallet'
    });
  }
} 
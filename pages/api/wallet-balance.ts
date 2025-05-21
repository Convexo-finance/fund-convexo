import type { NextApiRequest, NextApiResponse } from 'next';
import { getMockBalances } from '@/lib/walletService';
import { TokenBalance } from '@/types/index';

type ResponseData = {
  success: boolean;
  data?: {
    address: string;
    balances: TokenBalance;
  };
  error?: string;
}

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse<ResponseData>
) {
  // Set JSON content type
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ 
      success: false,
      error: 'Method not allowed' 
    });
  }

  try {
    // Get the wallet address from the request
    const { address } = req.method === 'GET' ? req.query : req.body;
    
    if (!address || typeof address !== 'string') {
      return res.status(400).json({ 
        success: false,
        error: 'Wallet address is required' 
      });
    }
    
    // Get mock balances
    const balances = getMockBalances(address);
    
    return res.status(200).json({
      success: true,
      data: {
        address,
        balances
      }
    });
  } catch (error) {
    console.error('Error getting wallet balances:', error);
    
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get wallet balances'
    });
  }
} 
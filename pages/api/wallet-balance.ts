import type { NextApiRequest, NextApiResponse } from 'next';
import { walletService } from '../../services/walletService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { address } = req.query;

  if (!address || typeof address !== 'string') {
    return res.status(400).json({ error: 'Address required' });
  }

  try {
    const balances = await walletService.getTokenBalances(address);
    res.json({ success: true, data: { address, balances } });
  } catch (error) {
    console.error('Balance fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch balances' });
  }
}
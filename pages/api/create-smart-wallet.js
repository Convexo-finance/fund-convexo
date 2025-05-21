export default async function handler(req, res) {
  // Set JSON content type
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false,
      error: 'Method not allowed' 
    });
  }

  // Return a message about using embedded wallets instead
  return res.status(200).json({
    success: true,
    message: "This endpoint is deprecated. ETH Cali Wallet now uses Privy's embedded wallets directly in the browser.",
    documentation: "Please refer to the updated documentation for wallet integration."
  });
} 
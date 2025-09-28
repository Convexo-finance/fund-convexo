import React, { useState, useEffect } from 'react';
import { useWallets } from '@privy-io/react-auth';
import Button from '../wallet/shared/Button';
import { contractService } from '../../services/contractService';

interface LoanApprovalProps {
  contractsInitialized: boolean;
}

interface LoanRequest {
  id: string;
  borrower: string;
  amount: number;
  purpose: string;
  termMonths: number;
  description: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  financialScore?: number;
}

const LoanApprovals: React.FC<LoanApprovalProps> = ({ contractsInitialized }) => {
  const { wallets } = useWallets();
  const [pendingRequests, setPendingRequests] = useState<LoanRequest[]>([
    {
      id: '1',
      borrower: '0x1234...5678',
      amount: 50000,
      purpose: 'working_capital',
      termMonths: 12,
      description: 'Expanding our agrotech operations to serve 200+ new farmers in Valle del Cauca',
      submittedAt: new Date().toISOString(),
      status: 'pending',
      financialScore: 85,
    },
    {
      id: '2',
      borrower: '0x2345...6789',
      amount: 25000,
      purpose: 'equipment',
      termMonths: 18,
      description: 'Purchasing new IoT sensors and data analytics equipment for precision agriculture',
      submittedAt: new Date().toISOString(),
      status: 'pending',
      financialScore: 78,
    },
    {
      id: '3',
      borrower: '0x3456...7890',
      amount: 100000,
      purpose: 'expansion',
      termMonths: 24,
      description: 'International expansion to Ecuador and Peru markets',
      submittedAt: new Date().toISOString(),
      status: 'pending',
      financialScore: 92,
    },
  ]);
  
  const [selectedRequest, setSelectedRequest] = useState<LoanRequest | null>(null);
  const [mintingLoan, setMintingLoan] = useState(false);
  const [txStatus, setTxStatus] = useState('');

  const embeddedWallet = wallets.find(w => w.walletClientType === 'privy');

  const handleApproveLoan = async (request: LoanRequest) => {
    if (!contractsInitialized || !embeddedWallet) return;

    setMintingLoan(true);
    setSelectedRequest(request);
    
    try {
      setTxStatus('Minting Loan NFT...');
      
      // Calculate interest rate based on financial score
      const baseRate = 1500; // 15% in basis points
      const scoreAdjustment = (100 - request.financialScore!) * 5; // Higher score = lower rate
      const interestRate = Math.max(800, baseRate + scoreAdjustment); // Min 8%, max varies
      
      // Convert term to seconds (approximate)
      const termSeconds = request.termMonths * 30 * 24 * 60 * 60;
      
      // Mint the loan NFT
      const hash = await contractService.mintLoan(
        request.borrower as `0x${string}`,
        request.amount,
        interestRate,
        termSeconds
      );
      
      setTxStatus(`✅ Loan NFT minted! Tx: ${hash}`);
      
      // Update request status
      setPendingRequests(prev => 
        prev.map(req => 
          req.id === request.id 
            ? { ...req, status: 'approved' as const }
            : req
        )
      );
      
    } catch (error: any) {
      setTxStatus(`❌ Error: ${error.message}`);
    } finally {
      setMintingLoan(false);
    }
  };

  const handleRejectLoan = (request: LoanRequest) => {
    setPendingRequests(prev => 
      prev.map(req => 
        req.id === request.id 
          ? { ...req, status: 'rejected' as const }
          : req
      )
    );
    setTxStatus(`❌ Loan request ${request.id} rejected`);
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600 dark:text-green-400';
    if (score >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Poor';
  };

  if (!contractsInitialized) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-yellow-600 dark:text-yellow-400 text-2xl">⏳</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Initializing Admin Tools
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Setting up loan approval system...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Loan Approvals</h2>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {pendingRequests.filter(r => r.status === 'pending').length} pending requests
        </div>
      </div>

      {/* Pending Loan Requests */}
      <div className="space-y-4">
        {pendingRequests.filter(r => r.status === 'pending').map((request) => (
          <div key={request.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Loan Request #{request.id}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Submitted: {new Date(request.submittedAt).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${getScoreColor(request.financialScore!)}`}>
                  {request.financialScore}/100
                </div>
                <div className={`text-sm ${getScoreColor(request.financialScore!)}`}>
                  {getScoreLabel(request.financialScore!)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">Borrower</p>
                <p className="font-mono text-xs text-gray-900 dark:text-white break-all">
                  {request.borrower}
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">Amount</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  ${request.amount.toLocaleString()}
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">Term</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {request.termMonths} months
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">Purpose</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                  {request.purpose.replace('_', ' ')}
                </p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description:</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {request.description}
              </p>
            </div>

            {/* Interest Rate Calculation */}
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-blue-800 dark:text-blue-200 text-sm">
                <strong>Calculated Interest Rate:</strong> {
                  Math.max(8, 15 + (100 - request.financialScore!) * 0.05).toFixed(1)
                }% APR (based on financial score)
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex space-x-3">
                <Button
                  onClick={() => handleApproveLoan(request)}
                  variant="primary"
                  disabled={mintingLoan}
                  className="bg-green-600 hover:bg-green-700 border-green-600"
                >
                  {mintingLoan && selectedRequest?.id === request.id ? 'Minting...' : '✅ Approve & Mint NFT'}
                </Button>
                <Button
                  onClick={() => handleRejectLoan(request)}
                  variant="outline"
                  disabled={mintingLoan}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  ❌ Reject
                </Button>
              </div>
              <Button
                variant="outline"
                size="small"
                onClick={() => window.open(`https://sepolia.basescan.org/address/${request.borrower}`, '_blank')}
              >
                🔍 View Borrower
              </Button>
            </div>
          </div>
        ))}

        {pendingRequests.filter(r => r.status === 'pending').length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-green-600 dark:text-green-400 text-2xl">✅</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              All Caught Up!
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              No pending loan requests to review. New requests will appear here.
            </p>
          </div>
        )}
      </div>

      {/* Transaction Status */}
      {txStatus && (
        <div className={`rounded-lg p-4 border ${
          txStatus.includes('✅') 
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
            : txStatus.includes('❌')
            ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
            : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
        }`}>
          <div className="flex items-center justify-between">
            <p className={`text-sm font-medium ${
              txStatus.includes('✅') 
                ? 'text-green-800 dark:text-green-200'
                : txStatus.includes('❌')
                ? 'text-red-800 dark:text-red-200'
                : 'text-blue-800 dark:text-blue-200'
            }`}>
              {txStatus}
            </p>
            {txStatus.includes('Tx:') && (
              <Button
                onClick={() => {
                  const hash = txStatus.split('Tx: ')[1];
                  window.open(`https://sepolia.basescan.org/tx/${hash}`, '_blank');
                }}
                variant="outline"
                size="small"
              >
                View Transaction
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Approval Guidelines */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
        <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
          📋 Loan Approval Guidelines
        </h4>
        <div className="text-amber-800 dark:text-amber-200 text-sm space-y-1">
          <p>• <strong>Score ≥85:</strong> Auto-approve with premium rates</p>
          <p>• <strong>Score 70-84:</strong> Standard approval with market rates</p>
          <p>• <strong>Score 60-69:</strong> Conditional approval with higher rates</p>
          <p>• <strong>Score &lt;60:</strong> Recommend rejection or additional collateral</p>
          <p>• <strong>Verify:</strong> Borrower identity and business legitimacy</p>
          <p>• <strong>Check:</strong> Loan purpose aligns with business model</p>
        </div>
      </div>

      {/* Recent Approvals */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          📊 Recent Approvals
        </h3>
        
        {pendingRequests.filter(r => r.status !== 'pending').length > 0 ? (
          <div className="space-y-3">
            {pendingRequests.filter(r => r.status !== 'pending').map((request) => (
              <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    request.status === 'approved' 
                      ? 'bg-green-100 dark:bg-green-900/30' 
                      : 'bg-red-100 dark:bg-red-900/30'
                  }`}>
                    <span className={`text-sm ${
                      request.status === 'approved' 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {request.status === 'approved' ? '✅' : '❌'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Loan #{request.id} - ${request.amount.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                      {request.status} • {request.purpose.replace('_', ' ')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Score: {request.financialScore}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {new Date(request.submittedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-600 dark:text-gray-400">
              No loan decisions made yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoanApprovals;

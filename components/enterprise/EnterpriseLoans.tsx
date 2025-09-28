import React, { useState, useEffect } from 'react';
import { useWallets } from '@privy-io/react-auth';
import Button from '../wallet/shared/Button';
import { contractService } from '../../services/contractService';

interface EnterpriseLoansProps {
  contractsInitialized: boolean;
}

interface LoanRequest {
  amount: number;
  purpose: string;
  termMonths: number;
  description: string;
}

const EnterpriseLoans: React.FC<EnterpriseLoansProps> = ({ contractsInitialized }) => {
  const { wallets } = useWallets();
  const [loanRequest, setLoanRequest] = useState<LoanRequest>({
    amount: 0,
    purpose: '',
    termMonths: 12,
    description: '',
  });
  const [myLoans, setMyLoans] = useState<Array<{id: number; borrower: string; principal: number; interestRate: number; termLength: number; startTime: number; amountPaid: number; isActive: boolean}>>([]);
  const [loading, setLoading] = useState(false);
  const [requestStatus, setRequestStatus] = useState('');

  const embeddedWallet = wallets.find(w => w.walletClientType === 'privy');
  const walletAddress = embeddedWallet?.address as `0x${string}` | undefined;

  const loadMyLoans = async () => {
    if (!contractsInitialized || !walletAddress) return;

    setLoading(true);
    try {
      const totalLoans = await contractService.getTotalLoans();
      const loans: Array<{id: number; borrower: string; principal: number; interestRate: number; termLength: number; startTime: number; amountPaid: number; isActive: boolean}> = [];
      
      // Check loans 1 through totalLoans to find ones where user is borrower
      for (let i = 1; i <= Math.min(totalLoans, 10); i++) {
        try {
          const loan = await contractService.getLoanData(i);
          if (loan && loan.borrower.toLowerCase() === walletAddress.toLowerCase()) {
            loans.push({ id: i, ...loan });
          }
        } catch (error) {
          // Loan doesn't exist or error reading
          continue;
        }
      }
      
      setMyLoans(loans);
    } catch (error) {
      console.error('Error loading loans:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyLoans();
  }, [contractsInitialized, walletAddress]);

  const handleLoanRequest = async () => {
    setRequestStatus('📝 Loan request submitted for admin review. You will be notified once approved and the NFT is minted.');
    
    // In real implementation, this would save to database for admin review
    console.log('Loan request:', { ...loanRequest, borrower: walletAddress });
    
    // Reset form
    setLoanRequest({
      amount: 0,
      purpose: '',
      termMonths: 12,
      description: '',
    });
  };

  if (!contractsInitialized) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-yellow-600 dark:text-yellow-400 text-2xl">⏳</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Initializing Contracts
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Connecting to loan contracts...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Loan Management</h2>
        <Button onClick={loadMyLoans} variant="outline" size="small" disabled={loading}>
          {loading ? '🔄' : '🔄 Refresh'}
        </Button>
      </div>

      {/* My Active Loans */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          📄 My Active Loans
        </h3>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Loading loans...</p>
          </div>
        ) : myLoans.length > 0 ? (
          <div className="space-y-4">
            {myLoans.map((loan) => (
              <div key={loan.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    Loan #{loan.id}
                  </h4>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    loan.isActive 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {loan.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Principal</p>
                    <p className="font-semibold text-gray-900 dark:text-white">${loan.principal.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Paid</p>
                    <p className="font-semibold text-green-600 dark:text-green-400">${loan.amountPaid.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Remaining</p>
                    <p className="font-semibold text-red-600 dark:text-red-400">
                      ${contractService.calculateRemainingBalance(loan).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all"
                      style={{ width: `${contractService.calculateLoanProgress(loan)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {contractService.calculateLoanProgress(loan).toFixed(1)}% paid
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-gray-400 dark:text-gray-500 text-xl">📄</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              No loans found. Submit a loan request to get started.
            </p>
          </div>
        )}
      </div>

      {/* Loan Request Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          📝 Request New Loan
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Loan Amount (USDC) *
            </label>
            <input
              type="number"
              value={loanRequest.amount}
              onChange={(e) => setLoanRequest(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="10000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Term Length (Months) *
            </label>
            <select
              value={loanRequest.termMonths}
              onChange={(e) => setLoanRequest(prev => ({ ...prev, termMonths: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value={6}>6 months</option>
              <option value={12}>12 months</option>
              <option value={18}>18 months</option>
              <option value={24}>24 months</option>
              <option value={36}>36 months</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Purpose *
            </label>
            <select
              value={loanRequest.purpose}
              onChange={(e) => setLoanRequest(prev => ({ ...prev, purpose: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Select purpose</option>
              <option value="working_capital">Working Capital</option>
              <option value="equipment">Equipment Purchase</option>
              <option value="expansion">Business Expansion</option>
              <option value="inventory">Inventory Financing</option>
              <option value="refinancing">Debt Refinancing</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Interest Rate Expectation
            </label>
            <input
              type="text"
              value="12-18% APR (determined by AI scoring)"
              disabled
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Loan Description *
          </label>
          <textarea
            value={loanRequest.description}
            onChange={(e) => setLoanRequest(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Describe how you will use the loan funds and your repayment plan..."
          />
        </div>

        <div className="mt-6">
          <Button
            onClick={handleLoanRequest}
            variant="primary"
            size="large"
            className="w-full"
            disabled={
              !loanRequest.amount || 
              !loanRequest.purpose || 
              !loanRequest.description ||
              loanRequest.amount <= 0
            }
          >
            📝 Submit Loan Request
          </Button>
        </div>

        {requestStatus && (
          <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <p className="text-blue-800 dark:text-blue-200 text-sm">{requestStatus}</p>
          </div>
        )}
      </div>

      {/* Loan Process Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
          📋 Loan Process
        </h4>
        <div className="text-blue-800 dark:text-blue-200 text-sm space-y-1">
          <p><strong>1. Submit Request:</strong> Complete loan application with purpose and amount</p>
          <p><strong>2. AI Scoring:</strong> Your financial data determines interest rate and approval</p>
          <p><strong>3. Admin Review:</strong> Convexo team reviews and approves qualified requests</p>
          <p><strong>4. NFT Minting:</strong> Approved loans are minted as NFTs on-chain</p>
          <p><strong>5. Funding:</strong> USDC is transferred to your wallet from the vault</p>
          <p><strong>6. Repayment:</strong> Make payments through the Collector contract</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{myLoans.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Active Loans</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            ${myLoans.reduce((sum, loan) => sum + loan.amountPaid, 0).toFixed(0)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Repaid</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 text-center">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            ${myLoans.reduce((sum, loan) => sum + contractService.calculateRemainingBalance(loan), 0).toFixed(0)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Remaining Balance</div>
        </div>
      </div>
    </div>
  );
};

export default EnterpriseLoans;

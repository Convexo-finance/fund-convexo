import React from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useAccount } from 'wagmi';
import Layout from '../components/wallet/shared/Layout';
import Loading from '../components/wallet/shared/Loading';
import Button from '../components/wallet/shared/Button';
import LoanStatus from '../components/loan/LoanStatus';
import RepayLoanButton from '../components/loan/RepayLoanButton';
import { useUSDCBalance } from '../hooks/useLoans';

const EnterprisePage: React.FC = () => {
  const { login, ready, authenticated, user, logout } = usePrivy();
  const { address, isConnected } = useAccount();
  
  // Fetch user USDC balance
  const { balance: usdcBalance } = useUSDCBalance(address);

  if (!ready) {
    return <Loading fullScreen={true} text="Loading..." />;
  }

  if (!authenticated) {
    return (
      <Layout title="Convexo - Enterprise Dashboard">
        <div className="text-center py-12 px-6 bg-white dark:bg-gray-800 rounded-lg shadow-md max-w-md mx-auto">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-blue-600 dark:text-blue-400 text-2xl">🏢</span>
          </div>
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">
            Enterprise Dashboard
          </h2>
          <p className="mb-8 text-gray-600 dark:text-gray-300">
            Connect your wallet to access the Convexo enterprise platform and manage your loans.
          </p>
          <Button onClick={login} variant="primary" size="large" className="w-full">
            Connect Wallet
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Convexo - Enterprise Dashboard">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">Welcome, Enterprise! 🏢</h1>
              <p className="text-blue-100">
                Manage your loans and make payments through the Convexo platform.
              </p>
            </div>
            <div className="text-right">
              <p className="text-blue-200 text-sm">Connected as:</p>
              <p className="font-mono text-sm truncate max-w-32">
                {user?.email?.address || user?.phone?.number || address}
              </p>
              <Button 
                onClick={logout} 
                variant="outline" 
                size="small" 
                className="mt-2 text-white border-white hover:bg-white hover:text-blue-600"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Connection Status */}
        {!isConnected && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-center">
              <span className="text-yellow-600 dark:text-yellow-400 text-xl mr-3">⚠️</span>
              <div>
                <h3 className="font-medium text-yellow-800 dark:text-yellow-200">
                  Wallet Not Connected
                </h3>
                <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                  Connect your wallet to interact with loan contracts and make payments.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Account Overview */}
        {isConnected && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              💰 Account Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* USDC Balance */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">USDC Balance</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      ${usdcBalance.toFixed(2)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 dark:text-blue-400 text-xl">💵</span>
                  </div>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-xs mt-2">
                  Available for loan payments
                </p>
              </div>

              {/* Wallet Address */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Wallet Address</p>
                    <p className="text-sm font-mono text-gray-900 dark:text-white truncate">
                      {address}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 dark:text-purple-400 text-xl">🔐</span>
                  </div>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-xs mt-2">
                  Your connected wallet
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loan Management Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Loan Status */}
          <LoanStatus />
          
          {/* Repay Loan */}
          <RepayLoanButton />
        </div>

        {/* Information Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            📋 Loan Management Guide
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 dark:text-blue-400 text-xl">1️⃣</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Check Loan Status</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Enter your loan ID to view current balance, payment history, and loan terms.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 dark:text-green-400 text-xl">2️⃣</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Make Payments</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Pay your loan installments or make full payments using USDC from your wallet.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-600 dark:text-purple-400 text-xl">3️⃣</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Track Progress</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Monitor your repayment progress and maintain good standing with timely payments.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            🚀 Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-600 rounded-lg p-4 border border-gray-200 dark:border-gray-500">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Need Help?</h4>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                Contact our support team for assistance with your loan or payment issues.
              </p>
              <Button variant="outline" size="small">
                Contact Support
              </Button>
            </div>
            
            <div className="bg-white dark:bg-gray-600 rounded-lg p-4 border border-gray-200 dark:border-gray-500">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Payment Schedule</h4>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                Download your payment schedule and loan documentation.
              </p>
              <Button variant="outline" size="small">
                Download Docs
              </Button>
            </div>
          </div>
        </div>

        {/* Important Notice */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <h3 className="flex items-center font-medium text-amber-800 dark:text-amber-200 mb-2">
            📢 Important Notice
          </h3>
          <div className="text-amber-700 dark:text-amber-300 text-sm space-y-2">
            <p>
              • All loan payments must be made in USDC on the Base Sepolia network.
            </p>
            <p>
              • Ensure you have sufficient USDC balance before initiating a payment.
            </p>
            <p>
              • Payment confirmations may take a few minutes to appear on the blockchain.
            </p>
            <p>
              • Late payments may incur additional fees as specified in your loan agreement.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EnterprisePage;

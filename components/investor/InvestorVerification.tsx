import React, { useState } from 'react';
import Button from '../wallet/shared/Button';
import Loading from '../wallet/shared/Loading';

type VerificationStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'VERIFIED' | 'REJECTED';

const InvestorVerification: React.FC = () => {
  const [status, setStatus] = useState<VerificationStatus>('NOT_STARTED');
  const [processing, setProcessing] = useState(false);

  const handleVeriffVerification = async () => {
    setProcessing(true);
    setStatus('IN_PROGRESS');
    
    // Simulate Veriff ID verification process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 95% approval rate for demo
    const approved = Math.random() > 0.05;
    setStatus(approved ? 'VERIFIED' : 'REJECTED');
    setProcessing(false);
  };

  const resetVerification = () => {
    setStatus('NOT_STARTED');
    setProcessing(false);
  };

  if (status === 'IN_PROGRESS') {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <Loading text="Verifying your identity with Veriff..." />
          <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-blue-800 dark:text-blue-200 text-sm">
              Please follow the instructions in the Veriff window to complete your identity verification.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'VERIFIED') {
    return (
      <div className="space-y-6">
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                🎉 Identity Verified
              </h3>
              <p className="text-green-600 dark:text-green-400 text-sm">
                Your identity has been successfully verified through Veriff AI.
              </p>
            </div>
            <div className="w-12 h-12 bg-green-200 dark:bg-green-800 rounded-full flex items-center justify-center">
              <span className="text-green-600 dark:text-green-300 text-xl">✅</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            ✅ Verification Complete
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Identity Check:</span>
                <span className="text-green-600 dark:text-green-400 font-medium">✓ Verified</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Document Validation:</span>
                <span className="text-green-600 dark:text-green-400 font-medium">✓ Valid</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Liveness Check:</span>
                <span className="text-green-600 dark:text-green-400 font-medium">✓ Passed</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">AML Screening:</span>
                <span className="text-green-600 dark:text-green-400 font-medium">✓ Clear</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Risk Level:</span>
                <span className="text-green-600 dark:text-green-400 font-medium">✓ Low</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Investment Access:</span>
                <span className="text-green-600 dark:text-green-400 font-medium">✓ Approved</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            🚀 Available Investment Features
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-800 dark:text-blue-200 text-sm">
            <ul className="space-y-1">
              <li>• Vault deposits & withdrawals</li>
              <li>• High-yield investment products</li>
              <li>• Real-time portfolio tracking</li>
            </ul>
            <ul className="space-y-1">
              <li>• Automated yield distribution</li>
              <li>• Risk-adjusted returns</li>
              <li>• Instant liquidity access</li>
            </ul>
          </div>
        </div>

        <div className="text-center">
          <Button onClick={resetVerification} variant="outline">
            🔄 Re-verify Identity
          </Button>
        </div>
      </div>
    );
  }

  if (status === 'REJECTED') {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 dark:text-red-400 text-2xl">❌</span>
            </div>
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
              Verification Failed
            </h3>
            <p className="text-red-600 dark:text-red-400 mb-4">
              Your identity verification was not successful. Please try again or contact support.
            </p>
            <div className="flex justify-center space-x-3">
              <Button onClick={resetVerification} variant="primary">
                Try Again
              </Button>
              <Button variant="outline">
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Identity Verification</h2>
      </div>

      {/* Verification Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
        <div className="flex items-center">
          <span className="text-blue-600 dark:text-blue-400 text-2xl mr-4">🆔</span>
          <div>
            <h3 className="font-medium text-blue-800 dark:text-blue-200">
              Complete Your Identity Verification
            </h3>
            <p className="text-blue-700 dark:text-blue-300 text-sm">
              Verify your identity with Veriff AI to access all investment features on the platform.
            </p>
          </div>
        </div>
      </div>

      {/* Verification Process */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          📋 Verification Process
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mt-1">
              <span className="text-blue-600 dark:text-blue-400 text-xs font-bold">1</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Document Upload</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Upload a clear photo of your government-issued ID (passport, driver's license, etc.)
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mt-1">
              <span className="text-blue-600 dark:text-blue-400 text-xs font-bold">2</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Selfie Verification</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Take a selfie to verify your identity matches the uploaded document
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mt-1">
              <span className="text-blue-600 dark:text-blue-400 text-xs font-bold">3</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">AI Verification</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Veriff AI processes your documents and provides instant verification results
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Button
            onClick={handleVeriffVerification}
            variant="primary"
            size="large"
            disabled={processing}
            className="px-8"
          >
            {processing ? 'Processing...' : '🆔 Start Veriff Verification'}
          </Button>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
            This process typically takes 2-3 minutes
          </p>
        </div>
      </div>

      {/* About Veriff */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
          ℹ️ About Veriff
        </h4>
        <div className="text-gray-600 dark:text-gray-400 text-sm space-y-1">
          <p>• <strong>AI-Powered:</strong> Advanced AI technology for instant identity verification</p>
          <p>• <strong>Secure:</strong> All data is encrypted and processed securely</p>
          <p>• <strong>Global:</strong> Supports 200+ countries and 50+ languages</p>
          <p>• <strong>Compliant:</strong> Meets global KYC and AML requirements</p>
        </div>
      </div>
    </div>
  );
};

export default InvestorVerification;

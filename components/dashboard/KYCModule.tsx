import React, { useState } from 'react';
import Button from '../wallet/shared/Button';
import Loading from '../wallet/shared/Loading';

type KYCStatus = 'NOT_VERIFIED' | 'PROCESSING' | 'VERIFIED' | 'REJECTED';
type DocumentType = 'incorporation' | 'tax_id' | 'bank_statement' | 'board_resolution' | 'representative_id';

interface Document {
  type: DocumentType;
  name: string;
  uploaded: boolean;
  status: 'pending' | 'approved' | 'rejected';
}

const KYCModule: React.FC = () => {
  const [kycStatus, setKycStatus] = useState<KYCStatus>('NOT_VERIFIED');
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([
    { type: 'incorporation', name: 'Certificate of Incorporation', uploaded: false, status: 'pending' },
    { type: 'tax_id', name: 'Tax ID Certificate', uploaded: false, status: 'pending' },
    { type: 'bank_statement', name: 'Bank Statement (Last 3 months)', uploaded: false, status: 'pending' },
    { type: 'board_resolution', name: 'Board Resolution', uploaded: false, status: 'pending' },
    { type: 'representative_id', name: 'Representative ID', uploaded: false, status: 'pending' },
  ]);

  const handleDocumentUpload = async (docType: DocumentType) => {
    setUploading(true);
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setDocuments(prev => prev.map(doc => 
      doc.type === docType 
        ? { ...doc, uploaded: true, status: 'approved' } 
        : doc
    ));
    
    setUploading(false);
    
    // Check if all documents are uploaded
    const updatedDocs = documents.map(doc => 
      doc.type === docType 
        ? { ...doc, uploaded: true, status: 'approved' as const } 
        : doc
    );
    
    if (updatedDocs.every(doc => doc.uploaded)) {
      setTimeout(() => {
        setKycStatus('PROCESSING');
        setTimeout(() => {
          setKycStatus('VERIFIED');
        }, 3000);
      }, 1000);
    }
  };

  const handleSubmitKYC = async () => {
    setKycStatus('PROCESSING');
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Randomly approve or reject for demo
    const approved = Math.random() > 0.2; // 80% approval rate
    setKycStatus(approved ? 'VERIFIED' : 'REJECTED');
  };

  const resetKYC = () => {
    setKycStatus('NOT_VERIFIED');
    setDocuments(prev => prev.map(doc => ({ 
      ...doc, 
      uploaded: false, 
      status: 'pending' as const 
    })));
  };

  const getStatusColor = (status: KYCStatus) => {
    switch (status) {
      case 'VERIFIED': return 'green';
      case 'PROCESSING': return 'yellow';
      case 'REJECTED': return 'red';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status: KYCStatus) => {
    switch (status) {
      case 'VERIFIED': return '✅';
      case 'PROCESSING': return '⏳';
      case 'REJECTED': return '❌';
      default: return '📋';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">KYC & Verification</h2>
        {kycStatus !== 'NOT_VERIFIED' && (
          <Button onClick={resetKYC} variant="outline" size="small">
            🔄 Reset KYC
          </Button>
        )}
      </div>

      {/* Status Banner */}
      <div className={`rounded-lg p-6 border ${
        kycStatus === 'VERIFIED' 
          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
          : kycStatus === 'PROCESSING'
          ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700'
          : kycStatus === 'REJECTED'
          ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
          : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`text-lg font-semibold ${
              kycStatus === 'VERIFIED' ? 'text-green-800 dark:text-green-200'
              : kycStatus === 'PROCESSING' ? 'text-yellow-800 dark:text-yellow-200'
              : kycStatus === 'REJECTED' ? 'text-red-800 dark:text-red-200'
              : 'text-gray-800 dark:text-gray-200'
            }`}>
              KYC Status: {kycStatus.replace('_', ' ')}
            </h3>
            <p className={`text-sm ${
              kycStatus === 'VERIFIED' ? 'text-green-600 dark:text-green-400'
              : kycStatus === 'PROCESSING' ? 'text-yellow-600 dark:text-yellow-400'
              : kycStatus === 'REJECTED' ? 'text-red-600 dark:text-red-400'
              : 'text-gray-600 dark:text-gray-400'
            }`}>
              {kycStatus === 'VERIFIED' && 'Your account has been verified and approved for all services.'}
              {kycStatus === 'PROCESSING' && 'Your documents are being reviewed. This typically takes 1-3 business days.'}
              {kycStatus === 'REJECTED' && 'Some documents were rejected. Please review and resubmit.'}
              {kycStatus === 'NOT_VERIFIED' && 'Complete your KYC verification to access all platform features.'}
            </p>
          </div>
          <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl ${
            kycStatus === 'VERIFIED' ? 'bg-green-200 dark:bg-green-800'
            : kycStatus === 'PROCESSING' ? 'bg-yellow-200 dark:bg-yellow-800'
            : kycStatus === 'REJECTED' ? 'bg-red-200 dark:bg-red-800'
            : 'bg-gray-200 dark:bg-gray-600'
          }`}>
            {getStatusIcon(kycStatus)}
          </div>
        </div>
      </div>

      {kycStatus === 'PROCESSING' && (
        <div className="text-center py-8">
          <Loading text="Processing your KYC documents..." />
          <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-blue-800 dark:text-blue-200 text-sm">
              Our compliance team is reviewing your submitted documents. You'll receive an update within 24-48 hours.
            </p>
          </div>
        </div>
      )}

      {(kycStatus === 'NOT_VERIFIED' || kycStatus === 'REJECTED') && (
        <>
          {/* Document Upload Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              📄 Required Documents
            </h3>
            
            <div className="space-y-4">
              {documents.map((doc, index) => (
                <div key={doc.type} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                      doc.uploaded 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      {doc.uploaded ? '✓' : index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{doc.name}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {doc.uploaded ? 'Uploaded and approved' : 'Required for verification'}
                      </p>
                    </div>
                  </div>
                  
                  {!doc.uploaded ? (
                    <Button
                      onClick={() => handleDocumentUpload(doc.type)}
                      disabled={uploading}
                      variant="outline"
                      size="small"
                    >
                      {uploading ? 'Uploading...' : 'Upload'}
                    </Button>
                  ) : (
                    <div className="text-green-600 dark:text-green-400 text-sm font-medium">
                      ✓ Approved
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit KYC Button */}
          {documents.every(doc => doc.uploaded) && (
            <div className="text-center">
              <Button
                onClick={handleSubmitKYC}
                variant="primary"
                size="large"
                className="px-8"
              >
                📋 Submit for KYC Review
              </Button>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                All documents uploaded. Submit for final review by our compliance team.
              </p>
            </div>
          )}
        </>
      )}

      {kycStatus === 'VERIFIED' && (
        <div className="space-y-6">
          {/* Verification Complete */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              🎉 Verification Complete
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Identity Verification:</span>
                  <span className="text-green-600 dark:text-green-400 font-medium">✓ Verified</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Company Verification:</span>
                  <span className="text-green-600 dark:text-green-400 font-medium">✓ Verified</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Document Review:</span>
                  <span className="text-green-600 dark:text-green-400 font-medium">✓ Complete</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">AML Screening:</span>
                  <span className="text-green-600 dark:text-green-400 font-medium">✓ Passed</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Risk Assessment:</span>
                  <span className="text-green-600 dark:text-green-400 font-medium">✓ Low Risk</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Platform Access:</span>
                  <span className="text-green-600 dark:text-green-400 font-medium">✓ Full Access</span>
                </div>
              </div>
            </div>
          </div>

          {/* Available Services */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              🔓 Available Services
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">Investment Services</h4>
                <ul className="text-green-700 dark:text-green-300 text-sm space-y-1">
                  <li>• Vault deposits & withdrawals</li>
                  <li>• High-yield investment products</li>
                  <li>• Portfolio management</li>
                </ul>
              </div>
              
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Enterprise Services</h4>
                <ul className="text-blue-700 dark:text-blue-300 text-sm space-y-1">
                  <li>• Loan applications</li>
                  <li>• Financial scoring</li>
                  <li>• Credit facilities</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
          ℹ️ KYC Information
        </h4>
        <div className="text-blue-800 dark:text-blue-200 text-sm space-y-1">
          <p>• <strong>Processing Time:</strong> Document review typically takes 24-48 hours</p>
          <p>• <strong>Document Quality:</strong> Ensure documents are clear, legible, and recent</p>
          <p>• <strong>Data Security:</strong> All documents are encrypted and stored securely</p>
          <p>• <strong>Support:</strong> Contact our compliance team for assistance</p>
        </div>
      </div>
    </div>
  );
};

export default KYCModule;

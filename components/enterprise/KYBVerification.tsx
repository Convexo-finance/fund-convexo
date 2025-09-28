import React, { useState } from 'react';
import Button from '../wallet/shared/Button';

interface KYBData {
  // Company Information
  legal_name: string;
  legal_form: 'SAS' | 'LLC' | 'C-Corp' | 'S-Corp' | 'GmbH' | 'Ltd' | 'PLC' | 'Sole Proprietorship' | 'Partnership' | '';
  registration_number: string;
  tax_id: string;
  incorporation_date: string;
  website: string;
  industry_code: string;
  country: 'US' | 'CO' | 'MX' | 'BR' | 'CL' | 'GB' | 'SG' | 'HK' | 'DE' | 'FR' | 'ES' | '';
  state_province: string;
  city: string;
  address_line1: string;
  address_line2: string;
  postal_code: string;
  
  // Representative Information
  rep_full_name: string;
  rep_role: string;
  rep_id_type: 'CC' | 'DNI' | 'Passport' | 'SSN' | 'Other' | '';
  rep_id_number: string;
  rep_dob: string;
  rep_nationality: 'US' | 'CO' | 'MX' | 'BR' | 'CL' | 'GB' | 'SG' | 'HK' | 'DE' | 'FR' | 'ES' | '';
  rep_email: string;
  rep_phone: string;
  rep_is_pep: boolean;
  
  // Ownership Structure
  shareholders: Array<{name: string; type: string; percent: number}>;
  ubos: Array<{name: string; percent: number; country: string}>;
}

type KYBStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED';

const KYBVerification: React.FC = () => {
  const [kybStatus, setKybStatus] = useState<KYBStatus>('NOT_STARTED');
  const [currentStep, setCurrentStep] = useState(1);
  const [kybData, setKybData] = useState<KYBData>({
    legal_name: '',
    legal_form: '',
    registration_number: '',
    tax_id: '',
    incorporation_date: '',
    website: '',
    industry_code: '',
    country: '',
    state_province: '',
    city: '',
    address_line1: '',
    address_line2: '',
    postal_code: '',
    rep_full_name: '',
    rep_role: '',
    rep_id_type: '',
    rep_id_number: '',
    rep_dob: '',
    rep_nationality: '',
    rep_email: '',
    rep_phone: '',
    rep_is_pep: false,
    shareholders: [],
    ubos: [],
  });

  const [uploadedDocs, setUploadedDocs] = useState<Set<string>>(new Set());

  const handleInputChange = (field: keyof KYBData, value: any) => {
    setKybData(prev => ({ ...prev, [field]: value }));
  };

  const handleDocumentUpload = (docType: string, files: File[]) => {
    // Simulate document upload
    setUploadedDocs(prev => new Set([...prev, docType]));
  };

  const handleSumsubVerification = async () => {
    setKybStatus('SUBMITTED');
    
    // Simulate Sumsub processing
    setTimeout(() => {
      setKybStatus('UNDER_REVIEW');
      setTimeout(() => {
        // 90% approval rate for demo
        const approved = Math.random() > 0.1;
        setKybStatus(approved ? 'VERIFIED' : 'REJECTED');
      }, 5000);
    }, 2000);
  };

  const requiredDocuments = [
    { key: 'proof_of_address', label: 'Proof of Address', required: true },
    { key: 'fs_income_statement_pdf', label: 'Income Statement (PDF)', required: true },
    { key: 'fs_balance_sheet_pdf', label: 'Balance Sheet (PDF)', required: true },
    { key: 'bank_statements', label: 'Bank Statements (3-6 months)', required: true },
    { key: 'tax_return_last_fy', label: 'Tax Filing (Last FY)', required: true },
    { key: 'kyb_incorp_cert', label: 'Certificate of Incorporation', required: true },
    { key: 'kyb_bylaws', label: 'Articles of Association / Bylaws', required: true },
    { key: 'kyb_shareholder_register', label: 'Shareholder Register', required: true },
    { key: 'kyb_board_resolution', label: 'Board Resolution / PoA', required: true },
    { key: 'rep_id_document', label: 'Representative Government ID', required: true },
    { key: 'rep_proof_of_address', label: 'Representative Proof of Address', required: true },
  ];

  const getStatusColor = (status: KYBStatus) => {
    switch (status) {
      case 'VERIFIED': return 'green';
      case 'UNDER_REVIEW': case 'SUBMITTED': return 'yellow';
      case 'REJECTED': return 'red';
      default: return 'blue';
    }
  };

  const getStatusIcon = (status: KYBStatus) => {
    switch (status) {
      case 'VERIFIED': return '✅';
      case 'UNDER_REVIEW': case 'SUBMITTED': return '⏳';
      case 'REJECTED': return '❌';
      default: return '📋';
    }
  };

  if (kybStatus === 'UNDER_REVIEW' || kybStatus === 'SUBMITTED') {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-yellow-600 dark:text-yellow-400 text-2xl">⏳</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            KYB Under Review
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Your KYB submission is being reviewed by Sumsub. This typically takes 24-48 hours.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-blue-800 dark:text-blue-200 text-sm">
              You will receive an email notification once the review is complete.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (kybStatus === 'VERIFIED') {
    return (
      <div className="space-y-6">
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                🎉 KYB Verification Complete
              </h3>
              <p className="text-green-600 dark:text-green-400 text-sm">
                Your enterprise has been successfully verified through Sumsub.
              </p>
            </div>
            <div className="w-12 h-12 bg-green-200 dark:bg-green-800 rounded-full flex items-center justify-center">
              <span className="text-green-600 dark:text-green-300 text-xl">✅</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            ✅ Verification Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Company Verification:</span>
                <span className="text-green-600 dark:text-green-400 font-medium">✓ Verified</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Document Review:</span>
                <span className="text-green-600 dark:text-green-400 font-medium">✓ Complete</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Representative ID:</span>
                <span className="text-green-600 dark:text-green-400 font-medium">✓ Verified</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">AML Screening:</span>
                <span className="text-green-600 dark:text-green-400 font-medium">✓ Passed</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Risk Level:</span>
                <span className="text-green-600 dark:text-green-400 font-medium">✓ Low Risk</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Platform Access:</span>
                <span className="text-green-600 dark:text-green-400 font-medium">✓ Full Access</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">KYB Verification</h2>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Step {currentStep} of 3
        </div>
      </div>

      {/* Status Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
        <div className="flex items-center">
          <span className="text-blue-600 dark:text-blue-400 text-xl mr-3">📋</span>
          <div>
            <h3 className="font-medium text-blue-800 dark:text-blue-200">
              Complete Your KYB Verification
            </h3>
            <p className="text-blue-700 dark:text-blue-300 text-sm">
              Verify your enterprise through Sumsub to access all platform features including loans and funding.
            </p>
          </div>
        </div>
      </div>

      {currentStep === 1 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            🏢 Company Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Legal Entity Name *
              </label>
              <input
                type="text"
                value={kybData.legal_name}
                onChange={(e) => handleInputChange('legal_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Echosystem Technologies SAS"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Legal Form *
              </label>
              <select
                value={kybData.legal_form}
                onChange={(e) => handleInputChange('legal_form', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select legal form</option>
                <option value="SAS">SAS</option>
                <option value="LLC">LLC</option>
                <option value="C-Corp">C-Corp</option>
                <option value="S-Corp">S-Corp</option>
                <option value="GmbH">GmbH</option>
                <option value="Ltd">Ltd</option>
                <option value="PLC">PLC</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Registration Number *
              </label>
              <input
                type="text"
                value={kybData.registration_number}
                onChange={(e) => handleInputChange('registration_number', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="901797152-1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tax ID / NIT *
              </label>
              <input
                type="text"
                value={kybData.tax_id}
                onChange={(e) => handleInputChange('tax_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="NIT 901797152-1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Country *
              </label>
              <select
                value={kybData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select country</option>
                <option value="CO">Colombia</option>
                <option value="US">United States</option>
                <option value="MX">Mexico</option>
                <option value="BR">Brazil</option>
                <option value="CL">Chile</option>
                <option value="GB">United Kingdom</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                City *
              </label>
              <input
                type="text"
                value={kybData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Cali"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button 
              onClick={() => setCurrentStep(2)}
              variant="primary"
              disabled={!kybData.legal_name || !kybData.legal_form || !kybData.country}
            >
              Next: Representative Info →
            </Button>
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            👤 Representative Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={kybData.rep_full_name}
                onChange={(e) => handleInputChange('rep_full_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="William Martinez"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Role / Title *
              </label>
              <input
                type="text"
                value={kybData.rep_role}
                onChange={(e) => handleInputChange('rep_role', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="CEO"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ID Type *
              </label>
              <select
                value={kybData.rep_id_type}
                onChange={(e) => handleInputChange('rep_id_type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select ID type</option>
                <option value="CC">Cédula de Ciudadanía</option>
                <option value="DNI">DNI</option>
                <option value="Passport">Passport</option>
                <option value="SSN">SSN</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={kybData.rep_email}
                onChange={(e) => handleInputChange('rep_email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="wmb81321@gmail.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone *
              </label>
              <input
                type="tel"
                value={kybData.rep_phone}
                onChange={(e) => handleInputChange('rep_phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="+1301501248"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date of Birth *
              </label>
              <input
                type="date"
                value={kybData.rep_dob}
                onChange={(e) => handleInputChange('rep_dob', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={kybData.rep_is_pep}
                onChange={(e) => handleInputChange('rep_is_pep', e.target.checked)}
                className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                I am a Politically Exposed Person (PEP)
              </span>
            </label>
          </div>

          <div className="mt-6 flex justify-between">
            <Button 
              onClick={() => setCurrentStep(1)}
              variant="outline"
            >
              ← Back
            </Button>
            <Button 
              onClick={() => setCurrentStep(3)}
              variant="primary"
              disabled={!kybData.rep_full_name || !kybData.rep_email}
            >
              Next: Documents →
            </Button>
          </div>
        </div>
      )}

      {currentStep === 3 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            📄 Required Documents
          </h3>
          
          <div className="space-y-4">
            {requiredDocuments.map((doc) => (
              <div key={doc.key} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">{doc.label}</h4>
                  {uploadedDocs.has(doc.key) && (
                    <span className="text-green-600 dark:text-green-400 text-sm">✓ Uploaded</span>
                  )}
                </div>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    handleDocumentUpload(doc.key, files);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-purple-500 focus:border-transparent
                           file:mr-4 file:py-1 file:px-2 file:rounded-full file:border-0
                           file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700
                           hover:file:bg-purple-100"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Upload PDF, JPG, or PNG files (max 5MB)
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-between">
            <Button 
              onClick={() => setCurrentStep(2)}
              variant="outline"
            >
              ← Back
            </Button>
            <Button 
              onClick={handleSumsubVerification}
              variant="primary"
              disabled={uploadedDocs.size < requiredDocuments.filter(d => d.required).length}
            >
              🔍 Submit for Sumsub Verification
            </Button>
          </div>
        </div>
      )}

      {/* Information Box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
          ℹ️ About KYB Verification
        </h4>
        <div className="text-blue-800 dark:text-blue-200 text-sm space-y-1">
          <p>• <strong>Sumsub Integration:</strong> Your documents are securely processed by Sumsub</p>
          <p>• <strong>Processing Time:</strong> Verification typically takes 24-48 hours</p>
          <p>• <strong>AML Screening:</strong> Automated compliance checks for regulatory requirements</p>
          <p>• <strong>Data Security:</strong> All information is encrypted and stored securely</p>
        </div>
      </div>
    </div>
  );
};

export default KYBVerification;

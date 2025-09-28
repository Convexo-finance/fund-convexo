import React, { useState } from 'react';
import Button from '../wallet/shared/Button';
import Loading from '../wallet/shared/Loading';

interface FinancialData {
  companyName: string;
  revenue: number;
  expenses: number;
  ebitda: number;
  cashFlow: number;
  employees: number;
  industryCode: string;
  businessDescription: string;
}

type ProcessingStatus = 'idle' | 'processing' | 'completed' | 'error';

const FinancialModule: React.FC = () => {
  const [financialData, setFinancialData] = useState<FinancialData>({
    companyName: '',
    revenue: 0,
    expenses: 0,
    ebitda: 0,
    cashFlow: 0,
    employees: 0,
    industryCode: '',
    businessDescription: '',
  });
  
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [scoringResult, setScoringResult] = useState<any>(null);

  const handleInputChange = (field: keyof FinancialData, value: string | number) => {
    setFinancialData(prev => ({ ...prev, [field]: value }));
  };

  const handleProcessData = async () => {
    setStatus('processing');
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mock scoring result
    const mockResult = {
      overallScore: Math.floor(Math.random() * 40) + 60, // 60-100
      ebitdaScore: Math.floor(Math.random() * 30) + 70,
      cashFlowScore: Math.floor(Math.random() * 25) + 75,
      industryScore: Math.floor(Math.random() * 20) + 80,
      riskLevel: Math.random() > 0.5 ? 'Medium' : 'Low',
      recommendations: [
        'Strong revenue growth trajectory',
        'Healthy EBITDA margins',
        'Consider expanding workforce for growth',
        'Monitor cash flow seasonality'
      ],
      fundingEligibility: Math.random() > 0.3 ? 'Approved' : 'Under Review'
    };
    
    setScoringResult(mockResult);
    setStatus('completed');
  };

  const resetScoring = () => {
    setStatus('idle');
    setScoringResult(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Scoring</h2>
        {status === 'completed' && (
          <Button onClick={resetScoring} variant="outline" size="small">
            🔄 New Scoring
          </Button>
        )}
      </div>

      {status === 'idle' && (
        <>
          {/* Data Input Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              📊 Company Financial Data
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  value={financialData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter company name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Industry Code (ISIC)
                </label>
                <input
                  type="text"
                  value={financialData.industryCode}
                  onChange={(e) => handleInputChange('industryCode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., 541211"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Annual Revenue (USD)
                </label>
                <input
                  type="number"
                  value={financialData.revenue}
                  onChange={(e) => handleInputChange('revenue', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Annual Expenses (USD)
                </label>
                <input
                  type="number"
                  value={financialData.expenses}
                  onChange={(e) => handleInputChange('expenses', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  EBITDA (USD)
                </label>
                <input
                  type="number"
                  value={financialData.ebitda}
                  onChange={(e) => handleInputChange('ebitda', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Number of Employees
                </label>
                <input
                  type="number"
                  value={financialData.employees}
                  onChange={(e) => handleInputChange('employees', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Business Description
              </label>
              <textarea
                value={financialData.businessDescription}
                onChange={(e) => handleInputChange('businessDescription', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Describe your business model and operations..."
              />
            </div>
          </div>

          {/* Process Button */}
          <div className="text-center">
            <Button
              onClick={handleProcessData}
              variant="primary"
              size="large"
              disabled={!financialData.companyName || !financialData.revenue}
              className="px-8"
            >
              🤖 Process Data for AI Scoring
            </Button>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Our AI will analyze your financial data and generate a comprehensive score
            </p>
          </div>
        </>
      )}

      {status === 'processing' && (
        <div className="text-center py-12">
          <Loading text="AI is analyzing your financial data..." />
          <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-blue-800 dark:text-blue-200 text-sm">
              Processing financial metrics, calculating risk scores, and generating recommendations...
            </p>
          </div>
        </div>
      )}

      {status === 'completed' && scoringResult && (
        <div className="space-y-6">
          {/* Overall Score */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-6 border border-green-200 dark:border-green-700">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-2">
                Overall Score: {scoringResult.overallScore}/100
              </h3>
              <div className="w-full bg-green-200 dark:bg-green-800 rounded-full h-4 mb-4">
                <div 
                  className="bg-green-600 h-4 rounded-full transition-all duration-1000"
                  style={{ width: `${scoringResult.overallScore}%` }}
                />
              </div>
              <p className="text-green-700 dark:text-green-300">
                Funding Eligibility: <strong>{scoringResult.fundingEligibility}</strong>
              </p>
            </div>
          </div>

          {/* Detailed Scores */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">EBITDA Score</h4>
              <div className="text-2xl font-bold text-purple-600">{scoringResult.ebitdaScore}/100</div>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full"
                  style={{ width: `${scoringResult.ebitdaScore}%` }}
                />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Cash Flow Score</h4>
              <div className="text-2xl font-bold text-blue-600">{scoringResult.cashFlowScore}/100</div>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${scoringResult.cashFlowScore}%` }}
                />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Industry Score</h4>
              <div className="text-2xl font-bold text-orange-600">{scoringResult.industryScore}/100</div>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-2">
                <div 
                  className="bg-orange-600 h-2 rounded-full"
                  style={{ width: `${scoringResult.industryScore}%` }}
                />
              </div>
            </div>
          </div>

          {/* Risk Assessment */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              📊 Risk Assessment
            </h3>
            <div className="flex items-center space-x-4">
              <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                scoringResult.riskLevel === 'Low' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
              }`}>
                Risk Level: {scoringResult.riskLevel}
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              💡 AI Recommendations
            </h3>
            <ul className="space-y-2">
              {scoringResult.recommendations.map((rec: string, index: number) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-gray-700 dark:text-gray-300 text-sm">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 dark:text-red-400 text-2xl">❌</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Processing Failed
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            There was an error processing your financial data. Please try again.
          </p>
          <Button onClick={resetScoring} variant="primary">
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
};

export default FinancialModule;

import { useRouter } from 'next/router';
import Layout from '../components/wallet/shared/Layout';
import Button from '../components/wallet/shared/Button';

export default function Home() {
  const router = useRouter();

  return (
    <Layout title="Convexo - International Crowdfunding Platform">
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="text-center py-12 px-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl border border-purple-200 dark:border-purple-700">
          <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-purple-600 dark:text-purple-400 text-3xl">🏦</span>
          </div>
          <h1 className="text-3xl font-bold mb-4 text-gray-800 dark:text-white">Convexo</h1>
          <p className="text-lg mb-6 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Fintech de crowdfunding internacional que conecta empresas de capital físico intensivo 
            con infraestructura financiera internacional para inversionistas globales
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            <div className="flex items-center justify-center space-x-2">
              <span className="text-lg">🔗</span>
              <span><strong>Blockchain:</strong> Transparencia auditable</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <span className="text-lg">🤖</span>
              <span><strong>AI:</strong> Scoring financiero inteligente</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <span className="text-lg">🌍</span>
              <span><strong>Internacional:</strong> Capital global sin fricciones</span>
            </div>
          </div>
        </div>

        {/* Platform Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Enterprise Platform */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 dark:text-blue-400 text-2xl">🏢</span>
              </div>
              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
                Para Empresas
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                KYB verification, financial scoring, and funding operations for enterprises seeking capital.
              </p>
              
              <div className="space-y-3 mb-6 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>KYB & AML verification via Sumsub</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>AI financial scoring & analysis</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Cash-in/cash-out operations</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Loan management & repayments</span>
                </div>
              </div>

              <Button 
                onClick={() => router.push('/enterprises')}
                variant="primary" 
                size="large" 
                className="w-full"
              >
                🏢 Access Enterprise Platform
              </Button>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                convexus.xyz/enterprises
              </p>
            </div>
          </div>

          {/* Investor Platform */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 dark:text-purple-400 text-2xl">💼</span>
              </div>
              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
                Para Inversionistas
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Simple identity verification and access to high-yield investment opportunities.
              </p>
              
              <div className="space-y-3 mb-6 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Passport verification via Veriff AI</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Vault deposits & withdrawals</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>High-yield returns from enterprise loans</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Real-time portfolio tracking</span>
                </div>
              </div>

              <Button 
                onClick={() => router.push('/investors')}
                variant="primary" 
                size="large" 
                className="w-full"
              >
                💼 Access Investor Platform
              </Button>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                convexus.xyz/investors
              </p>
            </div>
          </div>
        </div>

        {/* Platform Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-xl font-bold text-center text-gray-800 dark:text-white mb-6">
            Platform Statistics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">12.5%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Current APY</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">$2.4M</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Funded</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">150+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Verified Enterprises</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">1,200+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active Investors</div>
            </div>
          </div>
        </div>

        {/* Developer Tools */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-center text-gray-800 dark:text-white mb-4">
            🔧 Developer Tools
          </h3>
          <div className="flex justify-center">
            <Button 
              onClick={() => router.push('/contracts')}
              variant="outline"
              className="text-purple-600 dark:text-purple-400 border-purple-300 dark:border-purple-600"
            >
              🧪 Test Live Contracts
            </Button>
          </div>
          <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-2">
            Interact directly with deployed Base Sepolia contracts
          </p>
        </div>

        {/* Footer Info */}
        <div className="text-center py-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Powered by Privy embedded wallets on Base Sepolia
          </p>
        </div>
      </div>
    </Layout>
  );
}
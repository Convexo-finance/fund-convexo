import { usePrivy } from '@privy-io/react-auth';
import { useState } from 'react';
import Layout from '../components/wallet/shared/Layout';
import Loading from '../components/wallet/shared/Loading';
import Button from '../components/wallet/shared/Button';
import AppNavigation from '../components/navigation/AppNavigation';
import OnboardingFlow from '../components/onboarding/OnboardingFlow';
import FundingPage from '../components/funding/FundingPage';
import { OnboardingData } from '../types/onboarding';

export default function Home() {
  const { login, ready, authenticated, user } = usePrivy();
  const [currentView, setCurrentView] = useState<'onboarding' | 'funding'>('onboarding');

  const handleOnboardingComplete = async (data: OnboardingData) => {
    console.log('Onboarding completed:', data);
    // Here you would typically send the data to your backend
    // await api.submitOnboarding(data);
    // After onboarding is complete, switch to funding view
    setCurrentView('funding');
  };

  const handleOnboardingSave = async (data: Partial<OnboardingData>) => {
    console.log('Onboarding progress saved:', data);
    // Here you would typically auto-save the progress
    // await api.saveOnboardingProgress(data);
  };

  if (!ready) {
    return <Loading fullScreen={true} text="Loading..." />;
  }

  return (
    <Layout>
      {!authenticated ? (
        // Simple login - Privy handles embedded + external wallets
        <div className="text-center py-12 px-6 bg-white dark:bg-gray-800 rounded-lg shadow-md max-w-md mx-auto">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">Convexo</h2>
          <p className="mb-8 text-gray-600 dark:text-gray-300">
            Fintech de crowdfunding internacional para empresas de capital físico intensivo
          </p>
          <Button onClick={login} variant="primary" size="large" className="w-full">
            Connect Wallet
          </Button>
        </div>
      ) : (
        <>
          <AppNavigation
            currentView={currentView}
            onViewChange={setCurrentView}
            user={user}
          />
          
          {currentView === 'onboarding' ? (
            <OnboardingFlow
              onComplete={handleOnboardingComplete}
              onSave={handleOnboardingSave}
            />
          ) : (
            <FundingPage />
          )}
        </>
      )}
    </Layout>
  );
}
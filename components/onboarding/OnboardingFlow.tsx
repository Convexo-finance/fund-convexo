import React, { useState, useCallback } from 'react';
import { OnboardingData, OnboardingStep, OnboardingState, StepStatus } from '../../types/onboarding';
import ProfileForm from './ProfileForm';
import KYBForm from './KYBForm';
import FinancialForm from './FinancialForm';
import BusinessModelForm from './BusinessModelForm';
import PaymentsForm from './PaymentsForm';
import ConsentForm from './ConsentForm';
import ReviewForm from './ReviewForm';

interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => void;
  onSave?: (data: Partial<OnboardingData>) => void;
  initialData?: Partial<OnboardingData>;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  onComplete,
  onSave,
  initialData = {}
}) => {
  const [state, setState] = useState<OnboardingState>({
    currentStep: 'profile',
    data: initialData,
    stepStatuses: {
      profile: { completed: false, valid: false },
      kyb: { completed: false, valid: false },
      financial: { completed: false, valid: false },
      business_model: { completed: false, valid: false },
      payments: { completed: false, valid: false },
      consent: { completed: false, valid: false },
      review: { completed: false, valid: false }
    },
    isSubmitting: false
  });

  const steps: Array<{
    key: OnboardingStep;
    title: string;
    description: string;
    component: React.ComponentType<any>;
  }> = [
    {
      key: 'profile',
      title: 'Perfil',
      description: 'Información de contacto y branding',
      component: ProfileForm
    },
    {
      key: 'kyb',
      title: 'KYB',
      description: 'Verificación de empresa',
      component: KYBForm
    },
    {
      key: 'financial',
      title: 'Datos Financieros',
      description: 'Estados financieros y métricas',
      component: FinancialForm
    },
    {
      key: 'business_model',
      title: 'Modelo de Negocio',
      description: 'Descripción del negocio y tesis de inversión',
      component: BusinessModelForm
    },
    {
      key: 'payments',
      title: 'Pagos',
      description: 'Información bancaria y crypto',
      component: PaymentsForm
    },
    {
      key: 'consent',
      title: 'Consentimientos',
      description: 'Términos legales y firmas',
      component: ConsentForm
    },
    {
      key: 'review',
      title: 'Revisión',
      description: 'Confirmar y enviar aplicación',
      component: ReviewForm
    }
  ];

  const currentStepIndex = steps.findIndex(step => step.key === state.currentStep);
  const currentStepConfig = steps[currentStepIndex];

  const updateStepStatus = useCallback((step: OnboardingStep, status: Partial<StepStatus>) => {
    setState(prev => ({
      ...prev,
      stepStatuses: {
        ...prev.stepStatuses,
        [step]: { ...prev.stepStatuses[step], ...status }
      }
    }));
  }, []);

  const updateData = useCallback((stepData: any, step: OnboardingStep) => {
    const newData = {
      ...state.data,
      [step]: stepData
    };
    
    setState(prev => ({
      ...prev,
      data: newData
    }));

    // Auto-save if callback provided
    if (onSave) {
      onSave(newData);
    }
  }, [state.data, onSave]);

  const goToStep = useCallback((step: OnboardingStep) => {
    setState(prev => ({
      ...prev,
      currentStep: step
    }));
  }, []);

  const goToNext = useCallback(() => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      const nextStep = steps[nextIndex].key;
      
      // Mark current step as completed
      updateStepStatus(state.currentStep, { completed: true, valid: true });
      
      goToStep(nextStep);
    } else if (currentStepIndex === steps.length - 1) {
      // Last step - complete onboarding
      handleComplete();
    }
  }, [currentStepIndex, state.currentStep, updateStepStatus]);

  const goToPrevious = useCallback(() => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      goToStep(steps[prevIndex].key);
    }
  }, [currentStepIndex]);

  const handleComplete = async () => {
    setState(prev => ({ ...prev, isSubmitting: true }));
    
    try {
      // Validate all steps are completed
      const incompleteSteps = Object.entries(state.stepStatuses)
        .filter(([key, status]) => key !== 'review' && !status.completed)
        .map(([key]) => key);

      if (incompleteSteps.length > 0) {
        throw new Error(`Please complete the following steps: ${incompleteSteps.join(', ')}`);
      }

      // Complete the onboarding
      await onComplete(state.data as OnboardingData);
      
      updateStepStatus('review', { completed: true, valid: true });
    } catch (error) {
      setState(prev => ({
        ...prev,
        submissionError: error instanceof Error ? error.message : 'An error occurred'
      }));
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  const getStepIcon = (step: OnboardingStep, index: number) => {
    const status = state.stepStatuses[step];
    const isCurrent = step === state.currentStep;
    const isCompleted = status.completed;
    
    if (isCompleted) {
      return (
        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      );
    }
    
    if (isCurrent) {
      return (
        <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
          <span className="text-white font-medium">{index + 1}</span>
        </div>
      );
    }
    
    return (
      <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
        <span className="text-gray-600 dark:text-gray-400 font-medium">{index + 1}</span>
      </div>
    );
  };

  const CurrentComponent = currentStepConfig.component;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header with stepper */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Onboarding Convexo
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Complete su proceso de registro para acceder a oportunidades de inversión
            </p>
          </div>
          
          {/* Stepper */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.key} className="flex items-center">
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => goToStep(step.key)}
                    disabled={!state.stepStatuses[step.key].completed && step.key !== state.currentStep}
                    className="mb-2 disabled:cursor-not-allowed"
                  >
                    {getStepIcon(step.key, index)}
                  </button>
                  <div className="text-center">
                    <p className={`text-sm font-medium ${
                      step.key === state.currentStep 
                        ? 'text-purple-600 dark:text-purple-400' 
                        : state.stepStatuses[step.key].completed
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 max-w-24 break-words">
                      {step.description}
                    </p>
                  </div>
                </div>
                
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-px mx-4 ${
                    state.stepStatuses[step.key].completed 
                      ? 'bg-green-300' 
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {state.submissionError && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-800 dark:text-red-200">{state.submissionError}</p>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <CurrentComponent
            data={state.data[state.currentStep] || {}}
            onChange={(data: any) => updateData(data, state.currentStep)}
            onNext={goToNext}
            onPrevious={currentStepIndex > 0 ? goToPrevious : undefined}
            isSubmitting={state.isSubmitting}
          />
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;

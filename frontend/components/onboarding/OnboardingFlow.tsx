/**
 * OnboardingFlow Component
 * Multi-step onboarding process for personalized learning setup
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useLearningStore } from '../../store/learningStore';
import { useAuthUser } from '../../store/authStore';
import {
  ChevronRightIcon,
  ChevronLeftIcon,
  CheckCircleIcon,
  LightBulbIcon,
  TrophyIcon,
  ChartBarIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

interface OnboardingFlowProps {
  onComplete?: () => void;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const router = useRouter();
  const user = useAuthUser();
  const {
    onboardingStep,
    isLoading,
    error,
    startOnboarding,
    completeOnboardingStep,
    submitOnboardingProfile,
    clearError,
  } = useLearningStore();

  // Form state
  const [formData, setFormData] = useState({
    riskProfile: '',
    investmentGoals: [] as string[],
    timeHorizon: '',
    learningStyle: '',
    preferredTopics: [] as string[],
  });

  // Initialize onboarding
  useEffect(() => {
    if (user && onboardingStep === 0) {
      startOnboarding();
    }
  }, [user, onboardingStep, startOnboarding]);

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleNext = () => {
    if (onboardingStep < 5) {
      completeOnboardingStep(onboardingStep);
    }
  };

  const handleBack = () => {
    if (onboardingStep > 1) {
      completeOnboardingStep(onboardingStep - 2);
    }
  };

  const handleSubmit = async () => {
    try {
      await submitOnboardingProfile(formData);
      onComplete?.();
      router.push('/dashboard');
    } catch (err) {
      console.error('Onboarding submission failed:', err);
    }
  };

  const updateFormData = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayValue = (
    field: 'investmentGoals' | 'preferredTopics',
    value: string
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value],
    }));
  };

  const isStepValid = () => {
    switch (onboardingStep) {
      case 2:
        return formData.riskProfile !== '';
      case 3:
        return formData.investmentGoals.length > 0;
      case 4:
        return formData.timeHorizon !== '';
      case 5:
        return formData.learningStyle !== '';
      default:
        return true;
    }
  };

  const renderStep = () => {
    switch (onboardingStep) {
      case 1:
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <LightBulbIcon className="h-10 w-10 text-indigo-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to Your Investment Journey!
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Let's personalize your learning experience to match your goals,
              risk tolerance, and learning style. This will take just 2-3
              minutes.
            </p>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
              <div className="text-center p-4">
                <TrophyIcon className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900">
                  Personalized Path
                </h3>
                <p className="text-sm text-gray-600">
                  AI-curated lessons based on your profile
                </p>
              </div>
              <div className="text-center p-4">
                <ChartBarIcon className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900">Track Progress</h3>
                <p className="text-sm text-gray-600">
                  Visual progress tracking and achievements
                </p>
              </div>
              <div className="text-center p-4">
                <ClockIcon className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900">Smart Nudges</h3>
                <p className="text-sm text-gray-600">
                  Gentle reminders to keep you on track
                </p>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              What's your investment risk tolerance?
            </h2>
            <p className="text-gray-600 mb-6">
              This helps us recommend the right investment strategies for you.
            </p>
            <div className="space-y-4">
              {[
                {
                  value: 'conservative',
                  title: 'Conservative',
                  description:
                    'I prefer stable, low-risk investments even if returns are lower',
                },
                {
                  value: 'moderate',
                  title: 'Moderate',
                  description:
                    'I want balanced growth with some risk for better returns',
                },
                {
                  value: 'aggressive',
                  title: 'Aggressive',
                  description:
                    "I'm comfortable with high risk for potentially high returns",
                },
              ].map(option => (
                <label
                  key={option.value}
                  className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.riskProfile === option.value
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="riskProfile"
                    value={option.value}
                    checked={formData.riskProfile === option.value}
                    onChange={e =>
                      updateFormData('riskProfile', e.target.value)
                    }
                    className="sr-only"
                  />
                  <div className="flex items-center">
                    <div
                      className={`w-4 h-4 rounded-full border-2 mr-3 ${
                        formData.riskProfile === option.value
                          ? 'border-indigo-500 bg-indigo-500'
                          : 'border-gray-300'
                      }`}
                    >
                      {formData.riskProfile === option.value && (
                        <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {option.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              What are your investment goals?
            </h2>
            <p className="text-gray-600 mb-6">
              Select all that apply. We'll tailor content to help you achieve
              these goals.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { value: 'retirement', label: 'Retirement Planning' },
                { value: 'house', label: 'Buying a Home' },
                { value: 'emergency', label: 'Emergency Fund' },
                { value: 'education', label: 'Education Funding' },
                { value: 'wealth', label: 'Building Wealth' },
                { value: 'income', label: 'Passive Income' },
                { value: 'travel', label: 'Travel & Experiences' },
                { value: 'business', label: 'Starting a Business' },
              ].map(goal => (
                <label
                  key={goal.value}
                  className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.investmentGoals.includes(goal.value)
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.investmentGoals.includes(goal.value)}
                    onChange={() =>
                      toggleArrayValue('investmentGoals', goal.value)
                    }
                    className="sr-only"
                  />
                  <div className="flex items-center">
                    <div
                      className={`w-5 h-5 border-2 rounded mr-3 flex items-center justify-center ${
                        formData.investmentGoals.includes(goal.value)
                          ? 'border-indigo-500 bg-indigo-500'
                          : 'border-gray-300'
                      }`}
                    >
                      {formData.investmentGoals.includes(goal.value) && (
                        <CheckCircleIcon className="h-3 w-3 text-white" />
                      )}
                    </div>
                    <span className="font-medium text-gray-900">
                      {goal.label}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              What's your investment time horizon?
            </h2>
            <p className="text-gray-600 mb-6">
              When do you plan to use the money you're investing?
            </p>
            <div className="space-y-4">
              {[
                {
                  value: 'short_term',
                  title: 'Short-term (1-3 years)',
                  description: 'I need access to this money soon',
                },
                {
                  value: 'medium_term',
                  title: 'Medium-term (3-10 years)',
                  description:
                    'I can wait several years before needing this money',
                },
                {
                  value: 'long_term',
                  title: 'Long-term (10+ years)',
                  description: "I'm investing for the distant future",
                },
              ].map(option => (
                <label
                  key={option.value}
                  className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.timeHorizon === option.value
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="timeHorizon"
                    value={option.value}
                    checked={formData.timeHorizon === option.value}
                    onChange={e =>
                      updateFormData('timeHorizon', e.target.value)
                    }
                    className="sr-only"
                  />
                  <div className="flex items-center">
                    <div
                      className={`w-4 h-4 rounded-full border-2 mr-3 ${
                        formData.timeHorizon === option.value
                          ? 'border-indigo-500 bg-indigo-500'
                          : 'border-gray-300'
                      }`}
                    >
                      {formData.timeHorizon === option.value && (
                        <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {option.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              How do you prefer to learn?
            </h2>
            <p className="text-gray-600 mb-6">
              We'll customize the content format to match your learning style.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                {
                  value: 'visual',
                  title: 'Visual Learner',
                  description:
                    'I learn best with charts, diagrams, and infographics',
                },
                {
                  value: 'reading',
                  title: 'Reading/Writing',
                  description:
                    'I prefer detailed articles and written explanations',
                },
                {
                  value: 'auditory',
                  title: 'Auditory Learner',
                  description:
                    'I learn well through podcasts and audio content',
                },
                {
                  value: 'kinesthetic',
                  title: 'Hands-on Learner',
                  description:
                    'I learn by doing - simulations and interactive tools',
                },
              ].map(option => (
                <label
                  key={option.value}
                  className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.learningStyle === option.value
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="learningStyle"
                    value={option.value}
                    checked={formData.learningStyle === option.value}
                    onChange={e =>
                      updateFormData('learningStyle', e.target.value)
                    }
                    className="sr-only"
                  />
                  <div className="flex items-center">
                    <div
                      className={`w-4 h-4 rounded-full border-2 mr-3 ${
                        formData.learningStyle === option.value
                          ? 'border-indigo-500 bg-indigo-500'
                          : 'border-gray-300'
                      }`}
                    >
                      {formData.learningStyle === option.value && (
                        <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {option.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircleIcon className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Perfect! Your personalized path is ready.
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Based on your preferences, we've created a customized learning
              journey that will help you achieve your investment goals.
            </p>
            <div className="bg-indigo-50 rounded-lg p-6 mb-8 max-w-2xl mx-auto">
              <h3 className="font-semibold text-indigo-900 mb-2">
                Your Profile Summary:
              </h3>
              <div className="text-sm text-indigo-700 space-y-1">
                <p>
                  <strong>Risk Profile:</strong> {formData.riskProfile}
                </p>
                <p>
                  <strong>Goals:</strong> {formData.investmentGoals.join(', ')}
                </p>
                <p>
                  <strong>Time Horizon:</strong>{' '}
                  {formData.timeHorizon.replace('_', ' ')}
                </p>
                <p>
                  <strong>Learning Style:</strong> {formData.learningStyle}
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">
          Please log in to continue with onboarding.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {onboardingStep} of 6
            </span>
            <span className="text-sm text-gray-500">
              {Math.round((onboardingStep / 6) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(onboardingStep / 6) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          {renderStep()}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={handleBack}
            disabled={onboardingStep <= 1}
            className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all ${
              onboardingStep <= 1
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <ChevronLeftIcon className="h-5 w-5 mr-2" />
            Back
          </button>

          {onboardingStep < 6 ? (
            <button
              onClick={handleNext}
              disabled={!isStepValid() || isLoading}
              className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all ${
                isStepValid() && !isLoading
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isLoading ? 'Processing...' : 'Continue'}
              <ChevronRightIcon className="h-5 w-5 ml-2" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className={`flex items-center px-8 py-3 rounded-lg font-medium transition-all ${
                !isLoading
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isLoading ? 'Setting up your path...' : 'Start Learning Journey'}
              <ChevronRightIcon className="h-5 w-5 ml-2" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;

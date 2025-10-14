import React, { useState, useMemo, useCallback } from 'react';

// --- Interface/Type Definitions (kept as is) ---

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  experienceLevel: string;
  investmentGoals: string[];
  riskTolerance: string;
  preferredAssetClasses: string[];
  timeHorizon: string;
  initialCapital: number;
  monthlyContribution: number;
  riskScore: number;
}

// --- Extracted Component Interfaces (for type safety) ---

// Placeholder for an extracted component to handle a single form field group
interface FormGroupProps extends React.PropsWithChildren {
    label: string;
    htmlFor?: string;
    description?: string;
    className?: string;
}

// --- Extracted Components (defined for completeness, would be in separate files) ---

const FormGroup: React.FC<FormGroupProps> = ({ label, htmlFor, description, children, className = '' }) => (
    <div className={`flex flex-col space-y-2 ${className}`}>
        <label htmlFor={htmlFor} className="text-sm font-medium text-gray-700">
            {label}
        </label>
        {children}
        {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
    </div>
);

const ProgressHeader: React.FC<{ progress: number }> = ({ progress }) => (
    <div className="mb-8 p-4 bg-white border border-blue-100 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-700">Profile Completion</span>
            <span className="text-sm font-bold text-blue-600">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
            ></div>
        </div>
    </div>
);

// --- Main Refactored Component ---

const initialFormData: ProfileFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  experienceLevel: 'beginner',
  investmentGoals: [],
  riskTolerance: 'moderate', // Changed from 'medium' to match a radio option value
  preferredAssetClasses: [],
  timeHorizon: '5-10',
  initialCapital: 10000,
  monthlyContribution: 500,
  riskScore: 5,
};

export default function ProfileForm() {
  const [formData, setFormData] = useState<ProfileFormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Progress is now calculated based on filled fields for dynamic behavior
  const progress = useMemo(() => {
    // A slightly more realistic calculation: count personal info (4) + 4 profile questions
    const relevantFields = 8;
    const personalInfoFilled = [formData.firstName, formData.lastName, formData.email, formData.phone].filter(v => v.trim() !== '').length;
    const profileFieldsFilled = (formData.investmentGoals.length > 0 ? 1 : 0) + 
                                (formData.experienceLevel !== 'beginner' ? 1 : 0) + 
                                (formData.riskTolerance !== 'moderate' ? 1 : 0) + 
                                (formData.initialCapital > 0 ? 1 : 0);

    const calculatedProgress = Math.round(((personalInfoFilled + profileFieldsFilled) / relevantFields) * 100);

    // Clamp the value, or return the hardcoded 30 if you prefer static progress
    return Math.min(100, calculatedProgress || 30); 
  }, [formData]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Simulate API delay for a better user experience on success
      await new Promise(resolve => setTimeout(resolve, 500)); 
      
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile. Status: ' + response.status);
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  // Use useCallback for handler functions for performance and stability
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      const key = name as keyof ProfileFormData;
      const currentValues = [...formData[key] as string[]];
      
      setFormData(prevData => ({
        ...prevData,
        [name]: checked
          ? [...currentValues, value]
          : currentValues.filter(item => item !== value)
      }));
    } else {
      setFormData(prevData => ({
        ...prevData,
        [name]: type === 'number' ? parseFloat(value) || 0 : value
      }));
    }
  }, [formData]);


  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 bg-white shadow-xl rounded-xl border border-gray-100">
      
      <h1 className="text-3xl font-bold text-gray-900 mb-6 font-serif">Investor Profile Setup</h1>

      {/* Extracted Progress Bar */}
      <ProgressHeader progress={progress} />

      <form onSubmit={handleSubmit} className="space-y-10">
        
        {/* Personal Information Section */}
        <section className="p-6 border border-gray-200 rounded-lg bg-gray-50/50">
          <h2 className="text-xl font-semibold text-blue-800 mb-6 border-b pb-3 border-blue-100">
            1. Personal Information 📝
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormGroup label="First Name" htmlFor="firstName">
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5"
                required
              />
            </FormGroup>

            <FormGroup label="Last Name" htmlFor="lastName">
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5"
                required
              />
            </FormGroup>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <FormGroup label="Email" htmlFor="email">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5"
                required
              />
            </FormGroup>

            <FormGroup label="Phone" htmlFor="phone" description="Optional: Used for important account alerts.">
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5"
              />
            </FormGroup>
          </div>
        </section>

        {/* Investment Profile Section */}
        <section className="p-6 border border-gray-200 rounded-lg bg-gray-50/50">
          <h2 className="text-xl font-semibold text-blue-800 mb-6 border-b pb-3 border-blue-100">
            2. Investment Profile 📊
          </h2>

          <FormGroup label="Investment Experience" htmlFor="experienceLevel" className="mb-6">
            <select
              id="experienceLevel"
              name="experienceLevel"
              value={formData.experienceLevel}
              onChange={handleInputChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 bg-white"
              required
            >
              <option value="beginner">Beginner (0-2 years)</option>
              <option value="intermediate">Intermediate (2-5 years)</option>
              <option value="advanced">Advanced (5+ years)</option>
              <option value="professional">Professional</option>
            </select>
          </FormGroup>

          <FormGroup label="Investment Goals" description="Select all that apply." className="mb-6">
            <div className="flex flex-wrap gap-4">
              {['Retirement', 'Wealth Building', 'Education', 'Major Purchase', 'Other'].map((goal) => (
                <label key={goal} className="inline-flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    name="investmentGoals"
                    value={goal.toLowerCase().replace(' ', '-')}
                    checked={formData.investmentGoals.includes(goal.toLowerCase().replace(' ', '-'))}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span>{goal}</span>
                </label>
              ))}
            </div>
          </FormGroup>

          <FormGroup label="Risk Tolerance" description="How willing are you to accept market fluctuations for higher potential returns?" className="mb-6">
            <div className="flex flex-wrap gap-4 items-center">
              {[
                { value: 'conservative', label: 'Conservative' },
                { value: 'moderate', label: 'Moderate' },
                { value: 'balanced', label: 'Balanced' },
                { value: 'growth', label: 'Growth' },
                { value: 'aggressive', label: 'Aggressive' },
              ].map((option) => (
                <label key={option.value} className="inline-flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="radio"
                    name="riskTolerance"
                    value={option.value}
                    checked={formData.riskTolerance === option.value}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      formData.riskTolerance === option.value ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}>
                      {option.label}
                  </span>
                </label>
              ))}
            </div>
          </FormGroup>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormGroup label="Initial Investment Capital" htmlFor="initialCapital">
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  id="initialCapital"
                  name="initialCapital"
                  value={formData.initialCapital}
                  onChange={handleInputChange}
                  min="0"
                  step="100"
                  className="block w-full pl-7 pr-3 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5"
                  required
                />
              </div>
            </FormGroup>

            <FormGroup label="Monthly Contribution" htmlFor="monthlyContribution">
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  id="monthlyContribution"
                  name="monthlyContribution"
                  value={formData.monthlyContribution}
                  onChange={handleInputChange}
                  min="0"
                  step="10"
                  className="block w-full pl-7 pr-3 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5"
                  required
                />
              </div>
            </FormGroup>
          </div>
        </section>

        {/* Success/Error Messages */}
        <div className="min-h-[40px] flex justify-center items-center">
            {success && (
                <div className="w-full p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center justify-center transition-all duration-300">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                    Profile updated successfully!
                </div>
            )}
            {error && (
                <div className="w-full p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center justify-center transition-all duration-300">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path></svg>
                    {error}
                </div>
            )}
        </div>


        <div className="flex justify-between gap-4 pt-4 border-t border-gray-200">
          <button
            type="button"
            className="flex-1 inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm disabled:opacity-50"
            onClick={() => window.history.back()}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={loading}
          >
            {loading ? (
                <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Saving...
                </span>
            ) : (
                'Save Changes'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
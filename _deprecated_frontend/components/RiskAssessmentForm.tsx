import React, { useState } from 'react';

interface RiskAssessmentFormProps {
  onSubmit: (data: any) => void;
  loading: boolean;
  error: string | null;
}

const initialState = {
  // Step 1: Personal Details
  age: '',
  gender: '',
  marital_status: '',
  employment_status: '',
  is_retired: false,
  region: '',
  is_immigrant: false,
  // Step 2: Financial Profile
  income: '',
  assets: '',
  liabilities: '',
  expenses: '',
  credit_score: '',
  // Step 3: Behavior & Goals
  investment_experience: 5,
  risk_tolerance: 5,
  market_volatility: 0,
  industry_risk: 0,
  economic_outlook: 0,
  dependents: '',
  education_level: '',
  primary_goal: '',
};

const steps = [
  'Personal Details',
  'Financial Profile',
  'Behavior & Goals',
];

export default function RiskAssessmentForm({ onSubmit, loading, error }: RiskAssessmentFormProps) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<any>(initialState);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm((prev: any) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...form,
      age: Number(form.age),
      income: Number(form.income),
      assets: Number(form.assets),
      liabilities: Number(form.liabilities),
      expenses: Number(form.expenses),
      credit_score: Number(form.credit_score),
      investment_experience: Number(form.investment_experience),
      risk_tolerance: Number(form.risk_tolerance),
      market_volatility: Number(form.market_volatility),
      industry_risk: Number(form.industry_risk),
      economic_outlook: Number(form.economic_outlook),
      dependents: Number(form.dependents),
      is_retired: Boolean(form.is_retired),
      is_immigrant: Boolean(form.is_immigrant),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-8 w-full max-w-lg">
      <div className="mb-6">
        <div className="text-indigo-700 font-bold mb-2">Step {step + 1} of {steps.length}: {steps[step]}</div>
      </div>
      {step === 0 && (
        <div className="space-y-4">
          <input name="age" type="number" min="18" max="100" placeholder="Age" value={form.age} onChange={handleChange} className="input" required />
          <select name="gender" value={form.gender} onChange={handleChange} className="input" required>
            <option value="">Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="unspecified">Prefer not to say</option>
          </select>
          <select name="marital_status" value={form.marital_status} onChange={handleChange} className="input" required>
            <option value="">Marital Status</option>
            <option value="single">Single</option>
            <option value="married">Married</option>
            <option value="divorced">Divorced</option>
            <option value="widowed">Widowed</option>
          </select>
          <select name="employment_status" value={form.employment_status} onChange={handleChange} className="input" required>
            <option value="">Employment Status</option>
            <option value="employed">Employed</option>
            <option value="unemployed">Unemployed</option>
            <option value="student">Student</option>
            <option value="retired">Retired</option>
          </select>
          <label className="flex items-center">
            <input type="checkbox" name="is_retired" checked={form.is_retired} onChange={handleChange} className="mr-2" />
            Retired
          </label>
          <input name="region" type="text" placeholder="Country/Region" value={form.region} onChange={handleChange} className="input" required />
          <label className="flex items-center">
            <input type="checkbox" name="is_immigrant" checked={form.is_immigrant} onChange={handleChange} className="mr-2" />
            Immigrant
          </label>
        </div>
      )}
      {step === 1 && (
        <div className="space-y-4">
          <input name="income" type="number" min="0" placeholder="Annual Income (USD)" value={form.income} onChange={handleChange} className="input" required />
          <input name="assets" type="number" min="0" placeholder="Total Assets (USD)" value={form.assets} onChange={handleChange} className="input" required />
          <input name="liabilities" type="number" min="0" placeholder="Total Liabilities (USD)" value={form.liabilities} onChange={handleChange} className="input" required />
          <input name="expenses" type="number" min="0" placeholder="Annual Expenses (USD)" value={form.expenses} onChange={handleChange} className="input" required />
          <input name="credit_score" type="number" min="300" max="900" placeholder="Credit Score" value={form.credit_score} onChange={handleChange} className="input" required />
        </div>
      )}
      {step === 2 && (
        <div className="space-y-4">
          <label className="block">Investment Experience (1-10)
            <input name="investment_experience" type="range" min="1" max="10" value={form.investment_experience} onChange={handleChange} className="w-full" />
            <span className="ml-2">{form.investment_experience}</span>
          </label>
          <label className="block">Risk Tolerance (1-10)
            <input name="risk_tolerance" type="range" min="1" max="10" value={form.risk_tolerance} onChange={handleChange} className="w-full" />
            <span className="ml-2">{form.risk_tolerance}</span>
          </label>
          <label className="block">Market Volatility Perception (-10 to 10)
            <input name="market_volatility" type="range" min="-10" max="10" value={form.market_volatility} onChange={handleChange} className="w-full" />
            <span className="ml-2">{form.market_volatility}</span>
          </label>
          <label className="block">Industry Risk Perception (-10 to 10)
            <input name="industry_risk" type="range" min="-10" max="10" value={form.industry_risk} onChange={handleChange} className="w-full" />
            <span className="ml-2">{form.industry_risk}</span>
          </label>
          <label className="block">Economic Outlook (-10 to 10)
            <input name="economic_outlook" type="range" min="-10" max="10" value={form.economic_outlook} onChange={handleChange} className="w-full" />
            <span className="ml-2">{form.economic_outlook}</span>
          </label>
          <input name="dependents" type="number" min="0" placeholder="Number of Dependents" value={form.dependents} onChange={handleChange} className="input" required />
          <select name="education_level" value={form.education_level} onChange={handleChange} className="input" required>
            <option value="">Education Level</option>
            <option value="high_school">High School</option>
            <option value="bachelor">Bachelor&apos;s</option>
            <option value="master">Master&apos;s</option>
            <option value="doctorate">Doctorate</option>
            <option value="other">Other</option>
          </select>
          <select name="primary_goal" value={form.primary_goal} onChange={handleChange} className="input">
            <option value="">Primary Financial Goal</option>
            <option value="retirement">Retirement</option>
            <option value="income">Income</option>
            <option value="growth">Growth</option>
            <option value="preservation">Preservation</option>
          </select>
        </div>
      )}
      <div className="flex justify-between mt-8">
        {step > 0 && (
          <button type="button" onClick={prevStep} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Back</button>
        )}
        {step < steps.length - 1 && (
          <button type="button" onClick={nextStep} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Next</button>
        )}
        {step === steps.length - 1 && (
          <button type="submit" className="px-6 py-2 bg-indigo-700 text-white rounded-lg font-semibold hover:bg-indigo-800 transition" disabled={loading}>
            {loading ? 'Assessing...' : 'Submit'}
          </button>
        )}
      </div>
      {error && <div className="text-red-500 mt-4">{error}</div>}
    </form>
  );
}

import { useState } from 'react';

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

export default function ProfileForm() {
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    experienceLevel: 'beginner',
    investmentGoals: [],
    riskTolerance: 'medium',
    preferredAssetClasses: [],
    timeHorizon: '5-10',
    initialCapital: 10000,
    monthlyContribution: 500,
    riskScore: 5,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [progress, setProgress] = useState(30);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      const currentValues = [...formData[name as keyof ProfileFormData] as string[]];
      
      setFormData({
        ...formData,
        [name]: checked
          ? [...currentValues, value]
          : currentValues.filter(item => item !== value)
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'number' ? parseFloat(value) || 0 : value
      });
    }
  };

  // Render form fields here...
  return (
    <div className="nyse-profile-form-container">
      {/* Progress Bar */}
      <div className="profile-progress">
        <div className="progress-header">
          <span className="progress-label">Profile Completion</span>
          <span className="progress-percentage">{progress}%</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="nyse-profile-form">
        {/* Personal Information Section */}
        <section className="form-section">
          <h2 className="section-title">Personal Information</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName" className="form-label">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="form-control"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName" className="form-label">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="form-control"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="form-control"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone" className="form-label">Phone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="form-control"
              />
            </div>
          </div>
        </section>

        {/* Investment Profile Section */}
        <section className="form-section">
          <h2 className="section-title">Investment Profile</h2>

          <div className="form-group">
            <label htmlFor="experienceLevel" className="form-label">
              Investment Experience
            </label>
            <select
              id="experienceLevel"
              name="experienceLevel"
              value={formData.experienceLevel}
              onChange={handleInputChange}
              className="form-control"
              required
            >
              <option value="beginner">Beginner (0-2 years)</option>
              <option value="intermediate">Intermediate (2-5 years)</option>
              <option value="advanced">Advanced (5+ years)</option>
              <option value="professional">Professional</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Investment Goals</label>
            <div className="checkbox-group">
              {['Retirement', 'Wealth Building', 'Education', 'Major Purchase', 'Other'].map((goal) => (
                <label key={goal} className="checkbox-label">
                  <input
                    type="checkbox"
                    name="investmentGoals"
                    value={goal.toLowerCase()}
                    checked={formData.investmentGoals.includes(goal.toLowerCase())}
                    onChange={handleInputChange}
                  />
                  {goal}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Risk Tolerance</label>
            <div className="radio-group">
              {[
                { value: 'conservative', label: 'Conservative' },
                { value: 'moderate', label: 'Moderate' },
                { value: 'balanced', label: 'Balanced' },
                { value: 'growth', label: 'Growth' },
                { value: 'aggressive', label: 'Aggressive' },
              ].map((option) => (
                <label key={option.value} className="radio-label">
                  <input
                    type="radio"
                    name="riskTolerance"
                    value={option.value}
                    checked={formData.riskTolerance === option.value}
                    onChange={handleInputChange}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="initialCapital" className="form-label">
                Initial Investment Capital
              </label>
              <div className="input-with-prefix">
                <span className="input-prefix">$</span>
                <input
                  type="number"
                  id="initialCapital"
                  name="initialCapital"
                  value={formData.initialCapital}
                  onChange={handleInputChange}
                  min="0"
                  step="100"
                  className="form-control"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="monthlyContribution" className="form-label">
                Monthly Contribution
              </label>
              <div className="input-with-prefix">
                <span className="input-prefix">$</span>
                <input
                  type="number"
                  id="monthlyContribution"
                  name="monthlyContribution"
                  value={formData.monthlyContribution}
                  onChange={handleInputChange}
                  min="0"
                  step="10"
                  className="form-control"
                  required
                />
              </div>
            </div>
          </div>
        </section>

        {/* Success/Error Messages */}
        {success && (
          <div className="alert alert-success">
            Profile updated successfully!
          </div>
        )}
        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => window.history.back()}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>

      <style jsx>{`
        .nyse-profile-form-container {
          max-width: 800px;
          margin: 2rem auto;
          padding: 2rem;
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .profile-progress {
          margin-bottom: 2rem;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
          color: #555;
        }

        .progress-bar {
          height: 8px;
          background: #f0f0f0;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: #4caf50;
          transition: width 0.3s ease;
        }

        .form-section {
          margin-bottom: 2.5rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid #eee;
        }

        .section-title {
          font-size: 1.25rem;
          margin-bottom: 1.5rem;
          color: #333;
        }

        .form-row {
          display: flex;
          gap: 1.5rem;
          margin-bottom: 1rem;
        }

        .form-group {
          flex: 1;
          margin-bottom: 1.25rem;
        }

        .form-label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #444;
        }

        .form-control {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
          transition: border-color 0.2s;
        }

        .form-control:focus {
          outline: none;
          border-color: #4a90e2;
          box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
        }

        .input-with-prefix {
          position: relative;
        }

        .input-prefix {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #777;
        }

        .input-with-prefix .form-control {
          padding-left: 30px;
        }

        .checkbox-group,
        .radio-group {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .checkbox-label,
        .radio-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          font-weight: 400;
          color: #444;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid #eee;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 4px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .btn-primary {
          background: #4a90e2;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #3a7bc8;
        }

        .btn-secondary {
          background: #f0f0f0;
          color: #333;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #e0e0e0;
        }

        .alert {
          padding: 1rem;
          margin-bottom: 1.5rem;
          border-radius: 4px;
          font-size: 0.95rem;
        }

        .alert-success {
          background: #e8f5e9;
          color: #2e7d32;
          border: 1px solid #c8e6c9;
        }

        .alert-error {
          background: #ffebee;
          color: #c62828;
          border: 1px solid #ffcdd2;
        }

        @media (max-width: 768px) {
          .form-row {
            flex-direction: column;
            gap: 1rem;
          }
          
          .nyse-profile-form-container {
            padding: 1rem;
            margin: 1rem;
          }
          
          .form-actions {
            flex-direction: column;
            gap: 0.75rem;
          }
          
          .btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

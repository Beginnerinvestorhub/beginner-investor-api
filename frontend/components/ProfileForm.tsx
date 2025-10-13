import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { profileValidationSchema } from '../lib/validationSchemas';
import { useAuth } from '../hooks/useAuth'; // Assuming a hook that provides the Firebase user
import axios from 'axios'; // Using axios as in the original component

interface ProfileFormData {
  firstName: string;
  lastName: string;
  riskTolerance: 'conservative' | 'moderate' | 'aggressive' | '';
  goals?: string;
}

const riskOptions = [
  { value: 'conservative', label: 'Conservative' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'aggressive', label: 'Aggressive' },
];

export default function ProfileForm() {
  const { user } = useAuth();
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ProfileFormData>({
    resolver: yupResolver(profileValidationSchema),
    mode: 'onChange', // Validate on change for immediate feedback
    defaultValues: {
      firstName: '',
      lastName: '',
      riskTolerance: '',
      goals: '',
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/profile`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        // The old form had a single 'name' field. We adapt to firstName/lastName.
        // Assuming backend returns firstName, lastName, riskTolerance, goals directly
        reset({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          riskTolerance: data.riskTolerance || '',
          goals: data.goals || '',
        });
      } catch (error) {
        setStatusMessage({ type: 'error', message: 'Failed to load profile.' });
      }
    };
    fetchProfile();
  }, [user, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;
    setStatusMessage(null);
    try {
      const token = await user.getIdToken();
      // The backend route is PUT for updates
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/profile`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setStatusMessage({
        type: 'success',
        message: 'Profile saved successfully!',
      });
      // No need to reset(data) here as formState.isDirty will be reset by react-hook-form automatically
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'An unexpected error occurred.';
      setStatusMessage({ type: 'error', message });
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold mb-6 text-indigo-700">Profile</h2>
      {user?.email && (
        <p className="mb-4">
          Email: <span className="font-mono">{user.email}</span>
        </p>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label
            htmlFor="firstName"
            className="block text-sm font-medium text-gray-700"
          >
            First Name
          </label>
          <input
            type="text"
            id="firstName"
            {...register('firstName')}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 ${errors.firstName ? 'border-red-500' : ''}`}
            disabled={isSubmitting}
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-600">
              {errors.firstName.message}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="lastName"
            className="block text-sm font-medium text-gray-700"
          >
            Last Name
          </label>
          <input
            type="text"
            id="lastName"
            {...register('lastName')}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 ${errors.lastName ? 'border-red-500' : ''}`}
            disabled={isSubmitting}
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-600">
              {errors.lastName.message}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="riskTolerance"
            className="block text-sm font-medium text-gray-700"
          >
            Risk Tolerance
          </label>
          <select
            id="riskTolerance"
            {...register('riskTolerance')}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 ${errors.riskTolerance ? 'border-red-500' : ''}`}
            disabled={isSubmitting}
          >
            <option value="">Select...</option>
            {riskOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.riskTolerance && (
            <p className="mt-1 text-sm text-red-600">
              {errors.riskTolerance.message}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="goals"
            className="block text-sm font-medium text-gray-700"
          >
            Investment Goals (Optional)
          </label>
          <textarea
            id="goals"
            {...register('goals')}
            rows={3}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 ${errors.goals ? 'border-red-500' : ''}`}
            disabled={isSubmitting}
          />
          {errors.goals && (
            <p className="mt-1 text-sm text-red-600">{errors.goals.message}</p>
          )}
        </div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting || !isValid}
        >
          {isSubmitting ? 'Saving...' : 'Save Profile'}
        </button>
        {statusMessage && (
          <p
            className={`mt-3 text-center text-sm ${statusMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}
          >
            {statusMessage.message}
          </p>
        )}
      </form>
    </div>
  );
}

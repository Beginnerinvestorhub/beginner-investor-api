/**
 * AdvancedAnalyticsDashboard Component
 * Real-time analytics and AI insights for administrators and power users
 */

import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  UserGroupIcon,
  TrendingUpIcon,
  ExclamationTriangleIcon,
  CogIcon,
  RefreshIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface UserInsights {
  user_id: string;
  engagement_score: number;
  completion_probability: number;
  churn_risk: number;
  learning_velocity: number;
  preferred_content_types: string[];
  learning_trajectory: {
    daily_progress: Array<{
      date: string;
      daily_completions: number;
      cumulative_completions: number;
    }>;
    total_days_active: number;
    avg_daily_completions: number;
  };
  behavioral_segment: string;
  recommendations: {
    intervention_needed: boolean;
    suggested_content_type: string;
    optimal_session_length: number;
  };
}

interface CohortAnalysis {
  cohort_period: string;
  cohorts: Array<{
    period: string;
    cohort_size: number;
    week_1_retention_rate: number;
    month_1_retention_rate: number;
    avg_completion_rate: number;
  }>;
  summary: {
    total_cohorts: number;
    avg_week_1_retention: number;
    avg_month_1_retention: number;
    avg_completion_rate: number;
  };
}

interface ModelPerformance {
  model_status: string;
  last_update: string;
  nudge_performance: Array<{
    nudge_type: string;
    total_sent: number;
    click_rate: number;
    completion_rate: number;
    avg_effectiveness: number;
  }>;
  recommendation_accuracy: number;
  overall_performance_score: number;
}

const AdvancedAnalyticsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'insights' | 'cohorts' | 'performance'>('insights');
  const [userInsights, setUserInsights] = useState<UserInsights | null>(null);
  const [cohortData, setCohortData] = useState<CohortAnalysis | null>(null);
  const [modelPerformance, setModelPerformance] = useState<ModelPerformance | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState('demo-user-123');
  const [isRetraining, setIsRetraining] = useState(false);

  const AI_API_URL = process.env.NEXT_PUBLIC_AI_API_URL || 'http://localhost:8000';

  const fetchUserInsights = async (userId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${AI_API_URL}/analytics/user-insights?user_id=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch user insights');
      const data = await response.json();
      setUserInsights(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user insights');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCohortAnalysis = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${AI_API_URL}/analytics/cohort-analysis?cohort_period=weekly`);
      if (!response.ok) throw new Error('Failed to fetch cohort analysis');
      const data = await response.json();
      setCohortData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cohort analysis');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchModelPerformance = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${AI_API_URL}/models/performance`);
      if (!response.ok) throw new Error('Failed to fetch model performance');
      const data = await response.json();
      setModelPerformance(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch model performance');
    } finally {
      setIsLoading(false);
    }
  };

  const retrainModels = async () => {
    try {
      setIsRetraining(true);
      const response = await fetch(`${AI_API_URL}/models/retrain`, { method: 'POST' });
      if (!response.ok) throw new Error('Failed to retrain models');
      const data = await response.json();
      
      if (data.status === 'success') {
        await fetchModelPerformance(); // Refresh performance data
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to retrain models');
    } finally {
      setIsRetraining(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'insights' && selectedUserId) {
      fetchUserInsights(selectedUserId);
    } else if (activeTab === 'cohorts') {
      fetchCohortAnalysis();
    } else if (activeTab === 'performance') {
      fetchModelPerformance();
    }
  }, [activeTab, selectedUserId]);

  const renderUserInsights = () => (
    <div className="space-y-6">
      {/* User Selection */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">User Analysis</h3>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            placeholder="Enter User ID"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={() => fetchUserInsights(selectedUserId)}
            disabled={isLoading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            Analyze
          </button>
        </div>
      </div>

      {userInsights && (
        <>
          {/* Behavioral Metrics */}
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <TrendingUpIcon className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Engagement Score</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(userInsights.engagement_score * 100)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <CheckCircleIcon className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completion Probability</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(userInsights.completion_probability * 100)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <ExclamationTriangleIcon className={`h-8 w-8 ${userInsights.churn_risk > 0.7 ? 'text-red-500' : 'text-yellow-500'}`} />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Churn Risk</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(userInsights.churn_risk * 100)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <ChartBarIcon className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Learning Velocity</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {userInsights.learning_velocity.toFixed(1)}/week
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Behavioral Segment & Recommendations */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Behavioral Segment</h4>
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  userInsights.behavioral_segment === 'champion' ? 'bg-green-100 text-green-800' :
                  userInsights.behavioral_segment === 'at_risk' ? 'bg-red-100 text-red-800' :
                  userInsights.behavioral_segment === 'loyal' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {userInsights.behavioral_segment.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              
              <div className="mt-4 space-y-2">
                <p className="text-sm text-gray-600">
                  <strong>Preferred Content:</strong> {userInsights.preferred_content_types.join(', ') || 'None identified'}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Active Days:</strong> {userInsights.learning_trajectory.total_days_active}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Avg Daily Completions:</strong> {userInsights.learning_trajectory.avg_daily_completions.toFixed(1)}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">AI Recommendations</h4>
              <div className="space-y-3">
                {userInsights.recommendations.intervention_needed && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-800 font-medium">⚠️ Intervention Needed</p>
                    <p className="text-sm text-red-600">User shows high churn risk</p>
                  </div>
                )}
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800 font-medium">Suggested Content Type</p>
                  <p className="text-sm text-blue-600">{userInsights.recommendations.suggested_content_type}</p>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-800 font-medium">Optimal Session Length</p>
                  <p className="text-sm text-green-600">{userInsights.recommendations.optimal_session_length} minutes</p>
                </div>
              </div>
            </div>
          </div>

          {/* Learning Trajectory Chart */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Learning Trajectory (Last 30 Days)</h4>
            <div className="h-64 flex items-end space-x-2">
              {userInsights.learning_trajectory.daily_progress.map((day, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="bg-indigo-500 rounded-t"
                    style={{
                      height: `${Math.max(4, (day.daily_completions / Math.max(...userInsights.learning_trajectory.daily_progress.map(d => d.daily_completions))) * 200)}px`,
                      width: '100%'
                    }}
                  ></div>
                  <span className="text-xs text-gray-500 mt-1 transform rotate-45">
                    {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderCohortAnalysis = () => (
    <div className="space-y-6">
      {cohortData && (
        <>
          {/* Summary Cards */}
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <UserGroupIcon className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Cohorts</p>
                  <p className="text-2xl font-bold text-gray-900">{cohortData.summary.total_cohorts}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <TrendingUpIcon className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Week 1 Retention</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(cohortData.summary.avg_week_1_retention * 100)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <ChartBarIcon className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Month 1 Retention</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(cohortData.summary.avg_month_1_retention * 100)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <CheckCircleIcon className="h-8 w-8 text-indigo-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Completion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(cohortData.summary.avg_completion_rate * 100)}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Cohort Table */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h4 className="text-lg font-semibold text-gray-900">Cohort Performance</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Period
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cohort Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Week 1 Retention
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Month 1 Retention
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Completion Rate
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cohortData.cohorts.map((cohort, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {new Date(cohort.period).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {cohort.cohort_size}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {Math.round(cohort.week_1_retention_rate * 100)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {Math.round(cohort.month_1_retention_rate * 100)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {Math.round(cohort.avg_completion_rate * 100)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderModelPerformance = () => (
    <div className="space-y-6">
      {modelPerformance && (
        <>
          {/* Model Status & Controls */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Model Status</h3>
                <div className="flex items-center mt-2">
                  <div className={`w-3 h-3 rounded-full mr-2 ${
                    modelPerformance.model_status === 'healthy' ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-sm text-gray-600 capitalize">{modelPerformance.model_status}</span>
                </div>
                {modelPerformance.last_update && (
                  <p className="text-sm text-gray-500 mt-1">
                    Last updated: {new Date(modelPerformance.last_update).toLocaleString()}
                  </p>
                )}
              </div>
              <button
                onClick={retrainModels}
                disabled={isRetraining}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                <RefreshIcon className={`h-4 w-4 mr-2 ${isRetraining ? 'animate-spin' : ''}`} />
                {isRetraining ? 'Retraining...' : 'Retrain Models'}
              </button>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Overall Performance</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-600">Performance Score</span>
                    <span className="text-sm font-bold text-gray-900">
                      {Math.round(modelPerformance.overall_performance_score * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{ width: `${modelPerformance.overall_performance_score * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-600">Recommendation Accuracy</span>
                    <span className="text-sm font-bold text-gray-900">
                      {Math.round(modelPerformance.recommendation_accuracy * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${modelPerformance.recommendation_accuracy * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Nudge Performance</h4>
              <div className="space-y-3">
                {modelPerformance.nudge_performance.map((nudge, index) => (
                  <div key={index} className="border-b border-gray-100 pb-3 last:border-b-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {nudge.nudge_type.replace('_', ' ')}
                      </span>
                      <span className="text-sm text-gray-500">{nudge.total_sent} sent</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                      <span>Click Rate: {Math.round(nudge.click_rate * 100)}%</span>
                      <span>Completion: {Math.round(nudge.completion_rate * 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Advanced Analytics</h1>
        <p className="mt-2 text-gray-600">Real-time AI insights and performance metrics</p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <XCircleIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'insights', name: 'User Insights', icon: TrendingUpIcon },
            { id: 'cohorts', name: 'Cohort Analysis', icon: UserGroupIcon },
            { id: 'performance', name: 'Model Performance', icon: CogIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-5 w-5 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <RefreshIcon className="h-8 w-8 text-indigo-600 animate-spin" />
          <span className="ml-2 text-gray-600">Loading analytics...</span>
        </div>
      )}

      {/* Tab Content */}
      {!isLoading && (
        <>
          {activeTab === 'insights' && renderUserInsights()}
          {activeTab === 'cohorts' && renderCohortAnalysis()}
          {activeTab === 'performance' && renderModelPerformance()}
        </>
      )}
    </div>
  );
};

export default AdvancedAnalyticsDashboard;

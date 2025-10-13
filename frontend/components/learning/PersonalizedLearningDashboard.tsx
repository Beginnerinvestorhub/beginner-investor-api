/**
 * PersonalizedLearningDashboard Component
 * Main learning dashboard with AI-powered recommendations and progress tracking
 */

import React, { useEffect, useState } from 'react';
import {
  useLearningStore,
  useCurrentLearningPath,
  useLearningContent,
  useNextRecommended,
  useAIRecommendations,
  useLearningStats,
  useLearningLoading,
  useLearningError,
} from '../../store/learningStore';
import {
  PlayIcon,
  ClockIcon,
  TrophyIcon,
  LightBulbIcon,
  ChartBarIcon,
  FireIcon,
  BookOpenIcon,
  CheckCircleIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';

const PersonalizedLearningDashboard: React.FC = () => {
  const {
    fetchPersonalizedPath,
    fetchAIRecommendations,
    markLessonCompleted,
    clearError,
  } = useLearningStore();

  const currentPath = useCurrentLearningPath();
  const pathContent = useLearningContent();
  const nextRecommended = useNextRecommended();
  const aiRecommendations = useAIRecommendations();
  const stats = useLearningStats();
  const isLoading = useLearningLoading();
  const error = useLearningError();

  const [showNudge, setShowNudge] = useState(false);

  // Load personalized data on mount
  useEffect(() => {
    fetchPersonalizedPath();
    fetchAIRecommendations();
  }, [fetchPersonalizedPath, fetchAIRecommendations]);

  // Show AI nudge if available
  useEffect(() => {
    if (aiRecommendations && aiRecommendations.nudgeMessage) {
      setShowNudge(true);
    }
  }, [aiRecommendations]);

  const handleStartLesson = async (contentId: number) => {
    // In a real implementation, this would navigate to the lesson
    console.log('Starting lesson:', contentId);
  };

  const handleCompleteLesson = async (contentId: number) => {
    try {
      await markLessonCompleted(contentId, 15); // Assume 15 minutes
    } catch (err) {
      console.error('Failed to complete lesson:', err);
    }
  };

  const dismissNudge = () => {
    setShowNudge(false);
  };

  if (isLoading && !currentPath) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-32 bg-gray-200 rounded-lg"></div>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="h-48 bg-gray-200 rounded-lg"></div>
          <div className="h-48 bg-gray-200 rounded-lg"></div>
          <div className="h-48 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <p className="text-red-800">{error}</p>
            <button
              onClick={clearError}
              className="text-red-600 hover:text-red-800"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* AI Nudge Banner */}
      {showNudge && aiRecommendations && (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white bg-opacity-10 rounded-full"></div>
          <div className="relative">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="bg-white bg-opacity-20 rounded-full p-2">
                  <LightBulbIcon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">
                    AI Learning Nudge
                  </h3>
                  <p className="text-indigo-100 mb-3">
                    {aiRecommendations.nudgeMessage}
                  </p>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm bg-white bg-opacity-20 px-2 py-1 rounded">
                      Confidence:{' '}
                      {Math.round(aiRecommendations.confidenceScore * 100)}%
                    </span>
                    <span className="text-sm bg-white bg-opacity-20 px-2 py-1 rounded">
                      Priority: {aiRecommendations.priorityScore}/100
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={dismissNudge}
                className="text-white hover:text-indigo-200 text-xl"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Learning Path Overview */}
      {currentPath && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {currentPath.name}
              </h2>
              <p className="text-gray-600 mt-1">{currentPath.description}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-indigo-600">
                {currentPath.overallProgress}%
              </div>
              <div className="text-sm text-gray-500">Complete</div>
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${currentPath.overallProgress}%` }}
            ></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {stats.completedLessons}
              </div>
              <div className="text-sm text-gray-500">Lessons Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {stats.totalLessons}
              </div>
              <div className="text-sm text-gray-500">Total Lessons</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {stats.totalPoints}
              </div>
              <div className="text-sm text-gray-500">Points Earned</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {currentPath.estimatedDurationHours}h
              </div>
              <div className="text-sm text-gray-500">Est. Duration</div>
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Next Up Section */}
        <div className="lg:col-span-2 space-y-6">
          {nextRecommended && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <PlayIcon className="h-6 w-6 text-indigo-600 mr-2" />
                Continue Learning
              </h3>

              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6 border border-indigo-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        {nextRecommended.contentType}
                      </span>
                      <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        {nextRecommended.difficultyLevel}
                      </span>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      {nextRecommended.title}
                    </h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                      <span className="flex items-center">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        {nextRecommended.estimatedDurationMinutes} min
                      </span>
                      <span className="flex items-center">
                        <TrophyIcon className="h-4 w-4 mr-1" />
                        {nextRecommended.pointsValue} points
                      </span>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleStartLesson(nextRecommended.id)}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
                      >
                        <PlayIcon className="h-4 w-4 mr-2" />
                        Start Lesson
                      </button>
                      {nextRecommended.progressStatus === 'in_progress' && (
                        <button
                          onClick={() =>
                            handleCompleteLesson(nextRecommended.id)
                          }
                          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                        >
                          <CheckCircleIcon className="h-4 w-4 mr-2" />
                          Mark Complete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Learning Path Content */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <BookOpenIcon className="h-6 w-6 text-gray-600 mr-2" />
              Your Learning Path
            </h3>

            <div className="space-y-3">
              {pathContent.slice(0, 6).map((content, index) => (
                <div
                  key={content.id}
                  className={`flex items-center p-4 rounded-lg border-2 transition-all ${
                    content.progressStatus === 'completed'
                      ? 'border-green-200 bg-green-50'
                      : content.progressStatus === 'in_progress'
                        ? 'border-indigo-200 bg-indigo-50'
                        : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex-shrink-0 mr-4">
                    {content.progressStatus === 'completed' ? (
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircleIcon className="h-5 w-5 text-white" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-semibold">
                        {index + 1}
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {content.title}
                    </h4>
                    <div className="flex items-center space-x-3 text-sm text-gray-600 mt-1">
                      <span className="capitalize">{content.contentType}</span>
                      <span>{content.estimatedDurationMinutes} min</span>
                      <span>{content.pointsValue} pts</span>
                    </div>
                  </div>

                  {content.progressStatus !== 'completed' && (
                    <button
                      onClick={() => handleStartLesson(content.id)}
                      className="text-indigo-600 hover:text-indigo-800 flex items-center"
                    >
                      <ArrowRightIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {pathContent.length > 6 && (
              <div className="mt-4 text-center">
                <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                  View All {pathContent.length} Lessons
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Your Progress
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <TrophyIcon className="h-5 w-5 text-yellow-500 mr-2" />
                  <span className="text-gray-700">Total Points</span>
                </div>
                <span className="font-bold text-gray-900">
                  {stats.totalPoints}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FireIcon className="h-5 w-5 text-orange-500 mr-2" />
                  <span className="text-gray-700">Current Streak</span>
                </div>
                <span className="font-bold text-gray-900">
                  {stats.currentStreak} days
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <ChartBarIcon className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="text-gray-700">Completion Rate</span>
                </div>
                <span className="font-bold text-gray-900">
                  {stats.progressPercentage}%
                </span>
              </div>
            </div>
          </div>

          {/* AI Recommendations */}
          {aiRecommendations &&
            aiRecommendations.recommendedContent.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <StarIcon className="h-5 w-5 text-yellow-500 mr-2" />
                  Recommended for You
                </h3>

                <div className="space-y-3">
                  {aiRecommendations.recommendedContent
                    .slice(0, 3)
                    .map(content => (
                      <div
                        key={content.id}
                        className="p-3 border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors"
                      >
                        <h4 className="font-medium text-gray-900 text-sm mb-1">
                          {content.title}
                        </h4>
                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <span className="capitalize">
                            {content.contentType}
                          </span>
                          <span>{content.estimatedDurationMinutes} min</span>
                        </div>
                      </div>
                    ))}
                </div>

                <div className="mt-4 text-xs text-gray-500">
                  <p>
                    <strong>AI Reasoning:</strong> {aiRecommendations.reasoning}
                  </p>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default PersonalizedLearningDashboard;

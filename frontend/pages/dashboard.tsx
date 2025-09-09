import Head from 'next/head';
import { useAuth } from '../hooks/useAuth';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import MainAppEmbed from '../components/MainAppEmbed';
import StripeCheckoutButton from '../components/StripeCheckoutButton';
import MarketDataWidget from '../components/MarketDataWidget';
import { useGamificationAPI } from '../hooks/useGamificationAPI';
import UserStatsCard from '../components/gamification/UserStatsCard';
import AchievementNotification from '../components/gamification/AchievementNotification';
import { useOnboardingCompleted } from '../store/learningStore';
import PersonalizedLearningDashboard from '../components/learning/PersonalizedLearningDashboard';
// import { Badge, Achievement } from '../types/gamification'; // Unused for now

const STRIPE_PRICE_ID = 'price_12345';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const onboardingCompleted = useOnboardingCompleted();
  const [notification, setNotification] = useState<{
    type: 'badge' | 'achievement' | 'points';
    data: any;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<'learning' | 'tools' | 'market'>('learning');

  const {
    userProgress,
    badges,
    achievements,
    // notifications,
    isLoading: gamificationLoading,
    error: gamificationError,
    trackEvent,
    // dismissNotification,
  } = useGamificationAPI();

  // Track daily login when component mounts
  useEffect(() => {
    if (user) {
      trackEvent('DAILY_LOGIN');
    }
  }, [user, trackEvent]);

  // Show gamification error if any
  useEffect(() => {
    if (gamificationError) {
      console.warn('Gamification error:', gamificationError);
    }
  }, [gamificationError]);

  // Redirect logic for authentication and onboarding
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login');
      } else if (!onboardingCompleted) {
        router.replace('/onboarding');
      }
    }
  }, [user, loading, onboardingCompleted, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-indigo-700 text-lg font-semibold">
        Loading your dashboard...
      </div>
    );
  }

  // Don't render if redirecting
  if (!user || !onboardingCompleted) {
    return null;
  }

  return (
    <div className="page-wrapper min-h-screen bg-gradient-to-br from-white to-indigo-50 flex flex-col">
      <Head>
        <title>My Journey - Dashboard | Beginner Investor Hub</title>
        <meta name="description" content="Your personalized investment learning journey and dashboard." />
      </Head>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user.displayName || 'Investor'}!
          </h1>
          <p className="text-lg text-gray-600">
            Continue your personalized investment learning journey
          </p>
        </div>

        {/* Gamification Progress - Compact Display */}
        {userProgress && !gamificationLoading && (
          <div className="mb-8">
            <UserStatsCard 
              userProgress={{
                ...userProgress,
                badges: (badges as any) || [],
                achievements: (achievements as any) || [],
                streaks: {
                  loginStreak: 0,
                  learningStreak: 0
                },
                stats: {
                  toolsUsed: [],
                  assessmentsCompleted: 0,
                  portfoliosCreated: 0,
                  educationModulesCompleted: 0,
                  totalTimeSpent: 0,
                  averageSessionTime: 0,
                  favoriteTools: []
                }
              }} 
              compact={true}
              className=""
            />
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('learning')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'learning'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Learning Path
            </button>
            <button
              onClick={() => setActiveTab('tools')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'tools'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Investment Tools
            </button>
            <button
              onClick={() => setActiveTab('market')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'market'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Market Overview
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mb-8">
          {activeTab === 'learning' && (
            <PersonalizedLearningDashboard />
          )}
          
          {activeTab === 'tools' && (
            <div className="space-y-6">
              <MainAppEmbed />
              
              {/* Stripe Checkout */}
              <div className="flex justify-center">
                <StripeCheckoutButton priceId={STRIPE_PRICE_ID} />
              </div>
            </div>
          )}
          
          {activeTab === 'market' && (
            <section className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Market Overview
              </h2>
              <MarketDataWidget
                alphaVantageKey={process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY || ''}
                iexCloudKey={process.env.NEXT_PUBLIC_IEX_CLOUD_API_KEY || ''}
                symbol="AAPL"
                coinId="bitcoin"
              />
            </section>
          )}
        </div>
      </main>
      
      {/* Achievement Notifications */}
      {notification && (
        <AchievementNotification
          {...(notification.type === 'badge' ? { badge: notification.data } : {})}
          {...(notification.type === 'achievement' ? { achievement: notification.data } : {})}
          {...(notification.type === 'points' ? { points: notification.data } : {})}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}

import Head from 'next/head';
import { useAuth } from '../hooks/useAuth';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import MainAppEmbed from '../components/MainAppEmbed';
import StripeCheckoutButton from '../components/StripeCheckoutButton';
import MarketDataWidget from '../components/MarketDataWidget';
import { useGamificationAPI } from '../hooks/useGamificationAPI';
import UserStatsCard from '../components/gamification/UserStatsCard';
import AchievementNotification from '../components/gamification/AchievementNotification';
import { useOnboardingCompleted } from '../store/learningStore';
import PersonalizedLearningDashboard from '../components/learning/PersonalizedLearningDashboard';

const STRIPE_PRICE_ID = 'price_12345';

// Define a type for your notification item
type NotificationItem = {
  type: 'badge' | 'achievement' | 'points';
  data: any; 
  id: number;
};

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const onboardingCompleted = useOnboardingCompleted();
  
  // --- New State for Notification Queue ---
  const [notificationQueue, setNotificationQueue] = useState<NotificationItem[]>([]);
  const [currentNotification, setCurrentNotification] = useState<NotificationItem | null>(null);
  
  const [activeTab, setActiveTab] = useState<'learning' | 'tools' | 'market'>('learning');

  const {
    userProgress,
    badges,
    achievements,
    // notifications, // Assuming your hook will provide new notifications here later
    isLoading: gamificationLoading,
    error: gamificationError,
    trackEvent,
    // dismissNotification,
  } = useGamificationAPI();

  // Function to remove the currently displayed notification
  const dismissNotification = useCallback(() => {
    setCurrentNotification(null);
  }, []);

  // --- EFFECT 1: Track daily login ---
  useEffect(() => {
    if (user) {
      trackEvent('DAILY_LOGIN');
    }
  }, [user, trackEvent]);

  // --- EFFECT 2: Process Notification Queue ---
  useEffect(() => {
    // Only proceed if there is no notification currently displayed AND the queue is not empty
    if (!currentNotification && notificationQueue.length > 0) {
      // Pull the first notification from the queue
      const nextNotification = notificationQueue[0];
      
      // Set it as the current one to display
      setCurrentNotification(nextNotification);
      
      // Remove it from the queue
      setNotificationQueue(prevQueue => prevQueue.slice(1));

      // Automatically dismiss the notification after a delay (e.g., 5 seconds)
      const timer = setTimeout(() => {
        dismissNotification();
      }, 5000); 

      return () => clearTimeout(timer); // Cleanup timer if component unmounts or effect reruns
    }
  }, [currentNotification, notificationQueue, dismissNotification]);

  // --- SIMULATION EFFECT (Replace with real API hook logic later) ---
  // If your useGamificationAPI was updated to return `newNotifications`, 
  // you would use that array here instead of this dummy logic.
  useEffect(() => {
    if (user && userProgress && !gamificationLoading && notificationQueue.length === 0) {
      // Dummy logic to add a notification 5 seconds after mount
      const dummyTimer = setTimeout(() => {
        setNotificationQueue(prev => [
            ...prev,
            { 
                type: 'achievement', 
                data: { title: 'First Steps', description: 'Completed your first daily login!', icon: '🏆' }, 
                id: Date.now() 
            }
        ]);
      }, 5000);

      return () => clearTimeout(dummyTimer);
    }
  }, [user, userProgress, gamificationLoading, notificationQueue.length]);

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
            {/* CLEANUP NOTE: The type casting issue here is still present. 
               You should update the type definition for `userProgress` 
               or the `UserStatsCard` component to align with the data structure. */}
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

        {/* Navigation Tabs (Content remains the same) */}
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

        {/* Tab Content (Content remains the same) */}
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
      
      {/* Achievement Notifications - Now driven by currentNotification */}
      {currentNotification && (
        <AchievementNotification
          {...(currentNotification.type === 'badge' ? { badge: currentNotification.data } : {})}
          {...(currentNotification.type === 'achievement' ? { achievement: currentNotification.data } : {})}
          {...(currentNotification.type === 'points' ? { points: currentNotification.data } : {})}
          onClose={dismissNotification}
        />
      )}
    </div>
  );
}

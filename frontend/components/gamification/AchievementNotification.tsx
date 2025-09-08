import React, { useState, useEffect, useCallback } from 'react';
import { Badge, Achievement } from '../../types/gamification';
import BadgeCard from './BadgeCard';

interface AchievementNotificationProps {
  badge?: Badge;
  achievement?: Achievement;
  points?: { amount: number; reason: string; levelUp?: boolean; newLevel?: number };
  onClose: () => void;
  duration?: number;
}

export default function AchievementNotification({
  badge,
  achievement,
  points,
  onClose,
  duration = 5000
}: AchievementNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 300);
  }, [onClose]);

  useEffect(() => {
    const showTimer = setTimeout(() => setIsVisible(true), 100);
    const closeTimer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(closeTimer);
    };
  }, [duration, handleClose]);

  const getNotificationContent = () => {
    if (badge) {
      return {
        title: '🎉 Badge Unlocked!',
        subtitle: badge.name,
        description: badge.description,
        points: badge.points,
        color: 'bg-gradient-to-r from-yellow-400 to-orange-500'
      };
    }

    if (achievement) {
      return {
        title: '🏆 Achievement Unlocked!',
        subtitle: achievement.name,
        description: achievement.description,
        points: achievement.reward.points,
        color: 'bg-gradient-to-r from-purple-500 to-pink-500'
      };
    }

    if (points) {
      return {
        title: points.levelUp ? '🎊 Level Up!' : '⭐ Points Earned!',
        subtitle: points.levelUp ? `Level ${points.newLevel}!` : `+${points.amount} points`,
        description: points.reason,
        points: points.amount,
        color: points.levelUp 
          ? 'bg-gradient-to-r from-green-400 to-blue-500'
          : 'bg-gradient-to-r from-blue-400 to-indigo-500'
      };
    }

    return null;
  };

  const content = getNotificationContent();
  if (!content) return null;

  return (
    <div className={`
      fixed top-4 right-4 z-50 max-w-sm w-full
      transform transition-all duration-300 ease-out
      ${isVisible && !isExiting ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
    `}>
      <div className={`
        rounded-xl shadow-2xl overflow-hidden
        ${content.color}
        animate-bounce-subtle
      `}>
        <div className="p-4 text-white">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1">{content.title}</h3>
              <h4 className="font-semibold text-base mb-2">{content.subtitle}</h4>
              <p className="text-sm opacity-90 mb-3">{content.description}</p>

              {content.points > 0 && (
                <div className="bg-white bg-opacity-20 rounded-full px-3 py-1 inline-block">
                  <span className="text-sm font-bold">+{content.points} points</span>
                </div>
              )}
            </div>

            <button
              onClick={handleClose}
              className="ml-4 text-white hover:text-gray-200 transition-colors"
              title="Close notification"
              aria-label="Close notification"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {badge && (
            <div className="mt-3 flex justify-center">
              <BadgeCard
                badge={badge}
                size="small"
                showDetails={false}
                className="bg-white bg-opacity-20"
              />
            </div>
          )}
        </div>

        <div className="h-1 bg-white bg-opacity-30">
          <div className="h-full bg-white transition-all ease-linear animate-shrink" />
        </div>
      </div>

      <style jsx>{`
        .animate-shrink {
          animation: shrink ${duration}ms linear forwards;
        }

        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }

        @keyframes bounce-subtle {
          0%, 20%, 53%, 80%, 100% {
            transform: translate3d(0,0,0);
          }
          40%, 43% {
            transform: translate3d(0, -8px, 0);
          }
          70% {
            transform: translate3d(0, -4px, 0);
          }
          90% {
            transform: translate3d(0, -2px, 0);
          }
        }

        .animate-bounce-subtle {
          animation: bounce-subtle 1s ease-in-out;
        }
      `}</style>
    </div>
  );
}

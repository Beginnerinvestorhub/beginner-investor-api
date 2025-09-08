// Badge card component for displaying individual badges

import React from 'react';
import { Badge } from '../../types/gamification';
import { RARITY_COLORS } from '../../config/badges';

interface BadgeCardProps {
  badge: Badge;
  size?: 'small' | 'medium' | 'large';
  showDetails?: boolean;
  className?: string;
}

export default function BadgeCard({ 
  badge, 
  size = 'medium', 
  showDetails = true,
  className = '' 
}: BadgeCardProps) {
  const rarityStyle = RARITY_COLORS[badge.rarity];
  
  const sizeClasses = {
    small: 'w-16 h-16 text-2xl',
    medium: 'w-20 h-20 text-3xl',
    large: 'w-24 h-24 text-4xl'
  };

  const cardSizeClasses = {
    small: 'p-3',
    medium: 'p-4',
    large: 'p-6'
  };

  return (
    <div 
      className={`
        relative rounded-xl border-2 transition-all duration-300 hover:scale-105
        ${rarityStyle.bg} ${rarityStyle.border} ${rarityStyle.text}
        ${badge.isUnlocked ? 'opacity-100' : 'opacity-50 grayscale'}
        ${cardSizeClasses[size]} ${className}
      `}
    >
      {/* Rarity glow effect */}
      {badge.isUnlocked && (
        <div 
          className={`absolute inset-0 rounded-xl blur-sm ${rarityStyle.glow} -z-10`}
        />
      )}

      {/* Badge icon */}
      <div className={`flex items-center justify-center ${sizeClasses[size]} mx-auto mb-2`}>
        <span className="select-none">{badge.icon}</span>
      </div>

      {showDetails && (
        <>
          {/* Badge name */}
          <h3 className={`font-bold text-center mb-1 ${
            size === 'small' ? 'text-xs' : size === 'medium' ? 'text-sm' : 'text-base'
          }`}>
            {badge.name}
          </h3>

          {/* Badge description */}
          <p className={`text-center opacity-75 ${
            size === 'small' ? 'text-xs' : 'text-sm'
          }`}>
            {badge.description}
          </p>

          {/* Points value */}
          <div className={`text-center mt-2 font-semibold ${
            size === 'small' ? 'text-xs' : 'text-sm'
          }`}>
            {badge.points} pts
          </div>

          {/* Unlock date */}
          {badge.isUnlocked && badge.unlockedAt && (
            <div className={`text-center mt-1 opacity-60 ${
              size === 'small' ? 'text-xs' : 'text-xs'
            }`}>
              Unlocked {new Date(badge.unlockedAt).toLocaleDateString()}
            </div>
          )}
        </>
      )}

      {/* Rarity indicator */}
      <div className={`absolute top-1 right-1 px-2 py-1 rounded-full text-xs font-bold ${
        rarityStyle.bg} ${rarityStyle.text} border ${rarityStyle.border}
      `}>
        {badge.rarity.toUpperCase()}
      </div>

      {/* Locked overlay */}
      {!badge.isUnlocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded-xl">
          <div className="text-white text-2xl">🔒</div>
        </div>
      )}
    </div>
  );
}

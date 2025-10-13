// Progress bar component for showing level progression and experience

import React from 'react';

interface ProgressBarProps {
  current: number;
  max: number;
  label?: string;
  showPercentage?: boolean;
  height?: 'small' | 'medium' | 'large';
  color?: 'blue' | 'green' | 'purple' | 'yellow';
  animated?: boolean;
  className?: string;
}

export default function ProgressBar({
  current,
  max,
  label,
  showPercentage = true,
  height = 'medium',
  color = 'blue',
  animated = true,
  className = '',
}: ProgressBarProps) {
  const percentage = Math.min((current / max) * 100, 100);

  const heightClasses = {
    small: 'h-2',
    medium: 'h-3',
    large: 'h-4',
  };

  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    yellow: 'bg-yellow-500',
  };

  const bgColorClasses = {
    blue: 'bg-blue-100',
    green: 'bg-green-100',
    purple: 'bg-purple-100',
    yellow: 'bg-yellow-100',
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Label and percentage */}
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {label && (
            <span className="text-sm font-medium text-gray-700">{label}</span>
          )}
          {showPercentage && (
            <span className="text-sm text-gray-500">
              {Math.round(percentage)}% ({current}/{max})
            </span>
          )}
        </div>
      )}

      {/* Progress bar container */}
      <div
        className={`
        w-full rounded-full overflow-hidden
        ${heightClasses[height]} ${bgColorClasses[color]}
      `}
      >
        {/* Progress fill */}
        <div
          className={`
            h-full rounded-full transition-all duration-500 ease-out
            ${colorClasses[color]}
            ${animated ? 'animate-pulse' : ''}
          `}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Milestone markers (optional) */}
      {max > 100 && (
        <div className="flex justify-between mt-1 text-xs text-gray-400">
          <span>0</span>
          <span>{Math.floor(max / 2)}</span>
          <span>{max}</span>
        </div>
      )}
    </div>
  );
}

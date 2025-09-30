import React from 'react';
import { cloneElement, isValidElement } from 'react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
}

export default function FeatureCard({ icon, title, description, className }: FeatureCardProps) {
  const sizedIcon = isValidElement(icon)
    ? cloneElement(icon, {
        className: 'w-6 h-6 sm:w-7 sm:h-7 text-indigo-500',
      })
    : icon;

  return (
    <div className={`bg-white rounded-lg shadow-sm p-5 sm:p-6 w-full flex flex-col items-center text-center transition-all duration-200 ease-in-out hover:shadow-md ${className}`}>
      <div className="mb-4 bg-indigo-50 p-3 sm:p-4 rounded-full flex items-center justify-center">
        {sizedIcon}
      </div>
      <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}


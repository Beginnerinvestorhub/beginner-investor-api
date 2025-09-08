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
        className: 'w-8 h-8 text-indigo-500',
      })
    : icon;

  return (
    <div className={`bg-white rounded-2xl shadow-sm p-8 w-full flex flex-col items-center text-center transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-xl ${className}`}>
      <div className="mb-5 bg-indigo-50 p-5 rounded-full flex items-center justify-center">
        {sizedIcon}
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-3">{title}</h3>
      <p className="text-base text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}




import Link from 'next/link';
import { ReactElement } from 'react';

interface FeatureCardProps {
  icon: ReactElement;
  title: string;
  description: string;
  href: string;
  linkText: string;
  // New prop to handle dynamic styling
  iconColor: 'indigo' | 'green' | 'blue' | 'purple'; 
}

// Map color prop to Tailwind classes
const colorMap = {
  indigo: {
    bg: 'bg-indigo-100',
    text: 'text-indigo-600',
    ring: 'ring-indigo-500',
  },
  green: {
    bg: 'bg-green-100',
    text: 'text-green-600',
    ring: 'ring-green-500',
  },
  blue: {
    bg: 'bg-blue-100',
    text: 'text-blue-600',
    ring: 'ring-blue-500',
  },
  purple: {
    bg: 'bg-purple-100',
    text: 'text-purple-600',
    ring: 'ring-purple-500',
  },
};

export default function FeatureCard({
  icon,
  title,
  description,
  href,
  linkText,
  iconColor,
}: FeatureCardProps) {
  const colors = colorMap[iconColor];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 transition duration-300 hover:shadow-xl hover:border-gray-200">
      {/* Icon Container: Smaller, circular, and colored background */}
      <div className={`flex items-center justify-center h-12 w-12 rounded-full ${colors.bg} mb-4`}>
        {/* The icon itself is now h-6 w-6 and should have been passed the text color */}
        {icon} 
      </div>
      
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      
      <Link href={href} className={`text-sm font-semibold flex items-center ${colors.text} hover:underline`}>
        {linkText}
        <svg className="ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  );
}

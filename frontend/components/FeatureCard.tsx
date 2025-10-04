// components/FeatureCard.tsx

import { isValidElement, cloneElement, ReactNode } from 'react';
import Link from 'next/link';

export interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  className?: string;
  iconColor?: 'indigo' | 'green' | 'blue' | 'purple';
  href?: string;
  linkText?: string;
}

const iconColorClasses: Record<NonNullable<FeatureCardProps['iconColor']>, string> = {
  indigo: 'text-indigo-500',
  green: 'text-green-500',
  blue: 'text-blue-500',
  purple: 'text-purple-500',
};

export default function FeatureCard({
  icon,
  title,
  description,
  className = '',
  iconColor = 'indigo',
  href,
  linkText,
}: FeatureCardProps) {
  const sizedIcon = isValidElement(icon)
    ? cloneElement(icon, {
        className: `h-6 w-6 ${iconColorClasses[iconColor]}`,
        'aria-hidden': true,
      })
    : null;

  const cardContent = (
    <div className={`group relative bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 transition-all duration-200 ${className}`}>
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">{sizedIcon}</div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
            {title}
          </h3>
          <p className="mt-2 text-sm text-gray-600 leading-relaxed">
            {description}
          </p>
          {linkText && (
            <div className="mt-4">
              <span className="inline-flex items-center text-sm font-medium text-indigo-600 group-hover:text-indigo-700">
                {linkText}
                <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}

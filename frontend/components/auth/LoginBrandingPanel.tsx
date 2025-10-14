import React from 'react';
import Link from 'next/link';

const features = [
  'Portfolio simulation engine',
  'AI behavioral coaching',
  'Real-time market data',
  'Risk analysis tools',
];

const LoginBrandingPanel: React.FC = () => (
  <div className="hidden lg:flex flex-col justify-center p-12 bg-gradient-to-br from-blue-700 to-blue-900 text-white relative overflow-hidden">

    {/* Background Grid Overlay */}
    <div
      className="absolute inset-0 opacity-10 pointer-events-none"
      style={{
        backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 30px, rgba(255, 255, 255, 0.03) 30px, rgba(255, 255, 255, 0.03) 31px), repeating-linear-gradient(0deg, transparent, transparent 30px, rgba(255, 255, 255, 0.03) 30px, rgba(255, 255, 255, 0.03) 31px)'
      }}
    ></div>

    <Link href="/" className="flex items-center gap-2 mb-16 relative z-10">
      <div className="text-4xl">📊</div>
      <span className="font-serif text-3xl font-bold tracking-wider text-white">
        Investor Hub
      </span>
    </Link>

    <h1 className="font-serif text-4xl font-bold mb-4 relative z-10">
      Welcome Back
    </h1>
    <p className="text-lg leading-relaxed mb-12 opacity-95 relative z-10">
      Continue your journey to financial mastery with precision tools
      and AI-powered insights.
    </p>

    <div className="flex flex-col gap-4 relative z-10">
      {features.map((feature) => (
        <div key={feature} className="flex items-center gap-3 text-lg">
          <span className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center font-bold flex-shrink-0">
            ✓
          </span>
          <span>{feature}</span>
        </div>
      ))}
    </div>
  </div>
);

export default LoginBrandingPanel;

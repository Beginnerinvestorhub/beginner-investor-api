import React from 'react';
import Head from 'next/head';

interface LoadingSpinnerProps {
  title?: string;
  metaDescription?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  title = 'Loading',
  metaDescription = 'Please wait while we load your content.'
}) => (
  <>
    <Head>
      <title>{title} | Beginner Investor Hub</title>
      <meta name="robots" content="noindex, nofollow" />
      <meta name="description" content={metaDescription} />
    </Head>
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-6"></div>
      <p className="text-gray-700 font-semibold">Loading...</p>
    </div>
  </>
);

export default LoadingSpinner;

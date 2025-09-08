import React, { useState } from 'react';
import { ShareIcon, ClipboardIcon, CheckIcon } from '@heroicons/react/24/outline';

interface SocialSharingProps {
  achievement?: {
    title: string;
    description: string;
  };
  badge?: {
    name: string;
    description: string;
  };
  level?: number;
  points?: number;
}

export default function SocialSharing({ achievement, badge, level, points }: SocialSharingProps) {
  const [copied, setCopied] = useState(false);

  const generateShareText = () => {
    if (achievement) {
      return `🎉 Just unlocked "${achievement.title}" on BeginnerInvestorHub! ${achievement.description} #InvestmentJourney #FinancialLiteracy`;
    }
    if (badge) {
      return `🏆 Earned the "${badge.name}" badge on BeginnerInvestorHub! ${badge.description} #InvestmentGoals #FinancialEducation`;
    }
    if (level) {
      return `📈 Just reached Level ${level} on BeginnerInvestorHub! Leveling up my investment knowledge! #InvestmentLearning #FinancialGrowth`;
    }
    if (points) {
      return `💪 Just earned ${points} points on BeginnerInvestorHub! Building my investment skills one step at a time! #InvestmentProgress`;
    }
    return `🚀 Making progress on my investment journey with BeginnerInvestorHub! #InvestmentEducation #FinancialLiteracy`;
  };

  const shareUrl = 'https://beginnerinvestorhub.com';
  const shareText = generateShareText();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const shareToTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
  };

  const shareToLinkedIn = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&summary=${encodeURIComponent(shareText)}`;
    window.open(linkedInUrl, '_blank', 'width=550,height=420');
  };

  const shareToFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(facebookUrl, '_blank', 'width=550,height=420');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-4">
        <ShareIcon className="w-6 h-6 text-indigo-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-800">Share Your Achievement</h3>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <p className="text-sm text-gray-700 italic">&ldquo;{shareText}&rdquo;</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Twitter */}
        <button
          onClick={shareToTwitter}
          className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
          </svg>
          Twitter
        </button>

        {/* LinkedIn */}
        <button
          onClick={shareToLinkedIn}
          className="flex items-center justify-center px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
          LinkedIn
        </button>

        {/* Facebook */}
        <button
          onClick={shareToFacebook}
          className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          Facebook
        </button>

        {/* Copy Link */}
        <button
          onClick={copyToClipboard}
          className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          {copied ? (
            <CheckIcon className="w-4 h-4 mr-2" />
          ) : (
            <ClipboardIcon className="w-4 h-4 mr-2" />
          )}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      <p className="text-xs text-gray-500 mt-4 text-center">
        Share your progress and inspire others to start their investment journey!
      </p>
    </div>
  );
}

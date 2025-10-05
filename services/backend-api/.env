import React, { ComponentProps } from 'react'; // Consolidated import
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';
import NewsletterSignup from '../components/NewsletterSignup';
// NOTE: Assuming FeatureCard now accepts an optional 'iconColor' prop for variety.
import FeatureCard from '../components/FeatureCard'; 
import {
  ScaleIcon,
  ChartBarIcon,
  PlayIcon,
  CheckCircleIcon,
  StarIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  LightBulbIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';

// Extend the FeatureCard props to include a specific color for the icon background/ring
interface FeatureCardProps extends ComponentProps<typeof FeatureCard> {
  color: string;
}

const features: FeatureCardProps[] = [
  {
    // Reduced icon size to h-6 w-6 to look less "huge" and added a base color
    icon: <LightBulbIcon className="h-6 w-6 text-indigo-600" />,
    title: 'Personalized Learning Paths',
    description: 'Tailored just for you. Our AI adapts to your goals and learning style.',
    href: '/learn/my-path',
    linkText: 'Explore Learning Path',
    color: 'indigo', // Added color property
  },
  {
    icon: <TrophyIcon className="h-6 w-6 text-green-600" />,
    title: 'Gamified Challenges',
    description: 'Master concepts with fun, interactive tasks. Earn points and climb the leaderboards!',
    href: '/learn/challenges',
    linkText: 'View Challenges',
    color: 'green', // Added color property
  },
  {
    icon: <ChartBarIcon className="h-6 w-6 text-blue-600" />,
    title: 'Risk-Free Virtual Portfolio',
    description: 'Practice buying and selling with simulated money. See your strategies play out in real-time.',
    href: '/portfolio-monitor',
    linkText: 'Try Virtual Portfolio',
    color: 'blue', // Added color property
  },
  {
    icon: <ScaleIcon className="h-6 w-6 text-purple-600" />,
    title: 'Smart Tools & Insights',
    description: 'Access calculators, risk assessments, and ESG screeners to make informed decisions.',
    href: '/tools',
    linkText: 'Explore Tools',
    color: 'purple', // Added color property
  },
];


export default function Home() {  
  return (
    <Layout>
      <Head>
        {/* ... (Head content remains the same) ... */}
      </Head>

      {/* Hero Section - Centering Review & Color */}
      <section className="relative bg-gradient-to-br from-indigo-50 via-white to-blue-50 pt-16 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Confirmed text-center is applied to the container, ensuring title centering */}
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-2">
              <span className="text-indigo-600 block">Demystify Investing,</span>
            </h1>
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6">
              <span className="text-blue-600">Build Your Wealth Confidently</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Beginner Investor Hub guides you through interactive lessons, gamified challenges,
              and risk-free virtual investing. Your personalized path to financial freedom starts here.
            </p>

            {/* CTA Buttons - Adding more pronounced shadow/lift for pop */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link href="/signup" className="px-8 py-4 bg-indigo-600 text-white text-lg font-semibold rounded-xl hover:bg-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-xl hover:shadow-2xl flex items-center">
                Start Your Investing Journey Free
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
              <Link href="/dashboard" className="px-8 py-4 bg-white border-2 border-indigo-600 text-indigo-600 text-lg font-semibold rounded-xl hover:bg-indigo-50 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center">
                <PlayIcon className="mr-2 h-5 w-5" />
                Watch Demo
              </Link>
            </div>

            {/* Hero Image/Video Placeholder */}
            <div className="relative max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
                <div className="aspect-video bg-gradient-to-br from-indigo-100 to-blue-100 rounded-xl flex items-center justify-center">
                  <div className="text-center" aria-label="Interactive Learning Dashboard Preview">
                    <ChartBarIcon className="h-16 w-16 text-indigo-600 mx-auto mb-4" />
                    <p className="text-indigo-600 font-semibold">Interactive Learning Dashboard Preview</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem/Solution Section - Added alternating background color (bg-white) */}
      <section className="py-20 bg-white">
        {/* ... (Section content remains the same) ... */}
      </section>

      {/* Key Features Section - Feature Card Icon/Color Fix */}
      <section className="py-20 bg-gray-50"> {/* Alternating background color */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How Beginner Investor Hub Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Four core pillars designed to transform you from a beginner into a confident investor
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* The color property is now passed to FeatureCard */}
            {features.map((feature) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                href={feature.href}
                linkText={feature.linkText}
                // Assuming FeatureCard is updated to use this prop
                color={feature.color} 
              />
            ))}
          </div>
        </div>
      </section>

      {/* About Us / Our Mission Section - Added alternating background color (bg-white) */}
      <section className="py-20 bg-white">
        {/* ... (Section content remains the same) ... */}
      </section>

      {/* Enhanced Testimonials / Social Proof - Alternating background color */}
      <section className="py-20 bg-gray-50">
        {/* ... (Section content remains the same) ... */}
      </section>

      {/* Secondary CTA / Get Started */}
      <section className="py-20 bg-indigo-600">
        {/* ... (Section content remains the same) ... */}
      </section>

      {/* Newsletter Signup */}
      <section className="py-16 bg-gray-50">
        {/* ... (Section content remains the same) ... */}
      </section>
    </Layout>
  );
}

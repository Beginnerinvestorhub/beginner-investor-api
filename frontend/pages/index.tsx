import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';
import NewsletterSignup from '../components/NewsletterSignup';
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
import { ComponentProps } from 'react';

const features: ComponentProps<typeof FeatureCard>[] = [
  {
    icon: <LightBulbIcon className="h-8 w-8 text-indigo-600" />,
    title: 'Personalized Learning Paths',
    description: 'Tailored just for you. Our AI adapts to your goals and learning style.',
    href: '/learn/my-path',
    linkText: 'Explore Learning Path',
  },
  {
    icon: <TrophyIcon className="h-8 w-8 text-green-600" />,
    title: 'Gamified Challenges',
    description: 'Master concepts with fun, interactive tasks. Earn points and climb the leaderboards!',
    href: '/learn/challenges',
    linkText: 'View Challenges',
  },
  {
    icon: <ChartBarIcon className="h-8 w-8 text-blue-600" />,
    title: 'Risk-Free Virtual Portfolio',
    description: 'Practice buying and selling with simulated money. See your strategies play out in real-time.',
    href: '/portfolio-monitor',
    linkText: 'Try Virtual Portfolio',
  },
  {
    icon: <ScaleIcon className="h-8 w-8 text-purple-600" />,
    title: 'Smart Tools & Insights',
    description: 'Access calculators, risk assessments, and ESG screeners to make informed decisions.',
    href: '/tools',
    linkText: 'Explore Tools',
  },
];


export default function Home() {  
  return (
    <Layout>
      <Head>
        <title>Demystify Investing, Build Your Wealth Confidently | Beginner Investor Hub</title>
        <meta name="description" content="Your personalized path to smart investing starts here. Learn through interactive lessons, gamified challenges, and risk-free virtual investing. Join thousands of confident investors." />
        <meta property="og:title" content="Demystify Investing, Build Your Wealth Confidently | Beginner Investor Hub" />
        <meta property="og:description" content="Your personalized path to smart investing starts here. Learn through interactive lessons, gamified challenges, and risk-free virtual investing." />
        <meta property="og:image" content="/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Demystify Investing, Build Your Wealth Confidently" />
        <meta name="twitter:description" content="Your personalized path to smart investing starts here. Learn through interactive lessons, gamified challenges, and risk-free virtual investing." />
        <meta name="twitter:image" content="/og-image.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Beginner Investor Hub',
              url: 'https://www.beginnerinvestorhub.com', // Replace with your production URL
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://www.beginnerinvestorhub.com/search?q={search_term_string}', // Replace with your search URL
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
      </Head>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-50 via-white to-blue-50 pt-16 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6">
              <span className="text-indigo-600">Demystify Investing,</span>
              <br />Build Your Wealth <span className="text-indigo-600">Confidently</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Beginner Investor Hub guides you through interactive lessons, gamified challenges, 
              and risk-free virtual investing. Your personalized path to financial freedom starts here.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link href="/signup" className="px-8 py-4 bg-indigo-600 text-white text-lg font-semibold rounded-xl hover:bg-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center">
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

      {/* Problem/Solution Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Problem */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Feeling Overwhelmed by the Stock Market?
              </h2>
              <div className="space-y-4 text-lg text-gray-600">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mt-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  </div>
                  <p className="ml-4">Unsure where to start with investing?</p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mt-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  </div>
                  <p className="ml-4">Worried about making costly mistakes?</p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mt-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  </div>
                  <p className="ml-4">Confused by complex financial jargon?</p>
                </div>
              </div>
            </div>

            {/* Solution */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-indigo-600 mb-6">
                We Make Investing Simple & Safe
              </h2>
              <div className="space-y-4 text-lg text-gray-600">
                <div className="flex items-start">
                  <CheckCircleIcon className="flex-shrink-0 w-6 h-6 text-green-500 mt-1" />
                  <p className="ml-4">Break down complex concepts into simple, understandable steps</p>
                </div>
                <div className="flex items-start">
                  <CheckCircleIcon className="flex-shrink-0 w-6 h-6 text-green-500 mt-1" />
                  <p className="ml-4">Learn by doing with engaging, risk-free challenges</p>
                </div>
                <div className="flex items-start">
                  <CheckCircleIcon className="flex-shrink-0 w-6 h-6 text-green-500 mt-1" />
                  <p className="ml-4">Practice with a virtual portfolio before investing real money</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-20 bg-gray-50">
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
            {features.map((feature) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                href={feature.href}
                linkText={feature.linkText}
              />
            ))}
          </div>
        </div>
      </section>

      {/* About Us / Our Mission Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Our Mission: Democratizing Financial Education
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              At Beginner Investor Hub, we believe that everyone deserves the knowledge and confidence 
              to build financial freedom. Our mission is to demystify investing, making it accessible, 
              engaging, and effective for absolute beginners.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* Our Approach */}
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <LightBulbIcon className="h-8 w-8 text-indigo-600" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">AI-Driven Personalization</h3>
              <p className="text-gray-600">
                Our advanced AI adapts to your learning style, risk tolerance, and financial goals 
                to create a truly personalized investment education experience.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrophyIcon className="h-8 w-8 text-green-600" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Gamified Learning</h3>
              <p className="text-gray-600">
                Transform complex financial concepts into engaging challenges and interactive experiences 
                that make learning fun and memorable.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheckIcon className="h-8 w-8 text-blue-600" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Risk-Free Practice</h3>
              <p className="text-gray-600">
                Practice with virtual portfolios and simulated trading environments before 
                risking your hard-earned money in real markets.
              </p>
            </div>
          </div>

          {/* Why Choose Us */}
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-8 md:p-12">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
              Why Choose Beginner Investor Hub?
            </h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-start" >
                  <CheckCircleIcon className="flex-shrink-0 w-6 h-6 text-green-500 mt-1" />
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900">Learn at Your Own Pace</h4>
                    <p className="text-gray-600">Self-paced learning modules that fit your schedule</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircleIcon className="flex-shrink-0 w-6 h-6 text-green-500 mt-1" />
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900">No Jargon, Just Clarity</h4>
                    <p className="text-gray-600">Plain English explanations of complex concepts</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircleIcon className="flex-shrink-0 w-6 h-6 text-green-500 mt-1" />
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900">Practice Without Risk</h4>
                    <p className="text-gray-600">Virtual trading with real market data</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start">
                  <CheckCircleIcon className="flex-shrink-0 w-6 h-6 text-green-500 mt-1" />
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900">Join a Supportive Community</h4>
                    <p className="text-gray-600">Connect with fellow learners and share experiences</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircleIcon className="flex-shrink-0 w-6 h-6 text-green-500 mt-1" />
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900">Comprehensive Tools</h4>
                    <p className="text-gray-600">Everything you need in one integrated platform</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircleIcon className="flex-shrink-0 w-6 h-6 text-green-500 mt-1" />
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900">Always Up-to-Date</h4>
                    <p className="text-gray-600">Content updated with latest market trends and regulations</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Testimonials / Social Proof */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trusted by Thousands of New Investors
            </h2>
            <p className="text-xl text-gray-600">
              See what our community is saying about their investment journey
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <blockquote className="text-gray-600 mb-6">
                "I went from knowing nothing about stocks to making my first investment in just a few weeks. The personalized learning path was a game-changer!"
              </blockquote>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-indigo-600 font-semibold">JS</span>
                </div>
                <div className="ml-4">
                  <p className="font-semibold text-gray-900">Jessica S.</p>
                  <p className="text-gray-500 text-sm">Marketing Manager</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <blockquote className="text-gray-600 mb-6">
                "The gamified challenges made complex topics so easy to understand. 
                I actually look forward to learning about investing now! 
                Highly recommend to anyone starting their investment journey."
              </blockquote>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-semibold">DL</span>
                </div>
                <div className="ml-4">
                  <p className="font-semibold text-gray-900">David L.</p>
                  <p className="text-gray-500 text-sm">Software Engineer</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <blockquote className="text-gray-600 mb-6">
                "The virtual portfolio feature let me practice without any risk. 
                I made all my beginner mistakes with fake money first! 
                Now I'm investing confidently with real money."
              </blockquote>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">MR</span>
                </div>
                <div className="ml-4">
                  <p className="font-semibold text-gray-900">Maria R.</p>
                  <p className="text-gray-500 text-sm">Teacher</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Secondary CTA / Get Started */}
      <section className="py-20 bg-indigo-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Your Investment Journey?
          </h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Join thousands of confident investors who started their journey with us. 
            No credit card required to get started.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/signup" className="px-8 py-4 bg-white text-indigo-600 text-lg font-semibold rounded-xl hover:bg-gray-50 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center">
              Join Thousands of Confident Investors
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
            <Link href="/dashboard" className="px-8 py-4 bg-transparent border-2 border-white text-white text-lg font-semibold rounded-xl hover:bg-white hover:text-indigo-600 transition-all duration-200 flex items-center">
              <PlayIcon className="mr-2 h-5 w-5" />
              Start Learning Today
            </Link>
          </div>
          
          <p className="text-indigo-200 text-sm mt-6">
            ✓ Free to Start  ✓ No Credit Card Required  ✓ Cancel Anytime
          </p>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <NewsletterSignup />
        </div>
      </section>
    </Layout>
  );
}

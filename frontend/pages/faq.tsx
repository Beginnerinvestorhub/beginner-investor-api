import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';

export default function FAQ() {
  const faqs = [
    {
      question: 'What is Beginner Investor Hub?',
      answer: 'Beginner Investor Hub is an educational platform that helps you learn investing through hands-on portfolio simulation, AI-powered coaching, and real-time market insights. We provide institutional-grade tools in an accessible format for beginners.'
    },
    {
      question: 'Is this real investing or just simulation?',
      answer: 'We focus on simulation and education. You can practice with virtual portfolios using real market data, but no real money is involved. This helps you build confidence and understanding before investing with real funds.'
    },
    {
      question: 'How much does it cost?',
      answer: 'Basic access to our platform is free. We offer premium features for advanced users who want additional analytics and personalized coaching. You can start learning immediately without any cost.'
    },
    {
      question: 'What markets can I simulate?',
      answer: 'You can simulate investments in stocks, ETFs, and cryptocurrencies. We provide real-time data from major exchanges including NYSE, NASDAQ, and popular crypto exchanges.'
    },
    {
      question: 'How does the AI coaching work?',
      answer: 'Our AI analyzes your investment decisions and provides personalized feedback on your strategy, risk management, and behavioral patterns. It helps you recognize emotional decision-making and develop disciplined investing habits.'
    },
    {
      question: 'Can I track my progress?',
      answer: 'Yes! You can monitor your simulated portfolio performance, track your learning progress, and see detailed analytics about your investment decisions and risk management.'
    },
    {
      question: 'Is my data secure?',
      answer: 'Absolutely. We use industry-standard encryption and security measures. Your personal information and simulated portfolio data are protected with the same level of security used by major financial institutions.'
    },
    {
      question: 'How do I get started?',
      answer: 'Simply sign up for a free account, complete your investor profile, and start building your first simulated portfolio. Our guided onboarding process will walk you through each step.'
    }
  ];

  return (
    <Layout>
      <Head>
        <title>Frequently Asked Questions | Beginner Investor Hub</title>
        <meta
          name="description"
          content="Find answers to common questions about our investment education platform, portfolio simulation, and AI coaching features."
        />
      </Head>

      <div className="faq-page">
        {/* Header */}
        <header className="faq-header">
          <div className="nyse-container">
            <Link href="/" className="back-link">
              ← Back to Home
            </Link>
            <h1>Frequently Asked Questions</h1>
            <p className="header-subtitle">
              Everything you need to know about mastering investing with our precision tools.
            </p>
          </div>
        </header>

        {/* FAQ Content */}
        <main className="faq-content">
          <div className="nyse-container">
            <div className="faq-grid">
              {faqs.map((faq, index) => (
                <div key={index} className="faq-item">
                  <h3 className="faq-question">{faq.question}</h3>
                  <p className="faq-answer">{faq.answer}</p>
                </div>
              ))}
            </div>

            {/* Contact CTA */}
            <div className="faq-cta">
              <h2>Still have questions?</h2>
              <p>Our support team is here to help you succeed in your investing journey.</p>
              <Link href="/contact" className="btn btn-primary">
                Contact Support
              </Link>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
}

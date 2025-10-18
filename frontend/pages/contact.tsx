import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'general',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setStatus('success');
      setFormData({ name: '', email: '', subject: 'general', message: '' });
      setTimeout(() => setStatus('idle'), 5000);
    } catch (error) {
      setStatus('error');
      setErrorMessage('Failed to send message. Please try emailing us directly.');
    }
  };

  return (
    <Layout>
      <Head>
        <title>Contact Us | Beginner Investor Hub</title>
        <meta
          name="description"
          content="Get in touch with our support team. We're here to help with questions about portfolio simulation, AI coaching, and platform features."
        />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-nyse-primary text-white py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link href="/" className="text-white hover:underline inline-flex items-center mb-4">
              ← Back to Home
            </Link>
            <h1 className="text-4xl font-bold mb-2">Contact Us</h1>
            <p className="text-xl text-nyse-text-light">
              Have questions? We're here to help you master investing.
            </p>
          </div>
        </header>

        {/* Content */}
        <main className="py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Information */}
              <div className="space-y-8">
                <h2 className="text-2xl font-bold text-nyse-dark">Get in Touch</h2>
                <p className="text-nyse-text">
                  Choose the best way to reach us. We typically respond within
                  24 hours during business days.
                </p>

                {/* Contact Methods */}
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="text-2xl">📧</div>
                    <div>
                      <h3 className="font-semibold text-lg">Email Support</h3>
                      <p className="text-nyse-text-light">For general inquiries and support</p>
                      <a
                        href="mailto:support@beginnerinvestorhub.com"
                        className="text-nyse-accent hover:underline"
                      >
                        support@beginnerinvestorhub.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="text-2xl">🔒</div>
                    <div>
                      <h3 className="font-semibold text-lg">Privacy Inquiries</h3>
                      <p className="text-nyse-text-light">Data requests and privacy concerns</p>
                      <a
                        href="mailto:privacy@beginnerinvestorhub.com"
                        className="text-nyse-accent hover:underline"
                      >
                        privacy@beginnerinvestorhub.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="text-2xl">💼</div>
                    <div>
                      <h3 className="font-semibold text-lg">Business Partnerships</h3>
                      <p className="text-nyse-text-light">Affiliate program and collaborations</p>
                      <a
                        href="mailto:partnerships@beginnerinvestorhub.com"
                        className="text-nyse-accent hover:underline"
                      >
                        partnerships@beginnerinvestorhub.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="text-2xl">📍</div>
                    <div>
                      <h3 className="font-semibold text-lg">Location</h3>
                      <p className="text-nyse-text">Charlotte, North Carolina</p>
                      <p className="text-nyse-text-light">United States</p>
                    </div>
                  </div>
                </div>

                {/* Response Time */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-nyse-border">
                  <h3 className="font-semibold text-lg mb-3">Response Time</h3>
                  <ul className="space-y-2 text-nyse-text">
                    <li>• General inquiries: Within 24 hours</li>
                    <li>• Technical support: Within 12 hours</li>
                    <li>• Privacy requests: Within 30 days</li>
                    <li>• Emergency issues: Immediate escalation</li>
                  </ul>
                </div>

                {/* FAQ Link */}
                <div className="bg-nyse-primary/5 p-6 rounded-lg border border-nyse-border">
                  <h4 className="font-semibold text-lg mb-2">Looking for quick answers?</h4>
                  <p className="text-nyse-text mb-3">
                    Check our FAQ section for common questions about portfolio
                    simulation, risk analysis, and platform features.
                  </p>
                  <Link href="/faq" className="text-nyse-accent hover:underline font-medium inline-flex items-center">
                    Visit FAQ <span className="ml-1">→</span>
                  </Link>
                </div>
              </div>

              {/* Contact Form */}
              <div>
                <div className="bg-white p-8 rounded-lg shadow-sm border border-nyse-border">
                  <h2 className="text-2xl font-bold text-nyse-dark mb-2">Send Us a Message</h2>
                  <p className="text-nyse-text mb-6">
                    Fill out the form below and we'll get back to you as soon as
                    possible.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-nyse-text mb-1">
                        Your Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-nyse-border rounded-md focus:ring-2 focus:ring-nyse-accent focus:border-transparent"
                        required
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-nyse-text mb-1">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-nyse-border rounded-md focus:ring-2 focus:ring-nyse-accent focus:border-transparent"
                        required
                        placeholder="john@example.com"
                      />
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-nyse-text mb-1">
                        Subject <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-nyse-border rounded-md focus:ring-2 focus:ring-nyse-accent focus:border-transparent bg-white"
                        required
                      >
                        <option value="general">General Inquiry</option>
                        <option value="technical">Technical Support</option>
                        <option value="account">Account Issues</option>
                        <option value="feature">Feature Request</option>
                        <option value="bug">Bug Report</option>
                        <option value="partnership">Partnership Opportunity</option>
                        <option value="feedback">Feedback</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-nyse-text mb-1">
                        Message <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-nyse-border rounded-md focus:ring-2 focus:ring-nyse-accent focus:border-transparent"
                        rows={6}
                        required
                        placeholder="Tell us how we can help..."
                      />
                    </div>

                    {status === 'success' && (
                      <div className="p-4 bg-green-50 text-green-800 rounded-md border border-green-200">
                        ✓ Message sent successfully! We'll respond within 24 hours.
                      </div>
                    )}

                    {status === 'error' && (
                      <div className="p-4 bg-red-50 text-red-800 rounded-md border border-red-200">
                        ✕ {errorMessage}
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full bg-nyse-primary hover:bg-nyse-secondary text-white font-medium py-3 px-6 rounded-md transition duration-200 flex items-center justify-center"
                      disabled={status === 'sending'}
                    >
                      {status === 'sending' ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending...
                        </>
                      ) : 'Send Message'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
}
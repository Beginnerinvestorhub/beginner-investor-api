import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'general',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMessage('');

    try {
      // TODO: Replace with actual API endpoint
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
    <>
      <Head>
        <title>Contact Us | Beginner Investor Hub</title>
        <meta name="description" content="Get in touch with our support team. We're here to help with questions about portfolio simulation, AI coaching, and platform features." />
      </Head>

      <div className="contact-page">
        {/* Header */}
        <header className="contact-header">
          <div className="nyse-container">
            <Link href="/" className="back-link">
              ← Back to Home
            </Link>
            <h1>Contact Us</h1>
            <p className="header-subtitle">
              Have questions? We're here to help you master investing.
            </p>
          </div>
        </header>

        {/* Content */}
        <main className="contact-content">
          <div className="nyse-container">
            <div className="contact-grid">
              {/* Contact Information */}
              <div className="contact-info-section">
                <h2>Get in Touch</h2>
                <p className="section-description">
                  Choose the best way to reach us. We typically respond within 24 hours during business days.
                </p>

                {/* Contact Methods */}
                <div className="contact-methods">
                  <div className="contact-method">
                    <div className="method-icon">📧</div>
                    <div className="method-content">
                      <h3>Email Support</h3>
                      <p>For general inquiries and support</p>
                      <a href="mailto:support@beginnerinvestorhub.com" className="contact-link">
                        support@beginnerinvestorhub.com
                      </a>
                    </div>
                  </div>

                  <div className="contact-method">
                    <div className="method-icon">🔒</div>
                    <div className="method-content">
                      <h3>Privacy Inquiries</h3>
                      <p>Data requests and privacy concerns</p>
                      <a href="mailto:privacy@beginnerinvestorhub.com" className="contact-link">
                        privacy@beginnerinvestorhub.com
                      </a>
                    </div>
                  </div>

                  <div className="contact-method">
                    <div className="method-icon">💼</div>
                    <div className="method-content">
                      <h3>Business Partnerships</h3>
                      <p>Affiliate program and collaborations</p>
                      <a href="mailto:partnerships@beginnerinvestorhub.com" className="contact-link">
                        partnerships@beginnerinvestorhub.com
                      </a>
                    </div>
                  </div>

                  <div className="contact-method">
                    <div className="method-icon">📍</div>
                    <div className="method-content">
                      <h3>Location</h3>
                      <p>Charlotte, North Carolina</p>
                      <p className="location-note">United States</p>
                    </div>
                  </div>
                </div>

                {/* Response Time */}
                <div className="response-info">
                  <h3>Response Time</h3>
                  <ul className="response-list">
                    <li>General inquiries: Within 24 hours</li>
                    <li>Technical support: Within 12 hours</li>
                    <li>Privacy requests: Within 30 days</li>
                    <li>Emergency issues: Immediate escalation</li>
                  </ul>
                </div>

                {/* FAQ Link */}
                <div className="faq-callout">
                  <h4>Looking for quick answers?</h4>
                  <p>Check our FAQ section for common questions about portfolio simulation, risk analysis, and platform features.</p>
                  <Link href="/faq" className="faq-link">
                    Visit FAQ →
                  </Link>
                </div>
              </div>

              {/* Contact Form */}
              <div className="contact-form-section">
                <div className="form-card">
                  <h2>Send Us a Message</h2>
                  <p className="form-description">
                    Fill out the form below and we'll get back to you as soon as possible.
                  </p>

                  <form onSubmit={handleSubmit} className="contact-form">
                    <div className="form-group">
                      <label htmlFor="name" className="form-label">
                        Your Name <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="form-input"
                        required
                        placeholder="John Doe"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="email" className="form-label">
                        Email Address <span className="required">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="form-input"
                        required
                        placeholder="john@example.com"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="subject" className="form-label">
                        Subject <span className="required">*</span>
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="form-select"
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

                    <div className="form-group">
                      <label htmlFor="message" className="form-label">
                        Message <span className="required">*</span>
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        className="form-textarea"
                        rows={6}
                        required
                        placeholder="Tell us how we can help..."
                      />
                    </div>

                    {status === 'success' && (
                      <div className="alert alert-success">
                        ✓ Message sent successfully! We'll respond within 24 hours.
                      </div>
                    )}

                    {status === 'error' && (
                      <div className="alert alert-error">
                        ✕ {errorMessage}
                      </div>
                    )}

                    <button
                      type="submit"
                      className="submit-button"
                      disabled={status === 'sending'}
                    >
                      {status === 'sending' ? 'Sending...' : 'Send Message'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <style jsx>{`
        .contact-page {
          min-height: 100vh;
          background: var(--nyse-color-background-alt);
        }

        .contact-header {
          background: linear-gradient(135deg, var(--nyse-color-primary) 0%, var(--nyse-color-secondary) 100%);
          color: white;
          padding: var(--nyse-spacing-xxl) 0;
        }

        .back-link {
          display: inline-block;
          color: white;
          text-decoration: none;
          margin-bottom: var(--nyse-spacing-md);
          font-size: 0.95rem;
          opacity: 0.9;
          transition: opacity 0.3s ease;
        }

        .back-link:hover {
          opacity: 1;
        }

        .contact-header h1 {
          font-family: var(--nyse-font-serif);
          font-size: clamp(2rem, 4vw, 3rem);
          margin-bottom: var(--nyse-spacing-sm);
          color: white;
        }

        .header-subtitle {
          font-size: 1.1rem;
          opacity: 0.95;
          margin: 0;
        }

        .contact-content {
          padding: var(--nyse-spacing-xxl) 0;
        }

        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--nyse-spacing-xxl);
          max-width: 1200px;
          margin: 0 auto;
        }

        .contact-info-section h2,
        .contact-form-section h2 {
          font-family: var(--nyse-font-serif);
          font-size: 2rem;
          color: var(--nyse-color-dark);
          margin-bottom: var(--nyse-spacing-md);
        }

        .section-description,
        .form-description {
          color: var(--nyse-color-text);
          line-height: 1.7;
          margin-bottom: var(--nyse-spacing-xl);
        }

        .contact-methods {
          display: flex;
          flex-direction: column;
          gap: var(--nyse-spacing-lg);
          margin-bottom: var(--nyse-spacing-xxl);
        }

        .contact-method {
          display: flex;
          gap: var(--nyse-spacing-md);
          padding: var(--nyse-spacing-lg);
          background: var(--nyse-color-background);
          border-radius: 8px;
          border: 1px solid var(--nyse-color-border);
          transition: all 0.3s ease;
        }

        .contact-method:hover {
          border-color: var(--nyse-color-accent);
          box-shadow: 0 4px 12px rgba(0, 61, 122, 0.1);
        }

        .method-icon {
          font-size: 2rem;
          flex-shrink: 0;
        }

        .method-content h3 {
          font-size: 1.1rem;
          color: var(--nyse-color-dark);
          margin-bottom: var(--nyse-spacing-xs);
        }

        .method-content p {
          font-size: 0.9rem;
          color: var(--nyse-color-text-light);
          margin-bottom: var(--nyse-spacing-xs);
        }

        .contact-link {
          color: var(--nyse-color-primary);
          text-decoration: none;
          font-weight: 600;
          font-size: 0.95rem;
          transition: color 0.3s ease;
        }

        .contact-link:hover {
          color: var(--nyse-color-accent);
          text-decoration: underline;
        }

        .location-note {
          font-size: 0.9rem;
          color: var(--nyse-color-text);
          margin: 0;
        }

        .response-info {
          background: var(--nyse-color-background);
          padding: var(--nyse-spacing-lg);
          border-radius: 8px;
          border-left: 4px solid var(--nyse-color-accent);
          margin-bottom: var(--nyse-spacing-xl);
        }

        .response-info h3 {
          font-size: 1.1rem;
          color: var(--nyse-color-dark);
          margin-bottom: var(--nyse-spacing-md);
        }

        .response-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .response-list li {
          padding: var(--nyse-spacing-xs) 0;
          color: var(--nyse-color-text);
          font-size: 0.95rem;
        }

        .faq-callout {
          background: linear-gradient(135deg, rgba(0, 61, 122, 0.05) 0%, rgba(0, 160, 227, 0.05) 100%);
          padding: var(--nyse-spacing-lg);
          border-radius: 8px;
          border: 1px solid var(--nyse-color-border);
        }

        .faq-callout h4 {
          font-size: 1.1rem;
          color: var(--nyse-color-dark);
          margin-bottom: var(--nyse-spacing-sm);
        }

        .faq-callout p {
          color: var(--nyse-color-text);
          margin-bottom: var(--nyse-spacing-md);
          font-size: 0.95rem;
        }

        .faq-link {
          color: var(--nyse-color-primary);
          text-decoration: none;
          font-weight: 600;
          font-size: 0.95rem;
          transition: color 0.3s ease;
        }

        .faq-link:hover {
          color: var(--nyse-color-accent);
        }

        .form-card {
          background: var(--nyse-color-background);
          padding: var(--nyse-spacing-xxl);
          border-radius: 12px;
          border: 1px solid var(--nyse-color-border);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .contact-form {
          display: flex;
          flex-direction: column;
          gap: var(--nyse-spacing-lg);
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: var(--nyse-spacing-sm);
        }

        .form-label {
          font-weight: 600;
          color: var(--nyse-color-dark);
          font-size: 0.95rem;
        }

        .required {
          color: #d32f2f;
        }

        .form-input,
        .form-textarea,
        .form-select {
          font-family: var(--nyse-font-sans);
          font-size: 1rem;
          padding: var(--nyse-spacing-md);
          border: 1px solid var(--nyse-color-border);
          border-radius: 4px;
          transition: all 0.3s ease;
        }

        .form-input:focus,
        .form-textarea:focus,
        .form-select:focus {
          outline: none;
          border-color: var(--nyse-color-primary);
          box-shadow: 0 0 0 3px rgba(0, 61, 122, 0.1);
        }

        .form-textarea {
          resize: vertical;
          min-height: 120px;
        }

        .alert {
          padding: var(--nyse-spacing-md);
          border-radius: 4px;
          font-size: 0.95rem;
          font-weight: 600;
        }

        .alert-success {
          background: #e8f5e9;
          color: #2e7d32;
          border: 1px solid #66bb6a;
        }

        .alert-error {
          background: #ffebee;
          color: #c62828;
          border: 1px solid #ef5350;
        }

        .submit-button {
          padding: var(--nyse-spacing-md) var(--nyse-spacing-xl);
          background: var(--nyse-color-primary);
          color: white;
          border: none;
          border-radius: 4px;
          font-family: var(--nyse-font-sans);
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .submit-button:hover:not(:disabled) {
          background: var(--nyse-color-secondary);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 61, 122, 0.3);
        }

        .submit-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 968px) {
          .contact-grid {
            grid-template-columns: 1fr;
          }

          .contact-header {
            padding: var(--nyse-spacing-lg) 0;
          }

          .form-card {
            padding: var(--nyse-spacing-lg);
          }
        }
      `}</style>
    </>
  );
}
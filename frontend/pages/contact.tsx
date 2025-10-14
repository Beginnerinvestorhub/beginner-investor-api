import React, { useState } from 'react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'general',
    message: '',
  });
  const [status, setStatus] = useState<
    'idle' | 'sending' | 'success' | 'error'
  >('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
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
      setErrorMessage(
        'Failed to send message. Please try emailing us directly.'
      );
    }
  };

  return (
    <>
      <Head>
        <title>Contact Us | Beginner Investor Hub</title>
        <meta
          name="description"
          content="Get in touch with our support team. We're here to help with questions about portfolio simulation, AI coaching, and platform features."
        />
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
              Have questions? We&apos;re here to help you master investing.
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
                  Choose the best way to reach us. We typically respond within
                  24 hours during business days.
                </p>

                {/* Contact Methods */}
                <div className="contact-methods">
                  <div className="contact-method">
                    <div className="method-icon">📧</div>
                    <div className="method-content">
                      <h3>Email Support</h3>
                      <p>For general inquiries and support</p>
                      <a
                        href="mailto:support@beginnerinvestorhub.com"
                        className="contact-link"
                      >
                        support@beginnerinvestorhub.com
                      </a>
                    </div>
                  </div>

                  <div className="contact-method">
                    <div className="method-icon">🔒</div>
                    <div className="method-content">
                      <h3>Privacy Inquiries</h3>
                      <p>Data requests and privacy concerns</p>
                      <a
                        href="mailto:privacy@beginnerinvestorhub.com"
                        className="contact-link"
                      >
                        privacy@beginnerinvestorhub.com
                      </a>
                    </div>
                  </div>

                  <div className="contact-method">
                    <div className="method-icon">💼</div>
                    <div className="method-content">
                      <h3>Business Partnerships</h3>
                      <p>Affiliate program and collaborations</p>
                      <a
                        href="mailto:partnerships@beginnerinvestorhub.com"
                        className="contact-link"
                      >
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
                  <p>
                    Check our FAQ section for common questions about portfolio
                    simulation, risk analysis, and platform features.
                  </p>
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
                    Fill out the form below and we&apos;ll get back to you as soon as
                    possible.
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
                        <option value="partnership">
                          Partnership Opportunity
                        </option>
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
                        ✓ Message sent successfully! We&apos;ll respond within 24
                        hours.
                      </div>
                    )}

                    {status === 'error' && (
                      <div className="alert alert-error">✕ {errorMessage}</div>
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
    </>
  );
}

import Head from 'next/head';
import Link from 'next/link';

export default function TermsOfService() {
  return (
    <>
      <Head>
        <title>Terms of Service | Beginner Investor Hub</title>
        <meta name="description" content="Read the Terms of Service for Beginner Investor Hub - Educational investment tools and portfolio simulation platform." />
      </Head>

      <div className="terms-page">
        {/* Header */}
        <header className="terms-header">
          <div className="nyse-container">
            <Link href="/" className="back-link">
              ← Back to Home
            </Link>
            <h1>Terms of Service</h1>
            <p className="last-updated">Last Updated: October 6, 2025</p>
          </div>
        </header>

        {/* Content */}
        <main className="terms-content">
          <div className="nyse-container">
            <div className="content-wrapper">
              {/* Introduction */}
              <section className="terms-section">
                <p className="intro-text">
                  Welcome to Beginner Investor Hub. By accessing or using our platform, you agree to be bound by these Terms of Service. Please read them carefully before using our services.
                </p>
              </section>

              {/* Service Description */}
              <section className="terms-section">
                <h2>1. Service Description</h2>
                <p>
                  BeginnerInvestorHub.com provides educational financial tools including risk assessment, portfolio simulation, AI-powered behavioral coaching, and investment monitoring. These tools are designed for educational and informational purposes only and do not constitute financial advice, investment recommendations, or professional financial planning services.
                </p>
                <div className="highlight-box">
                  <strong>Important:</strong> All simulations and tools are for learning purposes. Always consult with qualified financial professionals before making investment decisions.
                </div>
              </section>

              {/* User Responsibilities */}
              <section className="terms-section">
                <h2>2. User Responsibilities</h2>
                <p>As a user of our platform, you agree to:</p>
                <ul className="styled-list">
                  <li>Provide accurate and complete information for personalized results</li>
                  <li>Understand that all tools are educational in nature and not financial advice</li>
                  <li>Consult qualified financial professionals for investment decisions</li>
                  <li>Maintain the security and confidentiality of your account credentials</li>
                  <li>Use the platform in compliance with all applicable laws and regulations</li>
                  <li>Not attempt to manipulate, reverse engineer, or abuse the platform</li>
                  <li>Not share your account access with unauthorized parties</li>
                </ul>
              </section>

              {/* Educational Nature & Disclaimers */}
              <section className="terms-section">
                <h2>3. Educational Nature & Disclaimers</h2>
                <div className="warning-box">
                  <h3>⚠️ Important Disclaimers</h3>
                  <ul className="styled-list">
                    <li><strong>No Financial Advice:</strong> Nothing on this platform constitutes professional financial, investment, tax, or legal advice</li>
                    <li><strong>Past Performance:</strong> Past performance does not guarantee future results or investment success</li>
                    <li><strong>Simulation Limitations:</strong> Portfolio simulations are based on historical data and mathematical models that may not reflect real market conditions</li>
                    <li><strong>Market Data:</strong> Market data may be delayed, subject to provider limitations, and may contain errors</li>
                    <li><strong>Estimates Only:</strong> All results, projections, and calculations are estimates and may not reflect actual investment outcomes</li>
                    <li><strong>AI Limitations:</strong> AI-generated insights are based on algorithms and may not account for all variables or personal circumstances</li>
                  </ul>
                </div>
              </section>

              {/* Data Usage & Privacy */}
              <section className="terms-section">
                <h2>4. Data Usage & Privacy</h2>
                <p>We take your privacy seriously and handle your data with care:</p>
                <ul className="styled-list">
                  <li>Personal information is encrypted and stored securely using industry-standard practices</li>
                  <li>Market data is provided by licensed third-party providers (Alpha Vantage, Finnhub)</li>
                  <li>User data is not shared with unauthorized third parties without your consent</li>
                  <li>We use cookies and tracking technologies as described in our Privacy Policy</li>
                  <li>You may request data export or account deletion at any time</li>
                  <li>Portfolio simulations and learning progress are stored to enhance your experience</li>
                </ul>
                <p className="policy-link">
                  For detailed information, please review our <Link href="/privacy">Privacy Policy</Link>.
                </p>
              </section>

              {/* Account Management */}
              <section className="terms-section">
                <h2>5. Account Management</h2>
                <h3>Account Creation</h3>
                <p>You must provide accurate information when creating an account. You are responsible for maintaining the confidentiality of your login credentials.</p>
                
                <h3>Account Termination</h3>
                <p>We reserve the right to suspend or terminate accounts that violate these terms, engage in fraudulent activity, or misuse the platform.</p>
                
                <h3>User-Initiated Deletion</h3>
                <p>You may delete your account at any time through your account settings or by contacting support.</p>
              </section>

              {/* Limitation of Liability */}
              <section className="terms-section">
                <h2>6. Limitation of Liability</h2>
                <div className="legal-box">
                  <p>
                    <strong>TO THE MAXIMUM EXTENT PERMITTED BY LAW:</strong> The platform, its operators, employees, and affiliates are not liable for:
                  </p>
                  <ul className="styled-list">
                    <li>Investment losses or financial damages resulting from use of the platform</li>
                    <li>Inaccuracies in data, calculations, or AI-generated insights</li>
                    <li>Decisions made based on tool outputs or platform information</li>
                    <li>Service interruptions, technical errors, or data loss</li>
                    <li>Third-party content or linked external resources</li>
                    <li>Unauthorized access to your account due to compromised credentials</li>
                  </ul>
                  <p>
                    You acknowledge that investing involves risk and that you are solely responsible for your investment decisions.
                  </p>
                </div>
              </section>

              {/* Intellectual Property */}
              <section className="terms-section">
                <h2>7. Intellectual Property</h2>
                <p>
                  All content, features, functionality, and technology on the platform are owned by Beginner Investor Hub and are protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, or create derivative works without explicit permission.
                </p>
              </section>

              {/* Affiliate Disclosure */}
              <section className="terms-section">
                <h2>8. Affiliate Disclosure</h2>
                <p>
                  Our platform may contain affiliate links to third-party products and services. We may receive compensation for referrals, which helps support the platform. All affiliate relationships are disclosed within content, and recommendations are based on editorial merit, not compensation.
                </p>
              </section>

              {/* Changes to Terms */}
              <section className="terms-section">
                <h2>9. Changes to Terms</h2>
                <p>
                  We reserve the right to modify these Terms of Service at any time. We will notify users of material changes via email or platform notification. Continued use of the platform after changes constitutes acceptance of the updated terms.
                </p>
              </section>

              {/* Governing Law */}
              <section className="terms-section">
                <h2>10. Governing Law</h2>
                <p>
                  These Terms are governed by the laws of the United States and the State of North Carolina, without regard to conflict of law provisions.
                </p>
              </section>

              {/* Contact Information */}
              <section className="terms-section contact-section">
                <h2>11. Contact Information</h2>
                <p>
                  For questions, concerns, or requests regarding these Terms of Service:
                </p>
                <div className="contact-info">
                  <p><strong>Email:</strong> support@beginnerinvestorhub.com</p>
                  <p><strong>Address:</strong> Charlotte, North Carolina, United States</p>
                </div>
              </section>

              {/* Footer Navigation */}
              <div className="terms-footer">
                <Link href="/privacy" className="footer-link">Privacy Policy</Link>
                <span className="separator">•</span>
                <Link href="/" className="footer-link">Home</Link>
                <span className="separator">•</span>
                <Link href="/contact" className="footer-link">Contact</Link>
              </div>
            </div>
          </div>
        </main>
      </div>

      <style jsx>{`
        .terms-page {
          min-height: 100vh;
          background: var(--nyse-color-background-alt);
        }

        .terms-header {
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

        .terms-header h1 {
          font-family: var(--nyse-font-serif);
          font-size: clamp(2rem, 4vw, 3rem);
          margin-bottom: var(--nyse-spacing-sm);
          color: white;
        }

        .last-updated {
          font-size: 0.9rem;
          opacity: 0.9;
          margin: 0;
        }

        .terms-content {
          padding: var(--nyse-spacing-xxl) 0;
        }

        .content-wrapper {
          max-width: 800px;
          margin: 0 auto;
          background: var(--nyse-color-background);
          padding: var(--nyse-spacing-xxl);
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .terms-section {
          margin-bottom: var(--nyse-spacing-xxl);
        }

        .terms-section:last-of-type {
          margin-bottom: 0;
        }

        .intro-text {
          font-size: 1.1rem;
          line-height: 1.8;
          color: var(--nyse-color-text);
        }

        .terms-section h2 {
          font-family: var(--nyse-font-serif);
          font-size: 1.75rem;
          color: var(--nyse-color-primary);
          margin-bottom: var(--nyse-spacing-lg);
          padding-bottom: var(--nyse-spacing-sm);
          border-bottom: 2px solid var(--nyse-color-accent);
        }

        .terms-section h3 {
          font-size: 1.25rem;
          color: var(--nyse-color-dark);
          margin-top: var(--nyse-spacing-lg);
          margin-bottom: var(--nyse-spacing-md);
        }

        .terms-section p {
          color: var(--nyse-color-text);
          line-height: 1.8;
          margin-bottom: var(--nyse-spacing-md);
        }

        .styled-list {
          list-style: none;
          padding-left: 0;
          margin: var(--nyse-spacing-md) 0;
        }

        .styled-list li {
          padding-left: var(--nyse-spacing-lg);
          margin-bottom: var(--nyse-spacing-sm);
          position: relative;
          color: var(--nyse-color-text);
          line-height: 1.7;
        }

        .styled-list li::before {
          content: '▸';
          position: absolute;
          left: 0;
          color: var(--nyse-color-accent);
          font-weight: 700;
        }

        .highlight-box {
          background: linear-gradient(135deg, rgba(0, 61, 122, 0.05) 0%, rgba(0, 160, 227, 0.05) 100%);
          border-left: 4px solid var(--nyse-color-accent);
          padding: var(--nyse-spacing-lg);
          border-radius: 4px;
          margin: var(--nyse-spacing-lg) 0;
        }

        .warning-box {
          background: #fff3e0;
          border-left: 4px solid #ff9800;
          padding: var(--nyse-spacing-lg);
          border-radius: 4px;
          margin: var(--nyse-spacing-lg) 0;
        }

        .warning-box h3 {
          color: #e65100;
          margin-top: 0;
          margin-bottom: var(--nyse-spacing-md);
          font-size: 1.1rem;
        }

        .legal-box {
          background: var(--nyse-color-background-alt);
          border: 2px solid var(--nyse-color-border);
          padding: var(--nyse-spacing-lg);
          border-radius: 4px;
          margin: var(--nyse-spacing-lg) 0;
        }

        .policy-link {
          font-style: italic;
          font-size: 0.95rem;
        }

        .policy-link a {
          color: var(--nyse-color-primary);
          font-weight: 600;
          text-decoration: none;
        }

        .policy-link a:hover {
          text-decoration: underline;
        }

        .contact-section {
          background: var(--nyse-color-background-alt);
          padding: var(--nyse-spacing-xl);
          border-radius: 8px;
          border: 1px solid var(--nyse-color-border);
        }

        .contact-info {
          margin-top: var(--nyse-spacing-md);
        }

        .contact-info p {
          margin-bottom: var(--nyse-spacing-sm);
        }

        .terms-footer {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: var(--nyse-spacing-md);
          padding-top: var(--nyse-spacing-xxl);
          margin-top: var(--nyse-spacing-xxl);
          border-top: 1px solid var(--nyse-color-border);
        }

        .footer-link {
          color: var(--nyse-color-primary);
          text-decoration: none;
          font-weight: 600;
          transition: color 0.3s ease;
        }

        .footer-link:hover {
          color: var(--nyse-color-accent);
        }

        .separator {
          color: var(--nyse-color-text-light);
        }

        @media (max-width: 768px) {
          .content-wrapper {
            padding: var(--nyse-spacing-lg);
          }

          .terms-header {
            padding: var(--nyse-spacing-lg) 0;
          }

          .terms-section h2 {
            font-size: 1.5rem;
          }

          .terms-footer {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </>
  );
}
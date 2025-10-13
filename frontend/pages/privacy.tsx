import Head from 'next/head';
import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <>
      <Head>
        <title>Privacy Policy | Beginner Investor Hub</title>
        <meta
          name="description"
          content="Read our Privacy Policy - Learn how we protect your personal information and data on Beginner Investor Hub."
        />
      </Head>

      <div className="privacy-page">
        {/* Header */}
        <header className="privacy-header">
          <div className="nyse-container">
            <Link href="/" className="back-link">
              ← Back to Home
            </Link>
            <h1>Privacy Policy</h1>
            <p className="last-updated">Last Updated: January 2025</p>
          </div>
        </header>

        {/* Content */}
        <main className="privacy-content">
          <div className="nyse-container">
            <div className="content-wrapper">
              {/* Introduction */}
              <section className="privacy-section">
                <p className="intro-text">
                  At Beginner Investor Hub, we are committed to protecting your
                  privacy and ensuring the security of your personal
                  information. This Privacy Policy explains how we collect, use,
                  disclose, and safeguard your information when you visit our
                  website and use our services.
                </p>
              </section>

              {/* Information We Collect */}
              <section className="privacy-section">
                <h2>1. Information We Collect</h2>

                <h3>Personal Information</h3>
                <p>
                  We collect the following personal information when you use our
                  platform:
                </p>
                <ul className="styled-list">
                  <li>Name and email address when you create an account</li>
                  <li>
                    Profile information you choose to provide (display name,
                    avatar)
                  </li>
                  <li>Communication preferences and notification settings</li>
                  <li>
                    Financial goals, risk tolerance, and investment preferences
                    (for personalized recommendations)
                  </li>
                  <li>Portfolio simulation data and investment choices</li>
                  <li>
                    Behavioral patterns and learning progress for AI coaching
                  </li>
                </ul>

                <h3>Usage Information</h3>
                <p>
                  We automatically collect certain information about your device
                  and how you interact with our platform:
                </p>
                <ul className="styled-list">
                  <li>
                    Pages visited, features used, and time spent on our platform
                  </li>
                  <li>
                    Device information (browser type, operating system, IP
                    address, device identifiers)
                  </li>
                  <li>Cookies and similar tracking technologies</li>
                  <li>
                    Educational progress, gamification achievements, and
                    completion rates
                  </li>
                  <li>Search queries and interaction patterns</li>
                  <li>Referral source and navigation paths</li>
                </ul>

                <h3>Market Data</h3>
                <p>
                  We access market data through third-party providers (Alpha
                  Vantage, Finnhub) to power our simulation tools. This data is
                  not personal to you but is used in aggregate to provide
                  accurate portfolio analysis.
                </p>
              </section>

              {/* How We Use Your Information */}
              <section className="privacy-section">
                <h2>2. How We Use Your Information</h2>
                <ul className="styled-list">
                  <li>
                    <strong>Service Provision:</strong> Deliver personalized
                    investment tools, educational content, portfolio
                    simulations, and AI-powered behavioral coaching
                  </li>
                  <li>
                    <strong>Account Management:</strong> Create and maintain
                    your account, process authentication via Firebase, and
                    provide customer support
                  </li>
                  <li>
                    <strong>Personalization:</strong> Customize your experience
                    based on your financial goals, risk tolerance, and learning
                    progress
                  </li>
                  <li>
                    <strong>Communication:</strong> Send important updates,
                    educational newsletters, feature announcements, and service
                    notifications
                  </li>
                  <li>
                    <strong>Analytics:</strong> Analyze usage patterns to
                    improve our platform, develop new features, and optimize
                    user experience
                  </li>
                  <li>
                    <strong>Security:</strong> Detect and prevent fraud, abuse,
                    unauthorized access, and security threats
                  </li>
                  <li>
                    <strong>AI Training:</strong> Improve our AI behavioral
                    coaching algorithms (anonymized and aggregated data only)
                  </li>
                  <li>
                    <strong>Legal Compliance:</strong> Comply with applicable
                    laws, regulations, and legal processes
                  </li>
                </ul>
              </section>

              {/* Information Sharing */}
              <section className="privacy-section">
                <h2>3. Information Sharing and Disclosure</h2>
                <div className="highlight-box">
                  <strong>
                    We do not sell, trade, or rent your personal information to
                    third parties.
                  </strong>
                </div>
                <p>
                  We may share your information only in the following
                  circumstances:
                </p>
                <ul className="styled-list">
                  <li>
                    <strong>Service Providers:</strong> Trusted third-party
                    vendors who assist in operating our platform:
                    <ul className="nested-list">
                      <li>Vercel (frontend hosting)</li>
                      <li>Render (backend infrastructure)</li>
                      <li>Firebase (authentication)</li>
                      <li>PostgreSQL (database hosting)</li>
                      <li>Redis (caching service)</li>
                      <li>OpenAI (AI processing)</li>
                      <li>Email service providers</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Market Data Providers:</strong> Alpha Vantage and
                    Finnhub for real-time and historical market data
                  </li>
                  <li>
                    <strong>Legal Requirements:</strong> When required by law,
                    court order, subpoena, or government regulation
                  </li>
                  <li>
                    <strong>Business Transfers:</strong> In connection with a
                    merger, acquisition, reorganization, or sale of business
                    assets
                  </li>
                  <li>
                    <strong>Consent:</strong> When you explicitly consent to
                    sharing your information
                  </li>
                  <li>
                    <strong>Affiliate Partners:</strong> Anonymized data for
                    affiliate marketing performance tracking (no personally
                    identifiable information)
                  </li>
                </ul>
              </section>

              {/* Data Security */}
              <section className="privacy-section">
                <h2>4. Data Security</h2>
                <p>
                  We implement robust security measures to protect your personal
                  information:
                </p>
                <div className="security-grid">
                  <div className="security-item">
                    <div className="security-icon">🔒</div>
                    <h4>Encryption</h4>
                    <p>
                      SSL/TLS encryption for all data transmission between your
                      device and our servers
                    </p>
                  </div>
                  <div className="security-item">
                    <div className="security-icon">🛡️</div>
                    <h4>Secure Infrastructure</h4>
                    <p>
                      Enterprise-grade cloud infrastructure with regular
                      security audits and penetration testing
                    </p>
                  </div>
                  <div className="security-item">
                    <div className="security-icon">🔑</div>
                    <h4>Access Controls</h4>
                    <p>
                      Multi-factor authentication, role-based access controls,
                      and least-privilege principles
                    </p>
                  </div>
                  <div className="security-item">
                    <div className="security-icon">📊</div>
                    <h4>Monitoring</h4>
                    <p>
                      24/7 security monitoring, intrusion detection, and
                      incident response protocols
                    </p>
                  </div>
                  <div className="security-item">
                    <div className="security-icon">🔄</div>
                    <h4>Regular Updates</h4>
                    <p>
                      Continuous security patches, dependency updates, and
                      vulnerability scanning
                    </p>
                  </div>
                  <div className="security-item">
                    <div className="security-icon">👥</div>
                    <h4>Staff Training</h4>
                    <p>
                      Comprehensive employee training on data protection,
                      privacy, and security best practices
                    </p>
                  </div>
                </div>
                <div className="warning-box">
                  <strong>Important:</strong> While we implement
                  industry-standard security measures, no method of transmission
                  over the internet or electronic storage is 100% secure. We
                  cannot guarantee absolute security.
                </div>
              </section>

              {/* Privacy Rights */}
              <section className="privacy-section">
                <h2>5. Your Privacy Rights</h2>
                <p>
                  You have the following rights regarding your personal
                  information:
                </p>
                <ul className="styled-list">
                  <li>
                    <strong>Access:</strong> Request a copy of the personal
                    information we hold about you
                  </li>
                  <li>
                    <strong>Correction:</strong> Update or correct inaccurate or
                    incomplete personal information
                  </li>
                  <li>
                    <strong>Deletion:</strong> Request deletion of your personal
                    information (subject to legal retention requirements)
                  </li>
                  <li>
                    <strong>Portability:</strong> Export your data in a
                    machine-readable format (JSON/CSV)
                  </li>
                  <li>
                    <strong>Opt-out:</strong> Unsubscribe from marketing
                    communications at any time via email footer links
                  </li>
                  <li>
                    <strong>Restriction:</strong> Limit how we process your
                    personal information
                  </li>
                  <li>
                    <strong>Objection:</strong> Object to processing of your
                    information for certain purposes
                  </li>
                  <li>
                    <strong>Withdraw Consent:</strong> Withdraw previously given
                    consent at any time
                  </li>
                </ul>
                <p className="rights-note">
                  To exercise any of these rights, please contact us at
                  privacy@beginnerinvestorhub.com. We will respond within 30
                  days.
                </p>
              </section>

              {/* Cookies and Tracking */}
              <section className="privacy-section">
                <h2>6. Cookies and Tracking Technologies</h2>
                <p>
                  We use cookies and similar technologies to enhance your
                  experience:
                </p>
                <div className="cookie-table">
                  <div className="cookie-row">
                    <div className="cookie-type">
                      <strong>Essential Cookies</strong>
                      <span className="cookie-badge required">Required</span>
                    </div>
                    <p>
                      Necessary for basic platform functionality,
                      authentication, and security. Cannot be disabled.
                    </p>
                  </div>
                  <div className="cookie-row">
                    <div className="cookie-type">
                      <strong>Analytics Cookies</strong>
                      <span className="cookie-badge optional">Optional</span>
                    </div>
                    <p>
                      Help us understand how you use our platform to improve
                      features and user experience.
                    </p>
                  </div>
                  <div className="cookie-row">
                    <div className="cookie-type">
                      <strong>Preference Cookies</strong>
                      <span className="cookie-badge optional">Optional</span>
                    </div>
                    <p>
                      Remember your settings, preferences, and previous choices
                      for a personalized experience.
                    </p>
                  </div>
                  <div className="cookie-row">
                    <div className="cookie-type">
                      <strong>Marketing Cookies</strong>
                      <span className="cookie-badge optional">Optional</span>
                    </div>
                    <p>
                      Deliver relevant content, advertisements, and track
                      affiliate marketing performance.
                    </p>
                  </div>
                </div>
                <p className="cookie-control">
                  You can control cookie settings through your browser
                  preferences. Note that disabling certain cookies may limit
                  platform functionality.
                </p>
              </section>

              {/* Children's Privacy */}
              <section className="privacy-section">
                <h2>7. Children's Privacy</h2>
                <div className="legal-box">
                  <p>
                    Our services are not intended for individuals under 18 years
                    of age. We do not knowingly collect personal information
                    from children under 18. If we become aware that we have
                    collected such information, we will take immediate steps to
                    delete it promptly.
                  </p>
                  <p>
                    If you are a parent or guardian and believe your child has
                    provided us with personal information, please contact us at
                    privacy@beginnerinvestorhub.com.
                  </p>
                </div>
              </section>

              {/* Data Retention */}
              <section className="privacy-section">
                <h2>8. Data Retention</h2>
                <p>
                  We retain your personal information for as long as necessary
                  to:
                </p>
                <ul className="styled-list">
                  <li>Provide our services and maintain your account</li>
                  <li>
                    Comply with legal obligations and regulatory requirements
                  </li>
                  <li>Resolve disputes and enforce our agreements</li>
                  <li>
                    Improve our services through analytics (anonymized data)
                  </li>
                </ul>
                <p>
                  When you delete your account, we will delete or anonymize your
                  personal information within 90 days, except where retention is
                  required by law or for legitimate business purposes.
                </p>
              </section>

              {/* International Transfers */}
              <section className="privacy-section">
                <h2>9. International Data Transfers</h2>
                <p>
                  Your information may be transferred to and processed in
                  countries other than your own, including the United States. We
                  ensure appropriate safeguards are in place to protect your
                  information in accordance with applicable data protection laws
                  (GDPR, CCPA, etc.).
                </p>
                <p>
                  Our third-party service providers are contractually obligated
                  to protect your data and comply with applicable privacy
                  regulations.
                </p>
              </section>

              {/* Third-Party Links */}
              <section className="privacy-section">
                <h2>10. Third-Party Links and Services</h2>
                <p>
                  Our platform may contain links to third-party websites,
                  products, or services (including affiliate links). We are not
                  responsible for the privacy practices of these third parties.
                  We encourage you to review their privacy policies before
                  providing any personal information.
                </p>
              </section>

              {/* Contact Information */}
              <section className="privacy-section contact-section">
                <h2>11. Contact Us</h2>
                <p>
                  If you have questions about this Privacy Policy or wish to
                  exercise your privacy rights, please contact us:
                </p>
                <div className="contact-info">
                  <div className="contact-item">
                    <strong>Email:</strong> privacy@beginnerinvestorhub.com
                  </div>
                  <div className="contact-item">
                    <strong>General Support:</strong>{' '}
                    support@beginnerinvestorhub.com
                  </div>
                  <div className="contact-item">
                    <strong>Location:</strong> Charlotte, North Carolina, United
                    States
                  </div>
                  <div className="contact-item">
                    <strong>Response Time:</strong> We will respond to your
                    inquiry within 30 days
                  </div>
                </div>
              </section>

              {/* Updates to Policy */}
              <section className="privacy-section">
                <h2>12. Updates to This Policy</h2>
                <p>
                  We may update this Privacy Policy from time to time to reflect
                  changes in our practices, technology, legal requirements, or
                  other operational needs. We will notify you of any material
                  changes by:
                </p>
                <ul className="styled-list">
                  <li>
                    Posting the updated policy on our website with a new "Last
                    Updated" date
                  </li>
                  <li>Sending an email notification to registered users</li>
                  <li>
                    Displaying a prominent notice on our platform for 30 days
                  </li>
                </ul>
                <p>
                  Your continued use of the platform after changes take effect
                  constitutes acceptance of the updated Privacy Policy.
                </p>
              </section>

              {/* Footer Navigation */}
              <div className="privacy-footer">
                <Link href="/terms" className="footer-link">
                  Terms of Service
                </Link>
                <span className="separator">•</span>
                <Link href="/" className="footer-link">
                  Home
                </Link>
                <span className="separator">•</span>
                <Link href="/contact" className="footer-link">
                  Contact
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>

      <style jsx>{`
        .privacy-page {
          min-height: 100vh;
          background: var(--nyse-color-background-alt);
        }

        .privacy-header {
          background: linear-gradient(
            135deg,
            var(--nyse-color-secondary) 0%,
            var(--nyse-color-accent) 100%
          );
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

        .privacy-header h1 {
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

        .privacy-content {
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

        .privacy-section {
          margin-bottom: var(--nyse-spacing-xxl);
        }

        .intro-text {
          font-size: 1.1rem;
          line-height: 1.8;
          color: var(--nyse-color-text);
        }

        .privacy-section h2 {
          font-family: var(--nyse-font-serif);
          font-size: 1.75rem;
          color: var(--nyse-color-primary);
          margin-bottom: var(--nyse-spacing-lg);
          padding-bottom: var(--nyse-spacing-sm);
          border-bottom: 2px solid var(--nyse-color-accent);
        }

        .privacy-section h3 {
          font-size: 1.25rem;
          color: var(--nyse-color-dark);
          margin-top: var(--nyse-spacing-lg);
          margin-bottom: var(--nyse-spacing-md);
        }

        .privacy-section h4 {
          font-size: 1.1rem;
          color: var(--nyse-color-dark);
          margin-bottom: var(--nyse-spacing-sm);
        }

        .privacy-section p {
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

        .nested-list {
          margin-top: var(--nyse-spacing-sm);
          margin-left: var(--nyse-spacing-lg);
        }

        .highlight-box {
          background: linear-gradient(
            135deg,
            rgba(0, 160, 227, 0.1) 0%,
            rgba(0, 160, 227, 0.05) 100%
          );
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

        .legal-box {
          background: var(--nyse-color-background-alt);
          border: 2px solid var(--nyse-color-border);
          padding: var(--nyse-spacing-lg);
          border-radius: 4px;
          margin: var(--nyse-spacing-lg) 0;
        }

        .security-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: var(--nyse-spacing-lg);
          margin: var(--nyse-spacing-lg) 0;
        }

        .security-item {
          background: var(--nyse-color-background-alt);
          padding: var(--nyse-spacing-lg);
          border-radius: 8px;
          border: 1px solid var(--nyse-color-border);
          text-align: center;
        }

        .security-icon {
          font-size: 2.5rem;
          margin-bottom: var(--nyse-spacing-sm);
        }

        .cookie-table {
          margin: var(--nyse-spacing-lg) 0;
        }

        .cookie-row {
          padding: var(--nyse-spacing-lg);
          background: var(--nyse-color-background-alt);
          border-radius: 8px;
          margin-bottom: var(--nyse-spacing-md);
          border-left: 4px solid var(--nyse-color-accent);
        }

        .cookie-type {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--nyse-spacing-sm);
        }

        .cookie-badge {
          display: inline-block;
          padding: var(--nyse-spacing-xs) var(--nyse-spacing-sm);
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        .cookie-badge.required {
          background: #ffebee;
          color: #c62828;
        }

        .cookie-badge.optional {
          background: #e3f2fd;
          color: #1976d2;
        }

        .cookie-control {
          font-style: italic;
          font-size: 0.95rem;
          color: var(--nyse-color-text-light);
        }

        .rights-note {
          font-style: italic;
          padding: var(--nyse-spacing-md);
          background: var(--nyse-color-background-alt);
          border-radius: 4px;
          margin-top: var(--nyse-spacing-md);
        }

        .contact-section {
          background: var(--nyse-color-background-alt);
          padding: var(--nyse-spacing-xl);
          border-radius: 8px;
          border: 1px solid var(--nyse-color-border);
        }

        .contact-info {
          margin-top: var(--nyse-spacing-md);
          display: flex;
          flex-direction: column;
          gap: var(--nyse-spacing-sm);
        }

        .contact-item {
          padding: var(--nyse-spacing-sm);
        }

        .privacy-footer {
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

          .privacy-header {
            padding: var(--nyse-spacing-lg) 0;
          }

          .privacy-section h2 {
            font-size: 1.5rem;
          }

          .security-grid {
            grid-template-columns: 1fr;
          }

          .privacy-footer {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </>
  );
}

import Head from 'next/head';
import Link from 'next/link';

export default function TermsOfService() {
  // Define custom colors/variables as Tailwind classes where possible
  // NOTE: Assuming 'nyse-color-primary' is a dark blue (e.g., blue-800)
  // and 'nyse-color-secondary' is a slightly lighter blue (e.g., blue-600)
  // and 'nyse-color-accent' is an accent color (e.g., teal-500).

  return (
    <>
      <Head>
        <title>Terms of Service | Beginner Investor Hub</title>
        <meta
          name="description"
          content="Read the Terms of Service for Beginner Investor Hub - Educational investment tools and portfolio simulation platform."
        />
      </Head>

      {/* terms-page: min-h-screen, bg-gray-50 (alt color) */}
      <div className="min-h-screen bg-gray-50 text-gray-800">
        {/* terms-header: background gradient, text white, padding */}
        <header className="bg-gradient-to-br from-blue-800 to-blue-600 text-white py-16 md:py-24">
          {/* nyse-container: max-w-7xl, mx-auto, px-4, sm:px-6, lg:px-8 */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* back-link: inline-block, color white, no-underline, margin-bottom, font-size, opacity, transition */}
            <Link href="/" className="inline-block text-white no-underline mb-4 text-sm opacity-90 hover:opacity-100 transition duration-300">
              ← Back to Home
            </Link>
            {/* terms-header h1: font-serif, font-size clamp, margin-bottom */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl mb-2 text-white font-extrabold">
              Terms of Service
            </h1>
            {/* last-updated: font-size, opacity */}
            <p className="text-sm opacity-90 m-0">Last Updated: October 6, 2025</p>
          </div>
        </header>

        {/* Content Section */}
        {/* terms-content: padding */}
        <main className="py-16 md:py-24">
          {/* nyse-container: max-w-7xl, mx-auto, px-4, sm:px-6, lg:px-8 */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* content-wrapper: max-width, margin auto, background, padding, border-radius, box-shadow */}
            <div className="max-w-4xl mx-auto bg-white p-6 sm:p-12 lg:p-16 rounded-xl shadow-2xl">
              
              {/* Introduction */}
              {/* terms-section: margin-bottom */}
              <section className="mb-12">
                {/* intro-text: font-size, line-height, color */}
                <p className="text-lg leading-relaxed text-gray-700">
                  Welcome to Beginner Investor Hub. By accessing or using our
                  platform, you agree to be bound by these Terms of Service.
                  Please read them carefully before using our services.
                </p>
              </section>

              {/* --- Service Description --- */}
              <section className="mb-12">
                {/* terms-section h2: font-serif, font-size, color primary, margin-bottom, padding-bottom, border-bottom */}
                <h2 className="font-serif text-2xl sm:text-3xl text-blue-800 mb-4 pb-2 border-b-2 border-teal-500 font-semibold">
                  1. Service Description
                </h2>
                {/* terms-section p: color, line-height, margin-bottom */}
                <p className="text-gray-700 leading-relaxed mb-4">
                  BeginnerInvestorHub.com provides educational financial tools
                  including risk assessment, portfolio simulation, AI-powered
                  behavioral coaching, and investment monitoring. These tools
                  are designed for educational and informational purposes only
                  and do not constitute financial advice, investment
                  recommendations, or professional financial planning services.
                </p>
                {/* highlight-box: light blue background, left border, padding, border-radius, margin */}
                <div className="bg-blue-50 border-l-4 border-teal-500 p-4 rounded-md my-6">
                  <strong className="text-blue-900">Important:</strong> All simulations and tools are for
                  learning purposes. Always consult with qualified financial
                  professionals before making investment decisions.
                </div>
              </section>

              {/* --- User Responsibilities --- */}
              <section className="mb-12">
                <h2 className="font-serif text-2xl sm:text-3xl text-blue-800 mb-4 pb-2 border-b-2 border-teal-500 font-semibold">
                  2. User Responsibilities
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">As a user of our platform, you agree to:</p>
                {/* styled-list: list-none, padding-left, margin */}
                <ul className="list-none pl-0 my-4 space-y-2">
                  {/* styled-list li: padding-left, position relative, before content */}
                  <li className="relative pl-6 text-gray-700 leading-relaxed before:content-['▸'] before:absolute before:left-0 before:text-teal-500 before:font-bold">
                    Provide accurate and complete information for personalized results
                  </li>
                  <li className="relative pl-6 text-gray-700 leading-relaxed before:content-['▸'] before:absolute before:left-0 before:text-teal-500 before:font-bold">
                    Understand that all tools are educational in nature and not financial advice
                  </li>
                  <li className="relative pl-6 text-gray-700 leading-relaxed before:content-['▸'] before:absolute before:left-0 before:text-teal-500 before:font-bold">
                    Consult qualified financial professionals for investment decisions
                  </li>
                  <li className="relative pl-6 text-gray-700 leading-relaxed before:content-['▸'] before:absolute before:left-0 before:text-teal-500 before:font-bold">
                    Maintain the security and confidentiality of your account credentials
                  </li>
                  <li className="relative pl-6 text-gray-700 leading-relaxed before:content-['▸'] before:absolute before:left-0 before:text-teal-500 before:font-bold">
                    Use the platform in compliance with all applicable laws and regulations
                  </li>
                  <li className="relative pl-6 text-gray-700 leading-relaxed before:content-['▸'] before:absolute before:left-0 before:text-teal-500 before:font-bold">
                    Not attempt to manipulate, reverse engineer, or abuse the platform
                  </li>
                  <li className="relative pl-6 text-gray-700 leading-relaxed before:content-['▸'] before:absolute before:left-0 before:text-teal-500 before:font-bold">
                    Not share your account access with unauthorized parties
                  </li>
                </ul>
              </section>

              {/* --- Educational Nature & Disclaimers --- */}
              <section className="mb-12">
                <h2 className="font-serif text-2xl sm:text-3xl text-blue-800 mb-4 pb-2 border-b-2 border-teal-500 font-semibold">
                  3. Educational Nature & Disclaimers
                </h2>
                {/* warning-box: light orange background, left border, padding, border-radius, margin */}
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-md my-6">
                  {/* warning-box h3: color, margin-top/bottom, font-size */}
                  <h3 className="text-orange-800 mt-0 mb-3 text-lg font-bold">⚠️ Important Disclaimers</h3>
                  <ul className="list-none pl-0 space-y-2">
                    <li className="relative pl-6 text-gray-700 leading-relaxed before:content-['▸'] before:absolute before:left-0 before:text-amber-500 before:font-bold">
                      <strong>No Financial Advice:</strong> Nothing on this
                      platform constitutes professional financial, investment,
                      tax, or legal advice
                    </li>
                    <li className="relative pl-6 text-gray-700 leading-relaxed before:content-['▸'] before:absolute before:left-0 before:text-amber-500 before:font-bold">
                      <strong>Past Performance:</strong> Past performance does
                      not guarantee future results or investment success
                    </li>
                    <li className="relative pl-6 text-gray-700 leading-relaxed before:content-['▸'] before:absolute before:left-0 before:text-amber-500 before:font-bold">
                      <strong>Simulation Limitations:</strong> Portfolio
                      simulations are based on historical data and mathematical
                      models that may not reflect real market conditions
                    </li>
                    <li className="relative pl-6 text-gray-700 leading-relaxed before:content-['▸'] before:absolute before:left-0 before:text-amber-500 before:font-bold">
                      <strong>Market Data:</strong> Market data may be delayed,
                      subject to provider limitations, and may contain errors
                    </li>
                    <li className="relative pl-6 text-gray-700 leading-relaxed before:content-['▸'] before:absolute before:left-0 before:text-amber-500 before:font-bold">
                      <strong>Estimates Only:</strong> All results, projections,
                      and calculations are estimates and may not reflect actual
                      investment outcomes
                    </li>
                    <li className="relative pl-6 text-gray-700 leading-relaxed before:content-['▸'] before:absolute before:left-0 before:text-amber-500 before:font-bold">
                      <strong>AI Limitations:</strong> AI-generated insights are
                      based on algorithms and may not account for all variables
                      or personal circumstances
                    </li>
                  </ul>
                </div>
              </section>

              {/* --- Data Usage & Privacy --- */}
              <section className="mb-12">
                <h2 className="font-serif text-2xl sm:text-3xl text-blue-800 mb-4 pb-2 border-b-2 border-teal-500 font-semibold">
                  4. Data Usage & Privacy
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We take your privacy seriously and handle your data with care:
                </p>
                <ul className="list-none pl-0 my-4 space-y-2">
                  <li className="relative pl-6 text-gray-700 leading-relaxed before:content-['▸'] before:absolute before:left-0 before:text-teal-500 before:font-bold">
                    Personal information is encrypted and stored securely using
                    industry-standard practices
                  </li>
                  <li className="relative pl-6 text-gray-700 leading-relaxed before:content-['▸'] before:absolute before:left-0 before:text-teal-500 before:font-bold">
                    Market data is provided by licensed third-party providers
                    (Alpha Vantage, Finnhub)
                  </li>
                  <li className="relative pl-6 text-gray-700 leading-relaxed before:content-['▸'] before:absolute before:left-0 before:text-teal-500 before:font-bold">
                    User data is not shared with unauthorized third parties
                    without your consent
                  </li>
                  <li className="relative pl-6 text-gray-700 leading-relaxed before:content-['▸'] before:absolute before:left-0 before:text-teal-500 before:font-bold">
                    We use cookies and tracking technologies as described in our
                    Privacy Policy
                  </li>
                  <li className="relative pl-6 text-gray-700 leading-relaxed before:content-['▸'] before:absolute before:left-0 before:text-teal-500 before:font-bold">
                    You may request data export or account deletion at any time
                  </li>
                  <li className="relative pl-6 text-gray-700 leading-relaxed before:content-['▸'] before:absolute before:left-0 before:text-teal-500 before:font-bold">
                    Portfolio simulations and learning progress are stored to
                    enhance your experience
                  </li>
                </ul>
                {/* policy-link: italic, font-size, link styling */}
                <p className="italic text-sm text-gray-600 mt-6">
                  For detailed information, please review our{' '}
                  <Link href="/privacy" className="text-blue-800 font-semibold hover:underline">
                    Privacy Policy
                  </Link>.
                </p>
              </section>

              {/* --- Account Management --- */}
              <section className="mb-12">
                <h2 className="font-serif text-2xl sm:text-3xl text-blue-800 mb-4 pb-2 border-b-2 border-teal-500 font-semibold">
                  5. Account Management
                </h2>
                <h3 className="text-xl text-gray-800 mt-6 mb-3 font-medium">Account Creation</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You must provide accurate information when creating an
                  account. You are responsible for maintaining the
                  confidentiality of your login credentials.
                </p>
                <h3 className="text-xl text-gray-800 mt-6 mb-3 font-medium">Account Termination</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We reserve the right to suspend or terminate accounts that
                  violate these terms, engage in fraudulent activity, or misuse
                  the platform.
                </p>
                <h3 className="text-xl text-gray-800 mt-6 mb-3 font-medium">User-Initiated Deletion</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You may delete your account at any time through your account
                  settings or by contacting support.
                </p>
              </section>

              {/* --- Limitation of Liability --- */}
              <section className="mb-12">
                <h2 className="font-serif text-2xl sm:text-3xl text-blue-800 mb-4 pb-2 border-b-2 border-teal-500 font-semibold">
                  6. Limitation of Liability
                </h2>
                {/* legal-box: alt background, border, padding, border-radius, margin */}
                <div className="bg-gray-50 border-2 border-gray-300 p-6 rounded-md my-6">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    <strong className="text-red-600">TO THE MAXIMUM EXTENT PERMITTED BY LAW:</strong> The
                    platform, its operators, employees, and affiliates are not
                    liable for:
                  </p>
                  <ul className="list-none pl-0 my-4 space-y-2">
                    <li className="relative pl-6 text-gray-700 leading-relaxed before:content-['▸'] before:absolute before:left-0 before:text-gray-500 before:font-bold">
                      Investment losses or financial damages resulting from use
                      of the platform
                    </li>
                    <li className="relative pl-6 text-gray-700 leading-relaxed before:content-['▸'] before:absolute before:left-0 before:text-gray-500 before:font-bold">
                      Inaccuracies in data, calculations, or AI-generated
                      insights
                    </li>
                    <li className="relative pl-6 text-gray-700 leading-relaxed before:content-['▸'] before:absolute before:left-0 before:text-gray-500 before:font-bold">
                      Decisions made based on tool outputs or platform
                      information
                    </li>
                    <li className="relative pl-6 text-gray-700 leading-relaxed before:content-['▸'] before:absolute before:left-0 before:text-gray-500 before:font-bold">
                      Service interruptions, technical errors, or data loss
                    </li>
                    <li className="relative pl-6 text-gray-700 leading-relaxed before:content-['▸'] before:absolute before:left-0 before:text-gray-500 before:font-bold">Third-party content or linked external resources</li>
                    <li className="relative pl-6 text-gray-700 leading-relaxed before:content-['▸'] before:absolute before:left-0 before:text-gray-500 before:font-bold">
                      Unauthorized access to your account due to compromised
                      credentials
                    </li>
                  </ul>
                  <p className="text-gray-700 leading-relaxed mt-6">
                    You acknowledge that investing involves risk and that you
                    are solely responsible for your investment decisions.
                  </p>
                </div>
              </section>

              {/* --- Intellectual Property --- */}
              <section className="mb-12">
                <h2 className="font-serif text-2xl sm:text-3xl text-blue-800 mb-4 pb-2 border-b-2 border-teal-500 font-semibold">
                  7. Intellectual Property
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  All content, features, functionality, and technology on the
                  platform are owned by Beginner Investor Hub and are protected
                  by copyright, trademark, and other intellectual property laws.
                  You may not copy, modify, distribute, or create derivative
                  works without explicit permission.
                </p>
              </section>

              {/* --- Affiliate Disclosure --- */}
              <section className="mb-12">
                <h2 className="font-serif text-2xl sm:text-3xl text-blue-800 mb-4 pb-2 border-b-2 border-teal-500 font-semibold">
                  8. Affiliate Disclosure
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Our platform may contain affiliate links to third-party
                  products and services. We may receive compensation for
                  referrals, which helps support the platform. All affiliate
                  relationships are disclosed within content, and
                  recommendations are based on editorial merit, not
                  compensation.
                </p>
              </section>

              {/* --- Changes to Terms --- */}
              <section className="mb-12">
                <h2 className="font-serif text-2xl sm:text-3xl text-blue-800 mb-4 pb-2 border-b-2 border-teal-500 font-semibold">
                  9. Changes to Terms
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We reserve the right to modify these Terms of Service at any
                  time. We will notify users of material changes via email or
                  platform notification. Continued use of the platform after
                  changes constitutes acceptance of the updated terms.
                </p>
              </section>

              {/* --- Governing Law --- */}
              <section className="mb-12">
                <h2 className="font-serif text-2xl sm:text-3xl text-blue-800 mb-4 pb-2 border-b-2 border-teal-500 font-semibold">
                  10. Governing Law
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  These Terms are governed by the laws of the United States and
                  the State of North Carolina, without regard to conflict of law
                  provisions.
                </p>
              </section>

              {/* --- Contact Information --- */}
              <section className="mb-12 bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h2 className="font-serif text-2xl sm:text-3xl text-blue-800 mb-4 pb-2 border-b-2 border-teal-500 font-semibold">
                  11. Contact Information
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  For questions, concerns, or requests regarding these Terms of
                  Service:
                </p>
                <div className="mt-4">
                  <p className="mb-2">
                    <strong className="font-semibold text-gray-900">Email:</strong> support@beginnerinvestorhub.com
                  </p>
                  <p className="mb-2">
                    <strong className="font-semibold text-gray-900">Address:</strong> Charlotte, North Carolina, United
                    States
                  </p>
                </div>
              </section>

              {/* --- Footer Navigation --- */}
              <div className="flex justify-center items-center flex-wrap gap-4 pt-12 mt-12 border-t border-gray-200">
                <Link href="/privacy" className="text-blue-800 no-underline font-semibold hover:text-teal-500 transition duration-300">
                  Privacy Policy
                </Link>
                <span className="text-gray-400">•</span>
                <Link href="/" className="text-blue-800 no-underline font-semibold hover:text-teal-500 transition duration-300">
                  Home
                </Link>
                <span className="text-gray-400">•</span>
                <Link href="/contact" className="text-blue-800 no-underline font-semibold hover:text-teal-500 transition duration-300">
                  Contact
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
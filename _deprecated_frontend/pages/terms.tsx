import Head from 'next/head';

export default function TermsOfService() {
  return (
    <>
      <Head>
        <title>Terms of Service | BeginnerInvestorHub</title>
        <meta name="description" content="Read the Terms of Service for BeginnerInvestorHub.com" />
      </Head>
      <main className="max-w-2xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
        <h2 className="text-xl font-semibold mt-8 mb-2">Service Description</h2>
        <p className="mb-4">BeginnerInvestorHub.com provides educational financial tools including risk assessment, portfolio simulation, and investment monitoring. These tools are for informational purposes only and do not constitute financial advice.</p>
        <h2 className="text-xl font-semibold mt-8 mb-2">User Responsibilities</h2>
        <ul className="list-disc ml-6 mb-4">
          <li>Provide accurate information for personalized results</li>
          <li>Understand that all tools are educational in nature</li>
          <li>Consult qualified professionals for investment decisions</li>
          <li>Maintain account security and confidentiality</li>
        </ul>
        <h2 className="text-xl font-semibold mt-8 mb-2">Disclaimers</h2>
        <ul className="list-disc ml-6 mb-4">
          <li>Past performance does not guarantee future results</li>
          <li>Portfolio simulations are based on historical data and mathematical models</li>
          <li>Market data may be delayed and subject to provider limitations</li>
          <li>Results are estimates and may not reflect actual investment outcomes</li>
        </ul>
        <h2 className="text-xl font-semibold mt-8 mb-2">Data Usage</h2>
        <ul className="list-disc ml-6 mb-4">
          <li>Personal information is encrypted and stored securely</li>
          <li>Market data is provided by licensed third-party providers</li>
          <li>User data is not shared with unauthorized parties</li>
          <li>Users may request data export or deletion at any time</li>
        </ul>
        <h2 className="text-xl font-semibold mt-8 mb-2">Limitation of Liability</h2>
        <p className="mb-4">The platform and its operators are not liable for investment losses, data accuracy issues, or decisions made based on tool outputs.</p>
        <h2 className="text-xl font-semibold mt-8 mb-2">Contact</h2>
        <p className="mb-4">For questions about these terms, contact support@beginnerinvestorhub.com.</p>
      </main>
    </>
  );
}

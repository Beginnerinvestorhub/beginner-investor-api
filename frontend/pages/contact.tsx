import Head from 'next/head';

export default function Contact() {
  return (
    <>
      <Head>
        <title>Contact | BeginnerInvestorHub</title>
        <meta name="description" content="Contact us for questions or support." />
      </Head>
      <main className="max-w-2xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-6">Contact</h1>
        <p className="mb-4">This is a placeholder Contact page. Add your support email, contact form, or other ways for users to reach you here.</p>
        <p className="mb-4">For urgent issues, please email <a href="mailto:beginnerinvestorhub@gmail.com" className="text-indigo-700 underline">beginnerinvestorhub@gmail.com</a>.</p>
      </main>
    </>
  );
}

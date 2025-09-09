import Head from 'next/head';
import { useAuth } from '../hooks/useAuth';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminPanel from '../components/AdminPanel';

export default function AdminPage() {
  const { user, loading, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || role !== 'admin')) {
      router.replace('/login');
    }
  }, [user, loading, role, router]);

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <>
      <Head>
        <title>Admin Panel | Investment Tools Hub</title>
        <meta name="description" content="Admin tools and management." />
      </Head>
      <AdminPanel />
    </>
  );
}

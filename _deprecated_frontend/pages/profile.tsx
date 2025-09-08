import Head from 'next/head';
import { useAuth } from '../hooks/useAuth';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import ProfileForm from '../components/ProfileForm';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <>
      <Head>
        <title>Profile | Investment Tools Hub</title>
        <meta name="description" content="Manage your profile and onboarding." />
      </Head>
      <ProfileForm />
    </>
  );
}

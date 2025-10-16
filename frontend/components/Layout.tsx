import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import NudgeChatWidget from './NudgeChatWidget';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <>
      <div className="page-wrapper min-h-screen flex flex-col">
        <main className="flex-1">{children}</main>
        <footer className="w-full py-8 text-center text-indigo-400 text-sm flex flex-col items-center gap-2 border-t border-indigo-100 mt-8">
          <div>&copy; {currentYear || 2024} BeginnerInvestorHub.com</div>
          <div>Raleigh, North Carolina</div>
          <nav className="flex gap-4">
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/signup">Sign Up</Link>
          </nav>
          <div>Not investment advice. For educational purposes only.</div>
        </footer>
      </div>
      <NudgeChatWidget />
    </>
  );
}

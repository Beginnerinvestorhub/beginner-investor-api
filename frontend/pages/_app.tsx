// pages/_app.tsx
'use client' // ← Add this to make it a client component

import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Head from 'next/head'
import { SessionProvider } from 'next-auth/react'

// Import global styles
import '../styles/globals.css'

function MyApp({ 
  Component, 
  pageProps: { session, ...pageProps } 
}: AppProps & { pageProps: { session: any } }) {
  const router = useRouter()
  const [pageLoading, setPageLoading] = useState(false)

  // Handle route changes for loading states
  useEffect(() => {
    const handleStart = () => setPageLoading(true)
    const handleComplete = () => setPageLoading(false)

    router.events.on('routeChangeStart', handleStart)
    router.events.on('routeChangeComplete', handleComplete)
    router.events.on('routeChangeError', handleComplete)

    return () => {
      router.events.off('routeChangeStart', handleStart)
      router.events.off('routeChangeComplete', handleComplete)
      router.events.off('routeChangeError', handleComplete)
    }
  }, [router])

  return (
    <>
      <Head>
        {/* Global meta tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0070f3" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* Preload important fonts */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      {/* Wrap with SessionProvider */}
      <SessionProvider session={session}>
        {/* Global loading indicator */}
        {pageLoading && (
          <div className="global-loading">
            <div className="loading-spinner">Loading...</div>
          </div>
        )}
        
        {/* Main app content */}
        <div className={`app-wrapper ${pageLoading ? 'page-transitioning' : ''}`}>
          <Component {...pageProps} />
        </div>

        {/* Portal containers for modals/notifications */}
        <div id="modal-root" />
        <div id="notification-root" />
      </SessionProvider>
    </>
  )
}

export default MyApp

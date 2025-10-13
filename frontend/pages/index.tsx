import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';

export default function HomePage() {
  const [statsAnimated, setStatsAnimated] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Ensure we only run client-side code after hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Only run on client side after hydration
    if (!isClient) return;

    // Trigger counter animations when stats section is in view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !statsAnimated) {
            setStatsAnimated(true);
            animateCounters();
          }
        });
      },
      { threshold: 0.5 }
    );

    observerRef.current = observer;

    const statsSection = document.querySelector('.stats-grid');
    if (statsSection) {
      observer.observe(statsSection);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [statsAnimated, isClient]);

  const animateCounters = () => {
    if (!isClient) return;

    // Add a small delay to ensure hydration is complete
    setTimeout(() => {
      const counters = document.querySelectorAll('.stat-number[data-target]');
      counters.forEach((counter) => {
        const target = parseInt(counter.getAttribute('data-target') || '0');
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;

        const updateCounter = () => {
          current += step;
          if (current < target) {
            counter.textContent = Math.floor(current).toLocaleString();
            requestAnimationFrame(updateCounter);
          } else {
            counter.textContent = target.toLocaleString();
          }
        };

        updateCounter();
      });
    }, 100);
  };

  return (
    <>
      <Head>
        <title>Beginner Investor Hub - Build Your Financial Future</title>
        <meta name="description" content="Master investing with portfolio simulation, AI-powered coaching, and real-time market insights. Learn risk-free with institutional-grade tools." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      </Head>

      {/* Hero Section */}
      <section className="hero">
        <div className="gear-container">
          <div className="gear"></div>
          <div className="gear"></div>
          <div className="gear"></div>
          <div className="gear"></div>
        </div>

        <nav>
          <div className="logo">Beginner Investor Hub</div>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#architecture">Technology</a>
            <Link href="/login" className="login-button">Login</Link>
          </div>
        </nav>

        <div className="hero-content">
          <h1>Build Your <span className="accent">Financial Freedom</span></h1>
          <p className="hero-subtitle">
            Master the mechanics of investing through hands-on portfolio simulation, AI-powered guidance, and institutional-grade market insights. Where precision engineering meets financial education.
          </p>
          <div className="cta-buttons">
            <Link href="/signup" className="btn btn-primary">Start Building</Link>
            <Link href="#features" className="btn btn-secondary">Explore Demo</Link>
          </div>
        </div>
      </section>

      {/* Market Ticker */}
      <div className="market-ticker">
        <div className="ticker-content">
          <span className="ticker-item">S&P 500: <span className="ticker-value up">+1.2%</span></span>
          <span className="ticker-item">NASDAQ: <span className="ticker-value up">+0.8%</span></span>
          <span className="ticker-item">DOW: <span className="ticker-value down">-0.3%</span></span>
          <span className="ticker-item">Portfolios Created: <span className="ticker-value">12,847</span></span>
          <span className="ticker-item">Simulations Run: <span className="ticker-value">45,392</span></span>
          <span className="ticker-item">S&P 500: <span className="ticker-value up">+1.2%</span></span>
          <span className="ticker-item">NASDAQ: <span className="ticker-value up">+0.8%</span></span>
          <span className="ticker-item">DOW: <span className="ticker-value down">-0.3%</span></span>
          <span className="ticker-item">Portfolios Created: <span className="ticker-value">12,847</span></span>
          <span className="ticker-item">Simulations Run: <span className="ticker-value">45,392</span></span>
        </div>
      </div>

      {/* Features Section */}
      <section className="features" id="features">
        <div className="nyse-container">
          <div className="section-header">
            <h2 className="section-title">Precision-Engineered Learning</h2>
            <p className="section-subtitle">Every component designed to help you understand the intricate mechanisms of successful investing</p>
          </div>

          <div className="features-grid">
            <div className="nyse-card">
              <div className="feature-icon">⚙️</div>
              <h3>Portfolio Simulation Engine</h3>
              <p>Build and test investment strategies in a risk-free environment. Watch how each component works together to generate returns and understand the mechanics behind portfolio performance.</p>
            </div>

            <div className="nyse-card">
              <div className="feature-icon">🧠</div>
              <h3>AI Behavioral Coach</h3>
              <p>Real-time guidance powered by advanced AI helps you recognize emotional patterns and make rational decisions during market volatility. Learn to master your investor psychology.</p>
            </div>

            <div className="nyse-card">
              <div className="feature-icon">📊</div>
              <h3>Risk Analysis Engine</h3>
              <p>Understand the mathematical foundations of risk with Python-powered analytics that break down complex metrics into clear, actionable insights.</p>
            </div>

            <div className="nyse-card">
              <div className="feature-icon">🎯</div>
              <h3>Market Data Integration</h3>
              <p>Access live market data and historical trends through Alpha Vantage and Finnhub. Make informed decisions with institutional-grade information at your fingertips.</p>
            </div>

            <div className="nyse-card">
              <div className="feature-icon">📈</div>
              <h3>Performance Analytics</h3>
              <p>Monitor simulated portfolios with detailed analytics that reveal the inner workings of your investment strategy. Track every metric that matters.</p>
            </div>

            <div className="nyse-card">
              <div className="feature-icon">🔧</div>
              <h3>Interactive Learning</h3>
              <p>Step-by-step guides and hands-on tutorials demystify investing concepts through practical application. Build knowledge piece by piece.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="social-proof">
        <div className="wooden-frame">
          <div className="wooden-inner">
            <div className="section-header">
              <h2 className="section-title" style={{ color: '#6b5538' }}>Precision Results</h2>
              <p className="section-subtitle" style={{ color: '#8b6f47' }}>Crafted by thousands of investors building their financial futures</p>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number" data-target="12847" suppressHydrationWarning={true}>0</div>
                <div className="stat-label">Portfolios Built</div>
              </div>
              <div className="stat-card">
                <div className="stat-number" data-target="45392" suppressHydrationWarning={true}>0</div>
                <div className="stat-label">Simulations Run</div>
              </div>
              <div className="stat-card">
                <div className="stat-number" suppressHydrationWarning={true}>$2.1M+</div>
                <div className="stat-label">Simulated Value</div>
              </div>
              <div className="stat-card">
                <div className="stat-number" suppressHydrationWarning={true}>95%</div>
                <div className="stat-label">User Satisfaction</div>
              </div>
            </div>

            <div className="testimonials">
              <div className="testimonial-card">
                <p className="testimonial-text">&quot;The mechanical approach to learning investing finally made everything click. I understand risk in a way I never did before.&quot;</p>
                <div className="testimonial-author">Sarah Mitchell</div>
                <div className="testimonial-role">First-time Investor</div>
              </div>
              <div className="testimonial-card">
                <p className="testimonial-text">&quot;Being able to simulate different strategies without risking real money gave me the confidence to start investing properly.&quot;</p>
                <div className="testimonial-author">James Chen</div>
                <div className="testimonial-role">Graduate Student</div>
              </div>
              <div className="testimonial-card">
                <p className="testimonial-text">&quot;The AI behavioral coach caught patterns in my decision-making that I didn&apos;t even realize existed. Game-changer.&quot;</p>
                <div className="testimonial-author">Maria Rodriguez</div>
                <div className="testimonial-role">Career Changer</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works" id="how-it-works">
        <div className="nyse-container">
          <div className="section-header">
            <h2 className="section-title">Assembly Instructions</h2>
            <p className="section-subtitle">Four precision steps to mastering investment fundamentals</p>
          </div>

          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Create Foundation</h3>
              <p>Sign up and complete your investor profile. Establish your risk tolerance and learning objectives to personalize your experience.</p>
            </div>

            <div className="step">
              <div className="step-number">2</div>
              <h3>Construct Portfolio</h3>
              <p>Assemble your first simulated portfolio using real market data. Follow guided recommendations or explore independently.</p>
            </div>

            <div className="step">
              <div className="step-number">3</div>
              <h3>Test & Refine</h3>
              <p>Receive AI-powered insights as you track performance. Understand market dynamics and adjust your strategy with confidence.</p>
            </div>

            <div className="step">
              <div className="step-number">4</div>
              <h3>Deploy Knowledge</h3>
              <p>Graduate from simulation to real-world investing with comprehensive understanding and proven strategies.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="nyse-container">
          <h2>Ready to Begin Your Journey?</h2>
          <p>Join thousands of investors building their financial literacy with precision tools</p>
          <Link href="/signup" className="btn btn-primary">Get Started Free</Link>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="footer-content">
          <p>&copy; 2025 Beginner Investor Hub. Built with institutional-grade technology.</p>
          <div className="footer-links">
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </div>
      </footer>

      <style jsx>{`
        /* CSS Variables are assumed to be defined globally in _app.tsx or globals.css */
        
        /* Market Ticker */
        .market-ticker {
          background: var(--nyse-color-dark);
          color: var(--nyse-color-background);
          padding: var(--nyse-spacing-sm) 0;
          overflow: hidden;
          position: relative;
          border-bottom: 2px solid var(--nyse-color-accent);
        }

        .ticker-content {
          display: flex;
          animation: scroll 30s linear infinite;
          white-space: nowrap;
        }

        .ticker-item {
          padding: 0 var(--nyse-spacing-xl);
          font-size: 0.9rem;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
        }

        .ticker-value {
          margin-left: var(--nyse-spacing-xs);
          font-family: var(--nyse-font-serif);
        }

        .ticker-value.up {
          color: #00ff88;
        }

        .ticker-value.down {
          color: #ff4444;
        }

        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        /* Hero Section */
        .hero {
          position: relative;
          min-height: 100vh;
          background: linear-gradient(135deg, var(--nyse-color-primary) 0%, var(--nyse-color-secondary) 50%, var(--nyse-color-accent) 100%);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .hero::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.02) 2px, rgba(255,255,255,0.02) 4px),
            repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.02) 2px, rgba(255,255,255,0.02) 4px);
          pointer-events: none;
        }

        .gear-container {
          position: absolute;
          width: 100%;
          height: 100%;
          opacity: 0.08;
          overflow: hidden;
        }

        .gear {
          position: absolute;
          border: 3px solid rgba(255, 255, 255, 0.4);
          border-radius: 50%;
          animation: rotate 20s linear infinite;
        }

        .gear:nth-child(1) {
          width: 250px;
          height: 250px;
          top: 15%;
          left: 10%;
          animation-duration: 30s;
        }

        .gear:nth-child(2) {
          width: 180px;
          height: 180px;
          top: 55%;
          right: 15%;
          animation-duration: 22s;
          animation-direction: reverse;
        }

        .gear:nth-child(3) {
          width: 120px;
          height: 120px;
          bottom: 20%;
          left: 35%;
          animation-duration: 18s;
        }

        .gear:nth-child(4) {
          width: 200px;
          height: 200px;
          top: 40%;
          right: 40%;
          animation-duration: 25s;
          animation-direction: reverse;
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Navigation */
        nav {
          position: relative;
          z-index: 100;
          padding: var(--nyse-spacing-lg) 5%;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .logo {
          font-family: var(--nyse-font-serif);
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--nyse-color-background);
          letter-spacing: 2px;
          text-transform: uppercase;
          text-align: center;
          flex: 1;
        }

        .nav-links {
          display: flex;
          gap: var(--nyse-spacing-xl);
          align-items: center;
        }

        .nav-links a {
          color: var(--nyse-color-background);
          text-decoration: none;
          font-size: 0.95rem;
          font-weight: 600;
          transition: color 0.3s;
          letter-spacing: 0.5px;
        }

        .nav-links a:hover {
          color: var(--nyse-color-accent);
        }

        .login-button {
          background: var(--nyse-color-accent);
          padding: var(--nyse-spacing-sm) var(--nyse-spacing-lg);
          border-radius: 4px;
          font-weight: 700;
        }

        .login-button:hover {
          background: var(--nyse-color-background);
          color: var(--nyse-color-primary);
        }

        /* Hero Content */
        .hero-content {
          position: relative;
          z-index: 10;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          padding: 0 5%;
          max-width: 1200px;
          margin: 0 auto;
        }

        .hero h1 {
          font-size: clamp(2.5rem, 5vw, 4.5rem);
          color: var(--nyse-color-background);
          margin-bottom: var(--nyse-spacing-xl);
          font-weight: 700;
          letter-spacing: 2px;
          animation: fadeInUp 1s ease-out;
        }

        .hero h1 .accent {
          color: var(--nyse-color-accent);
        }

        .hero-subtitle {
          font-size: clamp(1.1rem, 2vw, 1.4rem);
          color: rgba(255, 255, 255, 0.9);
          max-width: 750px;
          margin-bottom: var(--nyse-spacing-xxl);
          line-height: 1.8;
          animation: fadeInUp 1s ease-out 0.2s both;
        }

        .cta-buttons {
          display: flex;
          gap: var(--nyse-spacing-lg);
          animation: fadeInUp 1s ease-out 0.4s both;
        }

        .btn {
          padding: var(--nyse-spacing-md) var(--nyse-spacing-xl);
          font-size: 1rem;
          text-decoration: none;
          border-radius: 4px;
          transition: all 0.3s;
          cursor: pointer;
          border: none;
          letter-spacing: 1px;
          font-family: var(--nyse-font-sans);
          font-weight: 600;
          display: inline-block;
        }

        .btn-primary {
          background: var(--nyse-color-background);
          color: var(--nyse-color-primary);
        }

        .btn-primary:hover {
          background: var(--nyse-color-accent);
          color: var(--nyse-color-background);
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(0, 160, 227, 0.3);
        }

        .btn-secondary {
          background: transparent;
          color: var(--nyse-color-background);
          border: 2px solid var(--nyse-color-background);
        }

        .btn-secondary:hover {
          background: var(--nyse-color-background);
          color: var(--nyse-color-primary);
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Container */
        .nyse-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 var(--nyse-spacing-lg);
        }

        /* Features Section */
        .features {
          padding: var(--nyse-spacing-xxl) 5%;
          background: var(--nyse-color-background);
        }

        .section-header {
          text-align: center;
          margin-bottom: var(--nyse-spacing-xxl);
        }

        .section-title {
          font-size: clamp(2rem, 4vw, 3.5rem);
          color: var(--nyse-color-dark);
          margin-bottom: var(--nyse-spacing-md);
        }

        .section-subtitle {
          font-size: 1.2rem;
          color: var(--nyse-color-text-light);
          max-width: 700px;
          margin: 0 auto;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: var(--nyse-spacing-xl);
          margin-top: var(--nyse-spacing-xxl);
        }

        .nyse-card {
          background: var(--nyse-color-background);
          border: 1px solid var(--nyse-color-border);
          border-left: 4px solid var(--nyse-color-primary);
          border-radius: 8px;
          padding: var(--nyse-spacing-xl);
          transition: all 0.3s ease;
        }

        .nyse-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 24px rgba(0, 61, 122, 0.15);
          border-left-color: var(--nyse-color-accent);
        }

        .feature-icon {
          font-size: 3rem;
          margin-bottom: var(--nyse-spacing-lg);
        }

        .nyse-card h3 {
          font-size: 1.5rem;
          margin-bottom: var(--nyse-spacing-md);
          color: var(--nyse-color-primary);
        }

        .nyse-card p {
          color: var(--nyse-color-text);
          line-height: 1.7;
          margin: 0;
        }

        /* Social Proof Section */
        .social-proof {
          padding: var(--nyse-spacing-xxl) 5%;
          background: linear-gradient(180deg, #f5f0e8 0%, #e8e0d5 100%);
          position: relative;
          overflow: hidden;
        }

        .social-proof::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(0,0,0,0.02) 20px, rgba(0,0,0,0.02) 21px),
            repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(0,0,0,0.02) 20px, rgba(0,0,0,0.02) 21px);
          pointer-events: none;
        }

        .wooden-frame {
          position: relative;
          max-width: 1200px;
          margin: 0 auto;
          background: linear-gradient(135deg, #d4a574 0%, #c99157 50%, #d4a574 100%);
          padding: 3px;
          box-shadow: 
            0 10px 30px rgba(0,0,0,0.3),
            inset 0 1px 0 rgba(255,255,255,0.3),
            inset 0 -1px 0 rgba(0,0,0,0.3);
        }

        .wooden-frame::before,
        .wooden-frame::after {
          content: '';
          position: absolute;
          background: radial-gradient(circle, #8b6f47 0%, #6b5538 100%);
          border-radius: 50%;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.5);
        }

        .wooden-frame::before {
          width: 20px;
          height: 20px;
          top: 10px;
          left: 10px;
        }

        .wooden-frame::after {
          width: 20px;
          height: 20px;
          top: 10px;
          right: 10px;
        }

        .wooden-inner {
          background: linear-gradient(135deg, #f5e6d3 0%, #e8d4b8 100%);
          padding: var(--nyse-spacing-xxl);
          position: relative;
          box-shadow: inset 0 2px 10px rgba(0,0,0,0.1);
        }

        .wooden-inner::before,
        .wooden-inner::after {
          content: '';
          position: absolute;
          background: radial-gradient(circle, #8b6f47 0%, #6b5538 100%);
          border-radius: 50%;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.5);
        }

        .wooden-inner::before {
          width: 20px;
          height: 20px;
          bottom: 10px;
          left: 10px;
        }

        .wooden-inner::after {
          width: 20px;
          height: 20px;
          bottom: 10px;
          right: 10px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--nyse-spacing-xl);
          margin-bottom: var(--nyse-spacing-xxl);
        }

        .stat-card {
          text-align: center;
          background: rgba(255, 255, 255, 0.6);
          padding: var(--nyse-spacing-lg);
          border-radius: 8px;
          border: 2px solid rgba(139, 111, 71, 0.3);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          position: relative;
        }

        .stat-number {
          font-family: var(--nyse-font-serif);
          font-size: 3rem;
          font-weight: 700;
          color: var(--nyse-color-primary);
          line-height: 1;
          margin-bottom: var(--nyse-spacing-sm);
          text-shadow: 2px 2px 0 rgba(0,0,0,0.1);
        }

        .stat-label {
          font-size: 0.95rem;
          color: #6b5538;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .testimonials {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: var(--nyse-spacing-lg);
        }

        .testimonial-card {
          background: rgba(255, 255, 255, 0.8);
          padding: var(--nyse-spacing-xl);
          border-radius: 8px;
          border: 2px solid rgba(139, 111, 71, 0.3);
          position: relative;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .testimonial-card::before {
          content: '"';
          position: absolute;
          top: -10px;
          left: 20px;
          font-size: 4rem;
          color: var(--nyse-color-accent);
          font-family: Georgia, serif;
          opacity: 0.3;
        }

        .testimonial-text {
          font-style: italic;
          color: var(--nyse-color-text);
          margin-bottom: var(--nyse-spacing-md);
          line-height: 1.7;
        }

        .testimonial-author {
          font-weight: 600;
          color: var(--nyse-color-primary);
        }

        .testimonial-role {
          font-size: 0.9rem;
          color: #6b5538;
        }

        /* How It Works */
        .how-it-works {
          padding: var(--nyse-spacing-xxl) 5%;
          background: var(--nyse-color-background-alt);
        }

        .steps {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: var(--nyse-spacing-xl);
          margin-top: var(--nyse-spacing-xxl);
        }

        .step {
          text-align: center;
          padding: var(--nyse-spacing-xl);
          background: var(--nyse-color-background);
          border-radius: 8px;
          border: 1px solid var(--nyse-color-border);
          transition: all 0.3s ease;
        }

        .step:hover {
          box-shadow: 0 5px 20px rgba(0, 61, 122, 0.1);
        }

        .step-number {
          width: 70px;
          height: 70px;
          background: var(--nyse-color-primary);
          color: var(--nyse-color-background);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.75rem;
          font-weight: 700;
          font-family: var(--nyse-font-serif);
          margin: 0 auto var(--nyse-spacing-lg);
          border: 4px solid var(--nyse-color-accent);
        }

        .step h3 {
          margin-bottom: var(--nyse-spacing-md);
          color: var(--nyse-color-dark);
          font-size: 1.5rem;
        }

        .step p {
          color: var(--nyse-color-text);
          line-height: 1.7;
          margin: 0;
        }

        /* CTA Section */
        .cta-section {
          padding: var(--nyse-spacing-xxl) 5%;
          background: var(--nyse-color-primary);
          text-align: center;
          color: var(--nyse-color-background);
        }

        .cta-section h2 {
          font-size: clamp(2rem, 4vw, 3rem);
          color: var(--nyse-color-background);
          margin-bottom: 1rem;
        }
      `}</style>
    </>
  );
}
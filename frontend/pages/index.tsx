import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState, useRef, useCallback } from 'react';

export default function HomePage() {
  const [statsAnimated, setStatsAnimated] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Ensure we only run client-side code after hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  const animateCounters = useCallback(() => {
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
  }, [isClient]);

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
  }, [statsAnimated, isClient, animateCounters]);

  return (
    <>
      <Head>
        <html lang="en" />
        <title>Beginner Investor Hub - Build Your Financial Future</title>
        <meta name="description" content="Master investing with portfolio simulation, AI-powered coaching, and real-time market insights. Learn risk-free with institutional-grade tools." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/x-icon" href="/favicon.svg" />
      </Head>

      {/* Test element for CSS */}
      <div className="test-style" style={{margin: '20px', textAlign: 'center'}}>
        If you see red background with white text, CSS is working!
      </div>
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
      

      {/* Market Ticker */}
      <div className="market-ticker">;
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
    </>
  );
}
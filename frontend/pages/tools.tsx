import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';

const tools = [
  {
    name: 'Portfolio Simulation Engine',
    icon: '⚙️',
    description: 'Build and test investment strategies in a risk-free environment with virtual capital.',
    href: '/portfolio-simulation',
    category: 'Core Tools',
    status: 'active',
    features: ['Virtual trading', 'Historical data', 'Performance tracking']
  },
  {
    name: 'AI Behavioral Coach',
    icon: '🧠',
    description: 'Get real-time insights on emotional patterns and decision-making biases.',
    //href: '/ai-coach',
    category: 'Core Tools',
    status: 'active',
    features: ['Pattern recognition', 'Nudge alerts', 'Learning recommendations']
  },
  {
    name: 'Risk Analysis Dashboard',
    icon: '📊',
    description: 'Understand portfolio risk metrics with advanced analytics powered by Python.',
    href: '/risk-analysis',
    category: 'Core Tools',
    status: 'active',
    features: ['Sharpe ratio', 'Beta analysis', 'Volatility metrics']
  },
  {
    name: 'Market Data Explorer',
    icon: '📈',
    description: 'Access real-time and historical market data from Alpha Vantage and Finnhub.',
    href: '/market-data',
    category: 'Research',
    status: 'active',
    features: ['Live quotes', 'Historical charts', 'Company fundamentals']
  },
  {
    name: 'Risk Assessment Quiz',
    icon: '🎯',
    description: 'Discover your risk tolerance and get a personalized investment profile.',
    href: '/risk-assessment',
    category: 'Learning',
    status: 'active',
    features: ['Personality analysis', 'Goal setting', 'Custom recommendations']
  },
  {
    name: 'Fractional Share Calculator',
    icon: '🧮',
    description: 'Calculate how much of any stock you can buy with your available capital.',
    href: '/fractional-calculator',
    category: 'Utilities',
    status: 'active',
    features: ['Real-time prices', 'Cost breakdown', 'Multiple stocks']
  },
  {
    name: 'ESG/SRI Screener',
    icon: '🌍',
    description: 'Screen investments for environmental, social, and governance factors.',
    href: '/esg-screener',
    category: 'Research',
    status: 'coming-soon',
    features: ['ESG ratings', 'Impact metrics', 'Sustainable portfolios']
  },
  {
    name: 'Learning Dashboard',
    icon: '📚',
    description: 'Track your educational progress, achievements, and unlock new features.',
    href: '/learning',
    category: 'Learning',
    status: 'active',
    features: ['Progress tracking', 'Achievements', 'Gamification']
  }
];

export default function ToolsOverview() {
  const { user } = useAuth();

  const categories = ['All', 'Core Tools', 'Research', 'Learning', 'Utilities'];
  const [activeCategory, setActiveCategory] = React.useState('All');

  const filteredTools = activeCategory === 'All' 
    ? tools 
    : tools.filter(tool => tool.category === activeCategory);

  return (
    <>
      <Head>
        <title>Investment Tools | Beginner Investor Hub</title>
        <meta name="description" content="Explore our comprehensive suite of investment tools: portfolio simulation, AI coaching, risk analysis, market data, and more." />
      </Head>

      <div className="tools-page">
        {/* Header */}
        <header className="tools-header">
          <div className="nyse-container">
            <Link href="/" className="back-link">
              ← Back to Home
            </Link>
            <h1>Investment Tools</h1>
            <p className="header-subtitle">
              Precision-engineered tools to accelerate your investing mastery
            </p>
          </div>
        </header>

        {/* Content */}
        <main className="tools-content">
          <div className="nyse-container">
            {/* Category Filter */}
            <nav className="category-nav">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`category-button ${activeCategory === category ? 'active' : ''}`}
                >
                  {category}
                </button>
              ))}
            </nav>

            {/* Tools Grid */}
            <div className="tools-grid">
              {filteredTools.map((tool) => (
                <div key={tool.name} className="tool-card">
                  {tool.status === 'coming-soon' && (
                    <div className="coming-soon-badge">Coming Soon</div>
                  )}
                  
                  <div className="tool-icon">{tool.icon}</div>
                  
                  <h3 className="tool-name">{tool.name}</h3>
                  
                  <p className="tool-description">{tool.description}</p>
                  
                  <ul className="tool-features">
                    {tool.features.map((feature, idx) => (
                      <li key={idx}>
                        <span className="feature-bullet">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <div className="tool-footer">
                    {tool.status === 'active' ? (
                      user ? (
                        <Link href={tool.href} className="tool-button">
                          Launch Tool
                        </Link>
                      ) : (
                        <Link href="/signup" className="tool-button secondary">
                          Sign Up to Access
                        </Link>
                      )
                    ) : (
                      <button className="tool-button disabled" disabled>
                        Coming Soon
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Section */}
            {!user && (
              <div className="cta-section">
                <h2>Ready to Start Building?</h2>
                <p>Create a free account to access all our investment tools and start your learning journey.</p>
                <div className="cta-buttons">
                  <Link href="/signup" className="cta-button primary">
                    Create Free Account
                  </Link>
                  <Link href="/login" className="cta-button secondary">
                    Sign In
                  </Link>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <style jsx>{`
        .tools-page {
          min-height: 100vh;
          background: var(--nyse-color-background-alt);
        }

        .tools-header {
          background: linear-gradient(135deg, var(--nyse-color-primary) 0%, var(--nyse-color-secondary) 100%);
          color: white;
          padding: var(--nyse-spacing-xxl) 0;
          position: relative;
          overflow: hidden;
        }

        .tools-header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            repeating-linear-gradient(90deg, transparent, transparent 30px, rgba(255,255,255,0.03) 30px, rgba(255,255,255,0.03) 31px),
            repeating-linear-gradient(0deg, transparent, transparent 30px, rgba(255,255,255,0.03) 30px, rgba(255,255,255,0.03) 31px);
          pointer-events: none;
        }

        .back-link {
          display: inline-block;
          color: white;
          text-decoration: none;
          margin-bottom: var(--nyse-spacing-md);
          font-size: 0.95rem;
          opacity: 0.9;
          transition: opacity 0.3s ease;
          position: relative;
          z-index: 1;
        }

        .back-link:hover {
          opacity: 1;
        }

        .tools-header h1 {
          font-family: var(--nyse-font-serif);
          font-size: clamp(2rem, 4vw, 3rem);
          margin-bottom: var(--nyse-spacing-sm);
          color: white;
          position: relative;
          z-index: 1;
        }

        .header-subtitle {
          font-size: 1.1rem;
          opacity: 0.95;
          margin: 0;
          position: relative;
          z-index: 1;
        }

        .tools-content {
          padding: var(--nyse-spacing-xxl) 0;
        }

        .category-nav {
          display: flex;
          gap: var(--nyse-spacing-sm);
          margin-bottom: var(--nyse-spacing-xxl);
          overflow-x: auto;
          padding-bottom: var(--nyse-spacing-sm);
        }

        .category-button {
          padding: var(--nyse-spacing-sm) var(--nyse-spacing-lg);
          background: var(--nyse-color-background);
          border: 2px solid var(--nyse-color-border);
          border-radius: 24px;
          font-family: var(--nyse-font-sans);
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--nyse-color-text);
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .category-button:hover {
          border-color: var(--nyse-color-primary);
          background: rgba(0, 61, 122, 0.05);
        }

        .category-button.active {
          background: var(--nyse-color-primary);
          border-color: var(--nyse-color-primary);
          color: white;
        }

        .tools-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: var(--nyse-spacing-xl);
          margin-bottom: var(--nyse-spacing-xxl);
        }

        .tool-card {
          background: var(--nyse-color-background);
          border-radius: 12px;
          border: 1px solid var(--nyse-color-border);
          padding: var(--nyse-spacing-xl);
          display: flex;
          flex-direction: column;
          transition: all 0.3s ease;
          position: relative;
        }

        .tool-card:hover {
          border-color: var(--nyse-color-accent);
          box-shadow: 0 8px 24px rgba(0, 61, 122, 0.15);
          transform: translateY(-4px);
        }

        .coming-soon-badge {
          position: absolute;
          top: var(--nyse-spacing-md);
          right: var(--nyse-spacing-md);
          background: #ff9800;
          color: white;
          padding: var(--nyse-spacing-xs) var(--nyse-spacing-sm);
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        .tool-icon {
          font-size: 3rem;
          margin-bottom: var(--nyse-spacing-md);
        }

        .tool-name {
          font-family: var(--nyse-font-serif);
          font-size: 1.5rem;
          color: var(--nyse-color-primary);
          margin-bottom: var(--nyse-spacing-sm);
        }

        .tool-description {
          color: var(--nyse-color-text);
          line-height: 1.6;
          margin-bottom: var(--nyse-spacing-lg);
          flex: 1;
        }

        .tool-features {
          list-style: none;
          padding: 0;
          margin: 0 0 var(--nyse-spacing-lg) 0;
          display: flex;
          flex-direction: column;
          gap: var(--nyse-spacing-xs);
        }

        .tool-features li {
          font-size: 0.9rem;
          color: var(--nyse-color-text-light);
          display: flex;
          align-items: center;
          gap: var(--nyse-spacing-sm);
        }

        .feature-bullet {
          color: var(--nyse-color-accent);
          font-weight: 700;
        }

        .tool-footer {
          margin-top: auto;
        }

        .tool-button {
          display: block;
          width: 100%;
          padding: var(--nyse-spacing-md);
          background: var(--nyse-color-primary);
          color: white;
          text-align: center;
          text-decoration: none;
          border-radius: 4px;
          font-family: var(--nyse-font-sans);
          font-weight: 600;
          font-size: 0.95rem;
          transition: all 0.3s ease;
          border: none;
          cursor: pointer;
        }

        .tool-button:hover:not(.disabled) {
          background: var(--nyse-color-secondary);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 61, 122, 0.3);
        }

        .tool-button.secondary {
          background: transparent;
          color: var(--nyse-color-primary);
          border: 2px solid var(--nyse-color-primary);
        }

        .tool-button.secondary:hover {
          background: var(--nyse-color-primary);
          color: white;
        }

        .tool-button.disabled {
          background: var(--nyse-color-background-alt);
          color: var(--nyse-color-text-light);
          cursor: not-allowed;
          opacity: 0.6;
        }

        .cta-section {
          background: linear-gradient(135deg, var(--nyse-color-primary) 0%, var(--nyse-color-secondary) 100%);
          color: white;
          padding: var(--nyse-spacing-xxl);
          border-radius: 12px;
          text-align: center;
        }

        .cta-section h2 {
          font-family: var(--nyse-font-serif);
          font-size: 2rem;
          margin-bottom: var(--nyse-spacing-md);
          color: white;
        }

        .cta-section p {
          font-size: 1.1rem;
          margin-bottom: var(--nyse-spacing-xl);
          opacity: 0.95;
        }

        .cta-buttons {
          display: flex;
          gap: var(--nyse-spacing-md);
          justify-content: center;
        }

        .cta-button {
          padding: var(--nyse-spacing-md) var(--nyse-spacing-xxl);
          border-radius: 4px;
          font-family: var(--nyse-font-sans);
          font-weight: 600;
          font-size: 1rem;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .cta-button.primary {
          background: white;
          color: var(--nyse-color-primary);
        }

        .cta-button.primary:hover {
          background: var(--nyse-color-accent);
          color: white;
          transform: translateY(-2px);
        }

        .cta-button.secondary {
          background: transparent;
          color: white;
          border: 2px solid white;
        }

        .cta-button.secondary:hover {
          background: white;
          color: var(--nyse-color-primary);
        }

        @media (max-width: 768px) {
          .tools-grid {
            grid-template-columns: 1fr;
          }

          .category-nav {
            justify-content: flex-start;
          }

          .cta-buttons {
            flex-direction: column;
          }

          .cta-button {
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}
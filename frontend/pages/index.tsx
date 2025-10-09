import React, { useState, useEffect } from 'react';
import Head from 'next/head';

export default function IndexPage() {
  const [showDemo, setShowDemo] = useState(false);
  const [stats, setStats] = useState({
    portfolios: 0,
    simulations: 0
  });

  useEffect(() => {
    // Animate stats counter
    const animateValue = (start: number, end: number, duration: number, callback: (val: number) => void) => {
      let startTimestamp: number | null = null;
      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        callback(Math.floor(progress * (end - start) + start));
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };
      window.requestAnimationFrame(step);
    };

    animateValue(0, 12847, 2000, (val) => setStats(prev => ({ ...prev, portfolios: val })));
    animateValue(0, 45392, 2000, (val) => setStats(prev => ({ ...prev, simulations: val })));
  }, []);

  const runDemo = (type: string) => {
    setShowDemo(false);
    alert(`Demo "${type}" would launch here - integrate with your backend services`);
  };

  return (
    <>
      <Head>
        <title>Beginner Investor Hub - Build Your Financial Future</title>
        <meta name="description" content="Master the mechanics of investing through hands-on portfolio simulation, AI-powered guidance, and institutional-grade market insights." />
      </Head>

      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700">
          {/* Technical Grid Overlay */}
          <div className="fixed inset-0 pointer-events-none opacity-5" style={{
            backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px), repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)'
          }}></div>

          {/* Animated Mechanical Gears */}
          <div className="absolute inset-0 opacity-10 overflow-hidden pointer-events-none">
            <div className="absolute top-[15%] left-[10%] w-64 h-64 animate-spin-slower">
              <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" className="text-white w-full h-full">
                <circle cx="50" cy="50" r="40" strokeWidth="2"/>
                <circle cx="50" cy="50" r="25" strokeWidth="2"/>
                {[...Array(8)].map((_, i) => (
                  <line key={i} x1="50" y1="10" x2="50" y2="25" strokeWidth="3" transform={`rotate(${i * 45} 50 50)`}/>
                ))}
              </svg>
            </div>
            <div className="absolute top-[55%] right-[15%] w-48 h-48 animate-spin-reverse">
              <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" className="text-white w-full h-full">
                <circle cx="50" cy="50" r="35" strokeWidth="2"/>
                <circle cx="50" cy="50" r="20" strokeWidth="2"/>
                {[...Array(6)].map((_, i) => (
                  <line key={i} x1="50" y1="15" x2="50" y2="28" strokeWidth="3" transform={`rotate(${i * 60} 50 50)`}/>
                ))}
              </svg>
            </div>
            <div className="absolute bottom-[20%] left-[35%] w-32 h-32 animate-spin-slow">
              <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" className="text-white w-full h-full">
                <circle cx="50" cy="50" r="30" strokeWidth="2"/>
                <circle cx="50" cy="50" r="18" strokeWidth="2"/>
                {[...Array(10)].map((_, i) => (
                  <line key={i} x1="50" y1="20" x2="50" y2="30" strokeWidth="2" transform={`rotate(${i * 36} 50 50)`}/>
                ))}
              </svg>
            </div>
            <div className="absolute top-[40%] right-[40%] w-52 h-52 animate-spin-reverse-slow">
              <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" className="text-white w-full h-full">
                <circle cx="50" cy="50" r="40" strokeWidth="2"/>
                <circle cx="50" cy="50" r="25" strokeWidth="2"/>
                {[...Array(12)].map((_, i) => (
                  <line key={i} x1="50" y1="10" x2="50" y2="25" strokeWidth="2" transform={`rotate(${i * 30} 50 50)`}/>
                ))}
              </svg>
            </div>
          </div>

          {/* Navigation */}
          <nav className="relative z-50 flex justify-between items-center px-6 py-6 max-w-7xl mx-auto">
            <div className="text-white text-2xl font-bold tracking-wider" style={{ fontFamily: 'Georgia, serif' }}>
              INVESTOR HUB
            </div>
            <div className="flex gap-4">
              <button onClick={() => setShowDemo(true)} className="px-6 py-2 border-2 border-white text-white rounded hover:bg-white hover:text-blue-900 transition-all font-semibold">
                Try Demo
              </button>
              <a href="/dashboard" className="px-6 py-2 bg-white text-blue-900 rounded hover:bg-blue-100 transition-all font-semibold">
                Get Started
              </a>
            </div>
          </nav>

          {/* Hero Content */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-20 max-w-5xl mx-auto" style={{ minHeight: 'calc(100vh - 120px)' }}>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-fade-in" style={{ fontFamily: 'Georgia, serif' }}>
              Build Your <span className="text-blue-300">Financial Future</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-100 mb-10 max-w-3xl leading-relaxed animate-fade-in-delay">
              Master the mechanics of investing through hands-on portfolio simulation, AI-powered guidance, and institutional-grade market insights. Where precision engineering meets financial education.
            </p>
            <div className="flex gap-6 animate-fade-in-delay-2">
              <a href="/dashboard" className="px-8 py-4 bg-white text-blue-900 rounded font-bold text-lg hover:bg-blue-100 hover:shadow-xl transition-all transform hover:-translate-y-1">
                Start Building
              </a>
              <button onClick={() => setShowDemo(true)} className="px-8 py-4 border-2 border-white text-white rounded font-bold text-lg hover:bg-white hover:text-blue-900 transition-all">
                Explore Demo
              </button>
            </div>
          </div>
        </section>

        {/* Market Ticker */}
        <div className="bg-gray-900 text-white py-3 overflow-hidden border-b-2 border-blue-500">
          <div className="flex gap-12 animate-scroll whitespace-nowrap">
            <span className="inline-flex items-center">S&P 500: <span className="text-green-400 ml-2 font-bold">+1.2%</span></span>
            <span className="inline-flex items-center">NASDAQ: <span className="text-green-400 ml-2 font-bold">+0.8%</span></span>
            <span className="inline-flex items-center">DOW: <span className="text-red-400 ml-2 font-bold">-0.3%</span></span>
            <span className="inline-flex items-center">Portfolios Created: <span className="ml-2 font-bold">{stats.portfolios.toLocaleString()}</span></span>
            <span className="inline-flex items-center">Simulations Run: <span className="ml-2 font-bold">{stats.simulations.toLocaleString()}</span></span>
            <span className="inline-flex items-center">S&P 500: <span className="text-green-400 ml-2 font-bold">+1.2%</span></span>
            <span className="inline-flex items-center">NASDAQ: <span className="text-green-400 ml-2 font-bold">+0.8%</span></span>
            <span className="inline-flex items-center">DOW: <span className="text-red-400 ml-2 font-bold">-0.3%</span></span>
            <span className="inline-flex items-center">Portfolios Created: <span className="ml-2 font-bold">{stats.portfolios.toLocaleString()}</span></span>
            <span className="inline-flex items-center">Simulations Run: <span className="ml-2 font-bold">{stats.simulations.toLocaleString()}</span></span>
          </div>
        </div>

        {/* Features Section */}
        <section className="py-20 px-6 bg-white">
          <div className="nyse-container">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Georgia, serif' }}>
                Precision-Engineered Learning
              </h2>
              <div className="w-24 h-1 bg-blue-600 mx-auto mb-6"></div>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto">
                Every component designed to help you understand the intricate mechanisms of successful investing
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { icon: '⚙️', title: 'Portfolio Simulation Engine', desc: 'Build and test investment strategies in a risk-free environment. Watch how each component works together to generate returns.' },
                { icon: '🧠', title: 'AI Behavioral Coach', desc: 'Real-time guidance powered by advanced AI helps you recognize emotional patterns and make rational decisions.' },
                { icon: '📊', title: 'Risk Analysis Engine', desc: 'Understand the mathematical foundations of risk with Python-powered analytics that break down complex metrics.' },
                { icon: '🎯', title: 'Market Data Integration', desc: 'Access live market data and historical trends through Alpha Vantage and Finnhub with institutional-grade information.' },
                { icon: '📈', title: 'Performance Analytics', desc: 'Monitor simulated portfolios with detailed analytics that reveal the inner workings of your investment strategy.' },
                { icon: '🔧', title: 'Interactive Learning', desc: 'Step-by-step guides and hands-on tutorials demystify investing concepts through practical application.' }
              ].map((feature, idx) => (
                <div key={idx} className="nyse-card hover:shadow-xl transition-all transform hover:-translate-y-2">
                  <div className="text-5xl mb-4">{feature.icon}</div>
                  <h3 className="text-2xl font-bold text-blue-900 mb-3" style={{ fontFamily: 'Georgia, serif' }}>
                    {feature.title}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 px-6 bg-gray-100">
          <div className="nyse-container">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Georgia, serif' }}>
                Assembly Instructions
              </h2>
              <div className="w-24 h-1 bg-blue-600 mx-auto mb-6"></div>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto">
                Four precision steps to mastering investment fundamentals
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { num: '1', title: 'Create Foundation', desc: 'Sign up and complete your investor profile. Establish your risk tolerance and learning objectives.' },
                { num: '2', title: 'Construct Portfolio', desc: 'Assemble your first simulated portfolio using real market data. Follow guided recommendations.' },
                { num: '3', title: 'Test & Refine', desc: 'Receive AI-powered insights as you track performance. Understand market dynamics and adjust strategy.' },
                { num: '4', title: 'Deploy Knowledge', desc: 'Graduate from simulation to real-world investing with comprehensive understanding and proven strategies.' }
              ].map((step, idx) => (
                <div key={idx} className="text-center p-8 bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all">
                  <div className="w-16 h-16 bg-blue-900 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 border-4 border-blue-500" style={{ fontFamily: 'Georgia, serif' }}>
                    {step.num}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-700 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-20 px-6 bg-gradient-to-br from-amber-50 to-amber-100 relative overflow-hidden">
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(0,0,0,0.02) 20px, rgba(0,0,0,0.02) 21px), repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(0,0,0,0.02) 20px, rgba(0,0,0,0.02) 21px)'
          }}></div>

          <div className="nyse-container relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Georgia, serif' }}>
                Precision Results
              </h2>
              <div className="w-24 h-1 bg-blue-600 mx-auto mb-6"></div>
              <p className="text-xl text-gray-700">
                Crafted by thousands of investors building their financial futures
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
              {[
                { num: stats.portfolios.toLocaleString(), label: 'Portfolios Built' },
                { num: stats.simulations.toLocaleString(), label: 'Simulations Run' },
                { num: '$2.1M+', label: 'Simulated Value' },
                { num: '95%', label: 'User Satisfaction' }
              ].map((stat, idx) => (
                <div key={idx} className="text-center p-6 bg-white/60 rounded-lg border-2 border-amber-200 shadow-lg">
                  <div className="text-5xl font-bold text-blue-900 mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                    {stat.num}
                  </div>
                  <div className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { text: 'The mechanical approach to learning investing finally made everything click. I understand risk in a way I never did before.', author: 'Sarah Mitchell', role: 'First-time Investor' },
                { text: 'Being able to simulate different strategies without risking real money gave me the confidence to start investing properly.', author: 'James Chen', role: 'Graduate Student' },
                { text: 'The AI behavioral coach caught patterns in my decision-making that I didn\'t even realize existed. Game-changer.', author: 'Maria Rodriguez', role: 'Career Changer' }
              ].map((testimonial, idx) => (
                <div key={idx} className="relative p-8 bg-white/80 rounded-lg border-2 border-amber-200 shadow-lg">
                  <div className="absolute -top-4 left-6 text-6xl text-blue-500 opacity-30" style={{ fontFamily: 'Georgia, serif' }}>"</div>
                  <p className="italic text-gray-700 mb-6 relative z-10">{testimonial.text}</p>
                  <div className="font-bold text-blue-900">{testimonial.author}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6 bg-blue-900 text-white text-center">
          <div className="nyse-container">
            <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ fontFamily: 'Georgia, serif' }}>
              Ready to Begin Your Journey?
            </h2>
            <p className="text-xl mb-10 opacity-90">
              Join thousands of investors building their financial literacy with precision tools
            </p>
            <a href="/dashboard" className="inline-block px-10 py-4 bg-white text-blue-900 rounded-lg font-bold text-lg hover:bg-blue-100 hover:shadow-xl transition-all transform hover:-translate-y-1">
              Get Started Free
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-6 bg-gray-900 text-white">
          <div className="nyse-container">
            <div className="text-center mb-6">
              <p className="text-gray-400">&copy; 2025 Beginner Investor Hub. Built with institutional-grade technology.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-8 text-sm">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">API Documentation</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">GitHub</a>
            </div>
          </div>
        </footer>

        {/* Demo Modal */}
        {showDemo && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6" onClick={() => setShowDemo(false)}>
            <div className="bg-white rounded-xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-blue-900" style={{ fontFamily: 'Georgia, serif' }}>Interactive Demo</h2>
                <button onClick={() => setShowDemo(false)} className="text-4xl text-gray-500 hover:text-gray-700">&times;</button>
              </div>
              <p className="text-gray-700 mb-8">Experience our portfolio simulation engine with these interactive examples:</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { icon: '📊', title: 'Basic Portfolio', desc: 'Create and analyze a simple 3-stock portfolio with real market data integration.', type: 'basic' },
                  { icon: '🔬', title: 'Risk Analysis', desc: 'Deep dive into risk metrics and Monte Carlo simulations for sophisticated analysis.', type: 'advanced' },
                  { icon: '⚡', title: 'Portfolio Optimization', desc: 'Apply Mean-Variance and Risk Parity algorithms to optimize your portfolio allocation.', type: 'optimization' },
                  { icon: '🤖', title: 'AI Behavioral Coach', desc: 'Experience personalized nudges and behavioral insights powered by AI.', type: 'ai-nudge' }
                ].map((demo, idx) => (
                  <button
                    key={idx}
                    onClick={() => runDemo(demo.type)}
                    className="text-left p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-lg transition-all"
                  >
                    <div className="text-4xl mb-3">{demo.icon}</div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">{demo.title}</h4>
                    <p className="text-gray-600">{demo.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes spin-slower {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-reverse-slow {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        .animate-spin-reverse {
          animation: spin-reverse 15s linear infinite;
        }
        .animate-spin-slower {
          animation: spin-slower 30s linear infinite;
        }
        .animate-spin-reverse-slow {
          animation: spin-reverse-slow 25s linear infinite;
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        .animate-fade-in-delay {
          animation: fade-in 1s ease-out 0.2s both;
        }
        .animate-fade-in-delay-2 {
          animation: fade-in 1s ease-out 0.4s both;
        }
      `}</style>
    </>
  );
}
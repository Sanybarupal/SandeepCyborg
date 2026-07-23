import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'
import Image from 'next/image'

export default function HomePage() {
  return (
    <div className="landing-page animate-in">
      <header className="landing-header">
        <div className="landing-logo">
          <span className="logo-icon">⚡</span> Sandeep Clone
        </div>
        <nav className="landing-nav">
          <Link href="/dashboard">DASHBOARD</Link>
          <Link href="/clients">CLIENTS</Link>
          <Link href="/chat">AI CHAT</Link>
          <Link href="/upload">KNOWLEDGE BASE</Link>
        </nav>
        <div className="header-actions">
          <ThemeToggle />
          <Link href="/dashboard" className="btn-get-started">
            OPEN SYSTEM ↗
          </Link>
        </div>
      </header>

      <main className="landing-main">
        <div className="hero-section">
          {/* Left Floater */}
          <div className="floater left-floater glass-panel">
            <div className="floater-content">
              <span className="floater-title">Plan</span>
            </div>
            <div className="corner top-left"></div>
            <div className="corner top-right"></div>
            <div className="corner bottom-left"></div>
            <div className="corner bottom-right"></div>
          </div>

          {/* Right Floater */}
          <div className="floater right-floater glass-panel">
            <div className="rating">
              <span className="score">4.9</span>
              <span className="star">★</span>
            </div>
            <span className="reviews-text">Reviews</span>
            <div className="mini-astronaut">
              👨‍🚀
            </div>
          </div>

          <div className="cyborg-container">
            <Image 
              src="/cyborg_portrait.png" 
              alt="Cyborg AI" 
              width={400} 
              height={400} 
              className="cyborg-image floating"
              priority
            />
          </div>

          <div className="hero-text-container">
            <h1 className="hero-heading">
              Welcome to Sandeep Clone
            </h1>
            <h2 className="hero-subheading">AI Operating System</h2>
          </div>

          <div className="hero-actions">
            <div className="circle-badge glass-panel">
              <div className="badge-logo">⚡ AI OS</div>
              <div className="badge-text">AI Driven<br/>Automation</div>
            </div>
            
            <Link href="/chat" className="btn-start-large">
              Get Started
            </Link>

            <div className="hero-right-text">
              WHERE ARTIFICIAL<br/>INTELLIGENCE MEETS<br/>BUSINESS AUTOMATION
            </div>
          </div>
        </div>

        <div className="bottom-panel glass-panel">
          <div className="panel-col">
            <h3 className="panel-title">
              <span className="highlight">AI</span> Driven Precision
            </h3>
            <p className="panel-desc">
              Smart automation and intelligent insights designed to support better business decisions.
            </p>
          </div>
          <div className="panel-col">
            <h2 className="panel-main-title">Built for the Future of Business</h2>
            <p className="panel-main-desc">
              A next-generation business ecosystem where technology and humanity work together seamlessly.
            </p>
            <Link href="/dashboard" className="panel-link">
              EXPERIENCE THE FUTURE
            </Link>
          </div>
          <div className="panel-col astronaut-col">
            <div className="large-astronaut">⚡</div>
          </div>
        </div>
      </main>
    </div>
  )
}

import Link from 'next/link'
import Image from 'next/image'

export default function HomePage() {
  return (
    <div className="sci-fi-landing">
      <header className="sci-fi-header">
        <nav className="sci-fi-nav">
          <Link href="/dashboard" className="nav-link active">ABOUT</Link>
          <Link href="/speakers" className="nav-link">SPEAKERS</Link>
          <Link href="/schedule" className="nav-link">SCHEDULE</Link>
          <Link href="/register" className="nav-link">REGISTER</Link>
          <Link href="/contact" className="nav-link">CONTACT</Link>
          {/* Add a direct entry to the actual app as requested by previous functionality */}
          <Link href="/dashboard" className="nav-link text-pink ml-auto">OPEN SYSTEM ↗</Link>
        </nav>
      </header>

      <main className="sci-fi-main">
        {/* Background Repeating Text */}
        <div className="bg-text-layer">
          <div className="bg-text-row">STOP BEING HUMAN</div>
          <div className="bg-text-row highlight-pink">BEING HUMAN STOP BEING HUMAN</div>
          <div className="bg-text-row highlight-cyan">STOP BEING HUMAN</div>
          <div className="bg-text-row">STOP BEING HUMAN</div>
          <div className="bg-text-row">STOP BEING HUMAN</div>
          <div className="bg-text-row highlight-pink">STOP BEING HUMAN</div>
          <div className="bg-text-row">STOP BEING HUMAN</div>
        </div>

        {/* Central glowing circle */}
        <div className="glowing-circle"></div>

        {/* Central Portrait */}
        <div className="portrait-container">
          <Image 
            src="/cyborg_portrait.jpg" 
            alt="Cyborg AI" 
            fill
            style={{ objectFit: 'contain' }}
            className="cyborg-portrait"
            priority
          />
        </div>

        {/* Left Side HUD Text */}
        <div className="hud-panel left-panel">
          <div className="hud-block">
            <span className="hud-label">date of event:</span>
            <div className="hud-value">DAY 241<br/>OF THE YEAR 547<br/>AFTER REBELLION</div>
          </div>
          <div className="hud-block mt-4">
            <span className="hud-label">place of event:</span>
            <div className="hud-value text-cyan">UNDERWORLDS<br/>NETWORK</div>
          </div>
          <div className="hud-block mt-4">
            <span className="hud-label">time left:</span>
            <div className="hud-value text-cyan large">283 DAYS<br/>16 HOURS</div>
          </div>

          <div className="hud-block mt-auto bottom-left">
            <span className="hud-label">goal:</span>
            <div className="hud-value text-cyan">GET RID<br/>OF YOUR <span className="text-pink">WEAKEST</span><br/>SELF</div>
          </div>
        </div>

        {/* Right Side HUD Text */}
        <div className="hud-panel right-panel">
          <div className="hud-block">
            <span className="hud-label">type of event:</span>
            <div className="hud-value text-cyan">ANNUAL THERAPEUTIC<br/>HOLOGRAPHIC<br/>SESSION<br/>FOR CYBORGS</div>
          </div>
          <div className="hud-block mt-4">
            <span className="hud-label">topic:</span>
            <div className="hud-value">HOW TO COPE<br/>WITH<br/>HUMANNESS</div>
          </div>
        </div>

      </main>
      
      {/* Decorative Grid Lines and UI details */}
      <div className="ui-crosshair top-left"></div>
      <div className="ui-crosshair top-right"></div>
      <div className="ui-crosshair bottom-left"></div>
      <div className="ui-crosshair bottom-right"></div>
    </div>
  )
}

import Link from 'next/link'
import { FaWhatsapp, FaFacebook, FaTwitter, FaGithub, FaGitAlt, FaReact, FaNodeJs, FaPython } from 'react-icons/fa'
import { SiVercel, SiNextdotjs } from 'react-icons/si'
import { BsCpu } from 'react-icons/bs'

export default function HomePage() {
  return (
    <div className="network-landing">
      {/* Header matching the image */}
      <header className="network-header">
        <div className="brand-block">
          <span className="brand-text">Sandeep Clone</span>
        </div>
        <nav className="network-nav">
          <Link href="/dashboard" className="nav-link">DASHBOARD</Link>
          <Link href="/clients" className="nav-link">CLIENTS</Link>
          <Link href="/chat" className="nav-link">AI CHAT</Link>
          <Link href="/upload" className="nav-link">UPLOAD</Link>
          <Link href="/settings" className="nav-link">SETTINGS</Link>
          <Link href="/dashboard" className="btn-demo">OPEN SYSTEM</Link>
        </nav>
      </header>

      <main className="network-main">
        {/* Hero Text */}
        <div className="hero-text-container">
          <div className="kicker">INTEGRATIONS</div>
          <h1 className="main-heading">Built on the largest network of AI interfaces</h1>
          <p className="sub-heading">
            When a new workflow is optimized by a user on any Sandeep-enabled device,
            <br />
            every other connected process is instantly accelerated.
          </p>
        </div>

        {/* Network Diagram */}
        <div className="network-diagram">
          {/* Orbit Rings */}
          <div className="orbit orbit-1"></div>
          <div className="orbit orbit-2"></div>
          <div className="orbit orbit-3"></div>

          {/* Central Node */}
          <div className="central-node">
            <BsCpu className="central-icon" />
          </div>

          {/* Connected Nodes */}
          {/* Inner Orbit (Orbit 1) */}
          <div className="node node-1 bg-green"><FaWhatsapp /></div>
          <div className="node node-2 bg-blue"><FaFacebook /></div>
          <div className="node node-3 bg-light-blue"><FaReact /></div>
          <div className="node node-4 bg-black"><SiNextdotjs /></div>

          {/* Middle Orbit (Orbit 2) */}
          <div className="node node-5 bg-black"><FaGithub /></div>
          <div className="node node-6 bg-orange"><FaGitAlt /></div>
          <div className="node node-7 bg-blue-dark"><FaPython /></div>
          <div className="node node-8 bg-green-dark"><FaNodeJs /></div>

          {/* Outer Orbit (Orbit 3) */}
          <div className="node node-9 bg-black"><SiVercel /></div>
          <div className="node node-10 bg-cyan"><FaTwitter /></div>
          <div className="node node-11 bg-purple">AI</div>
          <div className="node node-12 bg-pink">DB</div>

          {/* Optional connecting lines/labels */}
          <div className="network-label label-1">
            <div className="dot"></div>
            Data Flow
          </div>
          <div className="network-label label-2">
            <div className="dot"></div>
            Protocols
          </div>
        </div>
      </main>
    </div>
  )
}

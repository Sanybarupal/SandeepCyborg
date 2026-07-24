import Link from 'next/link'
import { FaWhatsapp, FaTwitter, FaFacebookF, FaGithub } from 'react-icons/fa'
import { FaDatabase, FaNetworkWired, FaBrain, FaRocket } from 'react-icons/fa6'
import { SiNotion, SiOpenai } from 'react-icons/si'
import { BsCpu, BsGrid1X2, BsPeople, BsChatText, BsCloudUpload, BsGear, BsMoon, BsBell } from 'react-icons/bs'
import { TbGitBranch, TbActivity, TbClock, TbBolt, TbShieldCheck, TbUsers } from 'react-icons/tb'

export default function HomePage() {
  return (
    <div className="premium-dashboard">
      {/* Globe Background Overlay */}
      <div className="globe-bg">
        <div className="globe-sphere"></div>
      </div>

      {/* Header */}
      <header className="premium-header">
        <div className="header-left">
          <div className="logo-icon">
            <BsCpu />
          </div>
          <span className="logo-text logo">Sandeep Clone</span>
          <span className="badge-aios">AI OS</span>
        </div>

        <nav className="header-center">
          <Link href="/dashboard" className="nav-pill active">
            <BsGrid1X2 /> Dashboard
          </Link>
          <Link href="/clients" className="nav-pill">
            <BsPeople /> Clients
          </Link>
          <Link href="/chat" className="nav-pill">
            <BsChatText /> AI Chat
          </Link>
          <Link href="/upload" className="nav-pill">
            <BsCloudUpload /> Upload
          </Link>
          <Link href="/settings" className="nav-pill">
            <BsGear /> Settings
          </Link>
        </nav>

        <div className="header-right">
          <button className="icon-btn"><BsMoon /></button>
          <button className="icon-btn relative">
            <BsBell />
            <span className="notification-dot">3</span>
          </button>
          <Link href="/dashboard" className="btn-gradient">
            Open System &rarr;
          </Link>
        </div>
      </header>

      {/* Main Orbital Content */}
      <main className="premium-main">
        <div className="orbital-network">
          {/* Orbits */}
          <div className="ring ring-1"></div>
          <div className="ring ring-2"></div>
          <div className="ring ring-3"></div>

          {/* Central AI Node */}
          <div className="center-node">
            <BsCpu className="center-icon" />
            <div className="center-text">AI</div>
          </div>

          {/* Orbit Nodes */}
          <div className="orbit-node pos-whatsapp">
            <div className="icon-box bg-green"><FaWhatsapp /></div>
            <div className="node-info">
              <span className="node-title">WhatsApp</span>
              <span className="node-sub text-green">Connected</span>
            </div>
          </div>

          <div className="orbit-node pos-twitter">
            <div className="icon-box bg-blue"><FaTwitter /></div>
            <div className="node-info">
              <span className="node-title">Twitter</span>
              <span className="node-sub">Live Feed</span>
            </div>
          </div>

          <div className="orbit-node pos-git">
            <div className="icon-box bg-orange"><TbGitBranch /></div>
            <div className="node-info">
              <span className="node-title">Git</span>
              <span className="node-sub">Version Control</span>
            </div>
          </div>

          <div className="orbit-node pos-notion">
            <div className="icon-box bg-dark"><SiNotion /></div>
            <div className="node-info">
              <span className="node-title">Notion</span>
              <span className="node-sub">Knowledge Base</span>
            </div>
          </div>

          <div className="orbit-node pos-openai">
            <div className="icon-box bg-green"><SiOpenai /></div>
            <div className="node-info">
              <span className="node-title">OpenAI</span>
              <span className="node-sub">AI Connected</span>
            </div>
          </div>

          <div className="orbit-node pos-database">
            <div className="icon-box bg-pink"><FaDatabase /></div>
            <div className="node-info">
              <span className="node-title">Database</span>
              <span className="node-sub">Secure</span>
            </div>
          </div>

          <div className="orbit-node pos-facebook">
            <div className="icon-box bg-blue"><FaFacebookF /></div>
            <div className="node-info">
              <span className="node-title">Facebook</span>
              <span className="node-sub">Integration</span>
            </div>
          </div>

          <div className="orbit-node pos-models">
            <div className="icon-box bg-purple"><FaBrain /></div>
            <div className="node-info">
              <span className="node-title">AI Models</span>
              <span className="node-sub">Active</span>
            </div>
          </div>

          <div className="orbit-node pos-workflow">
            <div className="icon-box bg-blue"><FaNetworkWired /></div>
            <div className="node-info">
              <span className="node-title">Workflow</span>
              <span className="node-sub">Automation</span>
            </div>
          </div>

          <div className="orbit-node pos-github">
            <div className="icon-box bg-dark"><FaGithub /></div>
            <div className="node-info">
              <span className="node-title">GitHub</span>
              <span className="node-sub">Repository</span>
            </div>
          </div>
        </div>

        {/* Hero Text */}
        <div className="hero-content">
          <h1 className="heading">
            BUILT ON THE LARGEST<br />
            NETWORK OF <span className="text-gradient">AI INTERFACES</span>
          </h1>
          <p>
            Unified AI workflows, seamless integrations, and real-time automation—<br />
            powering your entire digital ecosystem.
          </p>
          <Link href="/dashboard" className="btn-explore">
            Explore Dashboard &rarr;
          </Link>
        </div>
      </main>

      {/* Bottom Stats Bar */}
      <footer className="stats-bar-container">
        <div className="stats-bar">
          
          <div className="stat-card">
            <div className="stat-icon-wrapper circle-blue">
              <TbActivity />
            </div>
            <div className="stat-details">
              <span className="stat-label">Active Workflows</span>
              <span className="stat-value">24</span>
              <span className="stat-sub">Running Smoothly</span>
            </div>
          </div>

          <div className="stat-divider"></div>

          <div className="stat-card">
            <div className="stat-icon-wrapper circle-purple">
              <TbClock />
            </div>
            <div className="stat-details">
              <span className="stat-label">Total Integrations</span>
              <span className="stat-value">12</span>
              <span className="stat-sub">Connected Services</span>
            </div>
          </div>

          <div className="stat-divider"></div>

          <div className="stat-card">
            <div className="stat-icon-wrapper circle-orange">
              <TbBolt />
            </div>
            <div className="stat-details">
              <span className="stat-label">AI Requests</span>
              <span className="stat-value">1.2M+</span>
              <span className="stat-sub">Processed Today</span>
            </div>
          </div>

          <div className="stat-divider"></div>

          <div className="stat-card">
            <div className="stat-icon-wrapper circle-green">
              <TbShieldCheck />
            </div>
            <div className="stat-details">
              <span className="stat-label">System Uptime</span>
              <span className="stat-value">99.9%</span>
              <span className="stat-sub">Reliable & Secure</span>
            </div>
          </div>

          <div className="stat-divider"></div>

          <div className="stat-card">
            <div className="stat-icon-wrapper circle-pink">
              <TbUsers />
            </div>
            <div className="stat-details">
              <span className="stat-label">Active Users</span>
              <span className="stat-value">856</span>
              <span className="stat-sub">Across The Globe</span>
            </div>
          </div>

        </div>
      </footer>

      {/* Floating Action Button */}
      <button className="fab-rocket">
        <FaRocket />
      </button>
    </div>
  )
}

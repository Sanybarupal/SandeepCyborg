import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'

const FEATURES = [
  'Client Management',
  'WhatsApp Automation',
  'AI Chat Assistant',
  'Voice Assistant',
  'Approval System',
  'Knowledge Base',
  'Website Builder',
  'Business Automation'
]

const MODULES = [
  { href: '/dashboard', icon: '⚡', title: 'Dashboard', desc: 'Overview of all your business stats and activities.' },
  { href: '/clients', icon: '👥', title: 'Clients', desc: 'Manage leads, projects, and client relationships.' },
  { href: '/chat', icon: '💬', title: 'AI Chat', desc: 'Interact with your personalized AI assistant.' },
  { href: '/approvals', icon: '✅', title: 'Approvals', desc: 'Review and approve pending system actions.' },
  { href: '/upload', icon: '📂', title: 'Upload', desc: 'Upload documents and update your Knowledge Base.' },
  { href: '#', icon: '🎤', title: 'Voice', desc: 'Voice commands and interactions (Phase 3).' },
  { href: '#', icon: '🌐', title: 'Web Builder', desc: 'Create and manage websites automatically (Phase 4).' },
  { href: '#', icon: '⚙️', title: 'Settings', desc: 'Configure your AI Operating System preferences.' }
]

export default function HomePage() {
  return (
    <div className="home-page animate-in">
      {/* 3D Sphere Background Animation */}
      <div className="sphere-container">
        <div className="sphere"></div>
      </div>

      <header className="home-header">
        <div className="home-logo">⚡ Sandeep Clone</div>
        <ThemeToggle />
      </header>

      <main className="home-content">
        <h1 className="home-title">Welcome to Sandeep Clone</h1>
        <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px', color: 'var(--purple-light)' }}>
          AI Operating System
        </div>
        <p className="home-subtitle">
          Your Personal AI Assistant for Business Automation
        </p>

        <div className="overview-list">
          {FEATURES.map((feature, i) => (
            <div key={i} className="overview-pill">
              • {feature}
            </div>
          ))}
        </div>

        <div className="quick-actions">
          <Link href="/dashboard" className="btn btn-primary btn-lg">
            Open Dashboard
          </Link>
          <Link href="/chat" className="btn btn-success btn-lg">
            Start AI
          </Link>
          <Link href="/clients/new" className="btn btn-ghost btn-lg">
            New Project
          </Link>
          <Link href="/upload" className="btn btn-ghost btn-lg">
            Upload Files
          </Link>
        </div>

        <div className="home-grid">
          {MODULES.map((mod, i) => (
            <Link key={i} href={mod.href} className="home-card">
              <div className="home-card-icon">{mod.icon}</div>
              <div className="home-card-title">{mod.title}</div>
              <div className="home-card-desc">{mod.desc}</div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}

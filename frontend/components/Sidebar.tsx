'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import ThemeToggle from './ThemeToggle'

const API = ''

const navItems = [
  { href: '/dashboard',  icon: '⚡',  label: 'Dashboard'  },
  { href: '/clients',    icon: '👥',  label: 'Clients'    },
  { href: '/chat',       icon: '💬',  label: 'AI Chat'    },
  { href: '/approvals',  icon: '✅',  label: 'Approvals', badge: true },
  { href: '/upload',     icon: '📂',  label: 'Upload'     },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [pendingApprovals, setPendingApprovals] = useState(0)
  const [aiMode, setAiMode] = useState<'mock' | 'gpt4'>('mock')
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Close sidebar on route change
    setIsOpen(false)
  }, [pathname])

  useEffect(() => {
    // Fetch pending approvals count
    const fetchCount = async () => {
      try {
        const res = await fetch(`${API}/api/approvals/count`)
        if (res.ok) {
          const data = await res.json()
          setPendingApprovals(data.pending || 0)
        }
      } catch {}
    }

    // Fetch AI mode
    const fetchMode = async () => {
      try {
        const res = await fetch(`${API}/`)
        if (res.ok) {
          const data = await res.json()
          setAiMode(data.ai_mode === 'gpt4' ? 'gpt4' : 'mock')
        }
      } catch {}
    }

    fetchCount()
    fetchMode()

    // Refresh every 30 seconds
    const interval = setInterval(fetchCount, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      {/* Mobile Header */}
      <div className="mobile-header">
        <div className="mobile-logo">⚡ Sandeep Clone</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ThemeToggle />
          <button className="hamburger-btn" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Overlay */}
      <div 
        className={`sidebar-overlay ${isOpen ? 'show' : ''}`} 
        onClick={() => setIsOpen(false)}
      />

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-text">⚡ Sandeep Clone</div>
          <div className="sidebar-logo-sub">AI Operating System v1.0</div>
          <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className={`ai-mode-badge ${aiMode === 'gpt4' ? 'ai-mode-gpt4' : 'ai-mode-mock'}`}>
              {aiMode === 'gpt4' ? '🟢 GPT-4 Live' : '🟡 Mock Mode'}
            </span>
            <ThemeToggle />
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="nav-section-title">Main Menu</div>

          {navItems.map((item) => {
            const isActive = pathname === item.href
            const showBadge = item.badge && pendingApprovals > 0

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setIsOpen(false)}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
                {showBadge && (
                  <span className="nav-badge">{pendingApprovals}</span>
                )}
              </Link>
            )
          })}

          <div className="nav-section-title" style={{ marginTop: '24px' }}>System</div>

          <div className="nav-item" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
            <span>📱</span>
            <span>WhatsApp</span>
            <span style={{ fontSize: '10px', marginLeft: 'auto', color: 'var(--text-muted)' }}>Phase 2</span>
          </div>
          <div className="nav-item" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
            <span>🎤</span>
            <span>Voice</span>
            <span style={{ fontSize: '10px', marginLeft: 'auto', color: 'var(--text-muted)' }}>Phase 3</span>
          </div>
          <div className="nav-item" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
            <span>🌐</span>
            <span>Web Builder</span>
            <span style={{ fontSize: '10px', marginLeft: 'auto', color: 'var(--text-muted)' }}>Phase 4</span>
          </div>
        </nav>

        {/* Bottom Status */}
        <div style={{
          padding: '16px',
          borderTop: '1px solid var(--border)',
          fontSize: '11px',
          color: 'var(--text-muted)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              width: '6px', height: '6px',
              borderRadius: '50%',
              background: 'var(--green)',
              display: 'inline-block',
              boxShadow: '0 0 6px var(--green)',
            }}/>
            Backend Connected
          </div>
          <div style={{ marginTop: '4px', color: 'var(--text-muted)' }}>
            API: localhost:8000
          </div>
        </div>
      </aside>
    </>
  )
}

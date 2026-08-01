'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Icons } from './Icons'

export function MobileShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [micActive, setMicActive] = useState(false)

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <div className="mobile-shell ds-root">
      {/* Background */}
      <div className="ds-bg">
        <div className="ds-bg-grid" />
        <div className="ds-bg-vignette" />
      </div>

      {/* Top Header */}
      <header className="ds-navbar premium-top-nav" style={{ padding: '0 20px', height: '70px', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/settings" className="ds-nav-btn" style={{ padding: '8px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: 'var(--text)' }}>
            {Icons.menu}
          </Link>
          <Link href="/" className="ds-sb-logo ds-mobile-logo" style={{ padding: 0, border: 'none', minHeight: 'auto', textDecoration: 'none' }}>
            <div className="ds-sb-logo-icon">{Icons.bolt}</div>
            <div className="ds-sb-logo-text">
              <span className="ds-sb-logo-name" style={{ fontSize: '18px' }}>Hi, Sandeep</span>
              <span className="ds-sb-logo-badge">AI ONLINE</span>
            </div>
          </Link>
        </div>
        
        <div className="ds-nav-right">
          <button className="ds-nav-btn" title="Theme" onClick={() => document.documentElement.classList.toggle('light-theme')}>
            {Icons.moon}
          </button>
          <Link href="/settings" className="ds-nav-btn ds-nav-btn-notif">
            {Icons.bell}
            <span className="ds-nav-notif-dot">3</span>
          </Link>
          <Link href="/settings" className="ds-nav-profile">
            <img src="https://ui-avatars.com/api/?name=Sandeep+Kumar&background=4F8CFF&color=fff&size=36" alt="" />
            <div className="ds-nav-profile-dot" />
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="ds-main" style={{ marginLeft: 0, paddingBottom: '120px', paddingTop: '70px' }}>
        {children}
      </main>

      {/* Floating Bottom Nav */}
      <nav className="mob-floating-nav">
        <Link href="/" className={`mob-nav-item ${isActive('/') ? 'active' : ''}`}>
          <div className="mob-nav-icon">{Icons.dashboard}</div>
          <span>Home</span>
        </Link>
        <Link href="/clients" className={`mob-nav-item ${isActive('/clients') ? 'active' : ''}`}>
          <div className="mob-nav-icon">{Icons.clients}</div>
          <span>Clients</span>
        </Link>
        
        {/* Center AI Mic FAB */}
        <Link href="/voice" className="mob-nav-fab" style={{ border: isActive('/voice') ? '2px solid var(--cyan)' : '4px solid var(--bg)' }}>
          {Icons.mic}
        </Link>

        <Link href="/whatsapp" className={`mob-nav-item ${isActive('/whatsapp') ? 'active' : ''}`}>
          <div className="mob-nav-icon">{Icons.whatsapp}</div>
          <span>Chats</span>
        </Link>
        <Link href="/settings" className={`mob-nav-item ${isActive('/settings') ? 'active' : ''}`}>
          <div className="mob-nav-icon">{Icons.settings}</div>
          <span>More</span>
        </Link>
      </nav>
    </div>
  )
}

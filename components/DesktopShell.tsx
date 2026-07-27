'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Icons } from './Icons'

// ── Navigation Config ──
const mainNav = [
  { href: '/', icon: Icons.dashboard, label: 'Dashboard' },
  { href: '/clients', icon: Icons.clients, label: 'Clients' },
  { href: '/chat', icon: Icons.whatsapp, label: 'WhatsApp' },
  { href: '/chat', icon: Icons.chat, label: 'AI Chat' },
  { href: '/voice', icon: Icons.mic, label: 'Voice AI' },
  { href: '/website-builder', icon: Icons.globe, label: 'Web Builder' },
]

const systemNav = [
  { href: '/approvals', icon: Icons.shield, label: 'Approvals' },
  { href: '/upload', icon: Icons.upload, label: 'Upload' },
  { href: '/dashboard', icon: Icons.layers, label: 'Projects' },
  { href: '/dashboard', icon: Icons.chart, label: 'Analytics' },
  { href: '/settings', icon: Icons.settings, label: 'Settings' },
]

export function DesktopShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [time, setTime] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)

  useEffect(() => {
    const tick = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }))
    }
    tick()
    const iv = setInterval(tick, 1000)
    return () => clearInterval(iv)
  }, [])

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const sidebarWidth = collapsed ? 72 : 260

  return (
    <div className="ds-root">
      {/* ── Animated Background ── */}
      <div className="ds-bg">
        <div className="ds-bg-grid" />
        <div className="ds-bg-aurora" />
        <div className="ds-bg-aurora ds-bg-aurora-2" />
        <div className="ds-bg-vignette" />
        {Array.from({ length: 40 }).map((_, i) => (
          <div key={i} className="ds-bg-particle" style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${Math.random() * 2.5 + 0.5}px`,
            height: `${Math.random() * 2.5 + 0.5}px`,
            animationDelay: `${Math.random() * 8}s`,
            animationDuration: `${Math.random() * 5 + 4}s`,
          }} />
        ))}
      </div>

      {/* ── Sidebar ── */}
      <motion.aside
        className="ds-sidebar"
        animate={{ width: sidebarWidth }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Logo */}
        <div className="ds-sb-logo">
          <div className="ds-sb-logo-icon">{Icons.bolt}</div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                className="ds-sb-logo-text"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <span className="ds-sb-logo-name">Sandeep <span className="ds-sb-logo-accent">Clone</span></span>
                <span className="ds-sb-logo-badge">AI OS</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Collapse Toggle */}
        <button className="ds-sb-toggle" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? Icons.chevronRight : Icons.chevronLeft}
        </button>

        {/* Main Nav */}
        <nav className="ds-sb-nav">
          <div className="ds-sb-section-label">{!collapsed && 'MAIN'}</div>
          {mainNav.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`ds-sb-item ${isActive(item.href) ? 'ds-sb-item--active' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <div className="ds-sb-item-icon">{item.icon}</div>
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    className="ds-sb-item-label"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.15 }}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {isActive(item.href) && <div className="ds-sb-item-glow" />}
            </Link>
          ))}

          <div className="ds-sb-divider" />
          <div className="ds-sb-section-label">{!collapsed && 'SYSTEM'}</div>
          {systemNav.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`ds-sb-item ${isActive(item.href) ? 'ds-sb-item--active' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <div className="ds-sb-item-icon">{item.icon}</div>
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    className="ds-sb-item-label"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.15 }}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          ))}
        </nav>

        {/* Bottom User Card */}
        <div className="ds-sb-footer">
          <div className="ds-sb-user">
            <div className="ds-sb-avatar">
              <img src="https://ui-avatars.com/api/?name=Sandeep+Kumar&background=4F8CFF&color=fff&size=36" alt="" />
              <div className="ds-sb-avatar-dot" />
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  className="ds-sb-user-info"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="ds-sb-user-name">Sandeep Kumar</div>
                  <div className="ds-sb-user-role">Admin · Online</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>

      {/* ── Top Navbar ── */}
      <motion.header
        className="ds-navbar"
        animate={{ left: sidebarWidth }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Search */}
        <div className={`ds-nav-search ${searchFocused ? 'ds-nav-search--focus' : ''}`}>
          <div className="ds-nav-search-icon">{Icons.search}</div>
          <input
            type="text"
            placeholder="Search anything..."
            className="ds-nav-search-input"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          <div className="ds-nav-search-kbd">⌘K</div>
        </div>

        {/* Right section */}
        <div className="ds-nav-right">
          {/* AI Status */}
          <div className="ds-nav-ai-status">
            <div className="ds-nav-ai-dot" />
            <span>AI Online</span>
          </div>

          {/* Time */}
          <div className="ds-nav-time">
            {Icons.clock}
            <span>{time}</span>
          </div>

          {/* Voice */}
          <button className="ds-nav-btn ds-nav-btn--voice" title="Voice AI">
            {Icons.mic}
          </button>

          {/* Notifications */}
          <button className="ds-nav-btn" title="Notifications">
            {Icons.bell}
            <span className="ds-nav-notif-dot">3</span>
          </button>

          {/* Theme */}
          <button className="ds-nav-btn" title="Theme">
            {Icons.moon}
          </button>

          {/* Profile */}
          <div className="ds-nav-profile">
            <img src="https://ui-avatars.com/api/?name=Sandeep+Kumar&background=4F8CFF&color=fff&size=36" alt="" />
          </div>
        </div>
      </motion.header>

      {/* ── Main Content ── */}
      <motion.main
        className="ds-main"
        animate={{ marginLeft: sidebarWidth }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        {children}
      </motion.main>
    </div>
  )
}

'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Icons } from './Icons'

// ── Navigation Config ──
const mainNav = [
  { href: '/', icon: Icons.dashboard, label: 'Dashboard' },
  { href: '/clients', icon: Icons.clients, label: 'Clients' },
  { href: '/whatsapp', icon: Icons.whatsapp, label: 'WhatsApp' },
  { href: '/chat', icon: Icons.chat, label: 'AI Chat' },
  { href: '/voice', icon: Icons.mic, label: 'Voice AI' },
  { href: '/website-builder', icon: Icons.globe, label: 'Web Builder' },
]

const systemNav = [
  { href: '/approvals', icon: Icons.shield, label: 'Approvals' },
  { href: '/upload', icon: Icons.upload, label: 'Upload' },
  { href: '/analytics', icon: Icons.chart, label: 'Analytics' },
  { href: '/settings', icon: Icons.settings, label: 'Settings' },
]

const notifications = [
  { icon: Icons.whatsapp, title: '320 new WhatsApp messages', desc: 'From 42 clients across channels', time: '2m ago', color: 'var(--green)', unread: true },
  { icon: Icons.shield, title: '3 approvals pending review', desc: 'Urgent: Client onboarding & API key', time: '15m ago', color: 'var(--orange)', unread: true },
  { icon: Icons.chat, title: 'AI processed 842 conversations', desc: 'Daily report ready for review', time: '1h ago', color: 'var(--purple)', unread: true },
  { icon: Icons.upload, title: '12 files uploaded to knowledge', desc: 'Processing complete — 99.2% trained', time: '2h ago', color: 'var(--primary)', unread: false },
  { icon: Icons.bolt, title: 'System update complete', desc: 'AI Engine v4.2 deployed successfully', time: '5h ago', color: 'var(--cyan)', unread: false },
]

export function DesktopShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [time, setTime] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
    const tick = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }))
    }
    tick()
    const iv = setInterval(tick, 1000)
    return () => clearInterval(iv)
  }, [])

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const sidebarWidth = collapsed ? 72 : 260

  return (
    <div className="desktop-shell ds-root">
      {/* ── Animated Background ── */}
      <div className="ds-bg">
        <div className="ds-bg-grid" />
        <div className="ds-bg-aurora" />
        <div className="ds-bg-aurora ds-bg-aurora-2" />
        <div className="ds-bg-vignette" />
        {mounted && Array.from({ length: 40 }).map((_, i) => (
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
        className="ds-sidebar premium-sidebar"
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
        className="ds-navbar premium-top-nav"
        animate={{ left: sidebarWidth }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Desktop Search (hidden on mobile) */}
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

        {/* Mobile Left: Greeting & AI Status */}
        <div className="ds-nav-mobile-left">
           <div className="ds-sb-logo ds-mobile-logo">
             <div className="ds-sb-logo-icon">{Icons.bolt}</div>
             <div className="ds-sb-logo-text">
               <span className="ds-sb-logo-name">Hi, Sandeep</span>
               <span className="ds-sb-logo-badge">AI ONLINE</span>
             </div>
           </div>
        </div>

        {/* Right section */}
        <div className="ds-nav-right">
          {/* Desktop AI Status */}
          <div className="ds-nav-ai-status">
            <div className="ds-nav-ai-dot" />
            <span>AI Online</span>
          </div>

          {/* Desktop Time */}
          <div className="ds-nav-time">
            {Icons.clock}
            <span>{time}</span>
          </div>

          {/* Desktop Voice */}
          <Link href="/voice" className="ds-nav-btn ds-nav-btn--voice ds-desktop-only" title="Voice AI">
            {Icons.mic}
          </Link>

          {/* Mobile Shortcuts */}
          <Link href="/voice" className="ds-nav-btn ds-nav-btn--voice ds-mobile-action" title="Voice AI">
            {Icons.mic}
          </Link>
          <button className="ds-nav-btn ds-mobile-action" title="Search" onClick={() => setMobileMenuOpen(true)}>
            {Icons.search}
          </button>

          {/* Theme (Desktop) */}
          <button className="ds-nav-btn ds-desktop-only" title="Theme" onClick={() => document.documentElement.classList.toggle('light-theme')}>
            {Icons.moon}
          </button>

          {/* Notifications (Both) */}
          <div ref={notifRef} style={{ position: 'relative' }}>
            <button className="ds-nav-btn ds-nav-btn-notif" title="Notifications" onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false) }}>
              {Icons.bell}
              <span className="ds-nav-notif-dot">3</span>
            </button>

            {/* Notification Dropdown */}
            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  className="ds-dropdown-panel"
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    position: 'absolute', top: 'calc(100% + 12px)', right: 0,
                    width: 380, zIndex: 100,
                    background: 'var(--panel-solid)', border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius)', overflow: 'hidden',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(79,140,255,0.08)',
                    backdropFilter: 'blur(20px)',
                  }}
                >
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-hero)', fontSize: 11, letterSpacing: '1.5px', color: 'var(--text-muted)' }}>NOTIFICATIONS</span>
                    <button style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 500 }} onClick={() => setNotifOpen(false)}>Mark all read</button>
                  </div>
                  <div style={{ maxHeight: 360, overflow: 'auto' }}>
                    {notifications.map((n, i) => (
                      <div key={i} className="ds-notif-item" style={{
                        padding: '14px 20px', display: 'flex', gap: 12, alignItems: 'flex-start',
                        borderBottom: '1px solid var(--border)',
                        background: n.unread ? 'rgba(79,140,255,0.03)' : 'transparent',
                        cursor: 'pointer', transition: 'background 0.15s',
                      }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(79,140,255,0.06)')}
                        onMouseLeave={e => (e.currentTarget.style.background = n.unread ? 'rgba(79,140,255,0.03)' : 'transparent')}
                      >
                        <div style={{
                          width: 36, height: 36, borderRadius: 10, minWidth: 36,
                          background: `${n.color}15`, color: n.color,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>{n.icon}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: n.unread ? 600 : 400, marginBottom: 2 }}>{n.title}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{n.desc}</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                          <span style={{ fontSize: 10, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{n.time}</span>
                          {n.unread && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 6px var(--primary-glow)' }} />}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Link href="/approvals" onClick={() => setNotifOpen(false)} style={{
                    display: 'block', padding: '12px 20px', textAlign: 'center',
                    fontSize: 13, fontWeight: 500, color: 'var(--primary)',
                    borderTop: '1px solid var(--border)', transition: 'background 0.15s',
                  }}>
                    View All Notifications →
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile (Both) */}
          <div ref={profileRef} style={{ position: 'relative' }}>
            <div className="ds-nav-profile" onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false) }} style={{ cursor: 'pointer' }}>
              <img src="https://ui-avatars.com/api/?name=Sandeep+Kumar&background=4F8CFF&color=fff&size=36" alt="" />
              <div className="ds-nav-profile-dot" />
            </div>

            {/* Profile Dropdown */}
            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  className="ds-dropdown-panel"
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    position: 'absolute', top: 'calc(100% + 12px)', right: 0,
                    width: 280, zIndex: 100,
                    background: 'var(--panel-solid)', border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius)', overflow: 'hidden',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(79,140,255,0.08)',
                    backdropFilter: 'blur(20px)',
                  }}
                >
                  {/* Profile Header */}
                  <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                      <img src="https://ui-avatars.com/api/?name=Sandeep+Kumar&background=4F8CFF&color=fff&size=44" alt="" style={{ width: 44, height: 44, borderRadius: 12, border: '2px solid rgba(79,140,255,0.3)' }} />
                      <div style={{ position: 'absolute', bottom: -1, right: -1, width: 12, height: 12, background: 'var(--green)', borderRadius: '50%', border: '2px solid var(--panel-solid)' }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>Sandeep Kumar</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>sandeep@cloneos.com</div>
                      <div style={{ fontSize: 10, color: 'var(--green)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--green)' }} /> Online
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div style={{ padding: '6px 0' }}>
                    {[
                      { icon: Icons.user, label: 'My Profile', href: '/settings' },
                      { icon: Icons.settings, label: 'Settings', href: '/settings' },
                      { icon: Icons.chart, label: 'Analytics', href: '/analytics' },
                      { icon: Icons.shield, label: 'Approvals', href: '/approvals' },
                    ].map((item, i) => (
                      <Link key={i} href={item.href} onClick={() => setProfileOpen(false)} style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px',
                        fontSize: 13, color: 'var(--text-secondary)', transition: 'all 0.15s',
                      }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(79,140,255,0.06)'; e.currentTarget.style.color = 'var(--text)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}
                      >
                        <div style={{ color: 'var(--text-muted)', width: 18 }}>{item.icon}</div>
                        {item.label}
                      </Link>
                    ))}
                  </div>

                  {/* Divider & Status */}
                  <div style={{ borderTop: '1px solid var(--border)', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>AI OS v2.4</span>
                    <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 4, background: 'rgba(34,197,94,0.1)', color: 'var(--green)', border: '1px solid rgba(34,197,94,0.2)', fontWeight: 600, letterSpacing: '0.5px' }}>ADMIN</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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

      {/* ── Mobile Side Drawer ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="ds-mobile-drawer"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
          >
             <div className="ds-mobile-drawer-header">
                <div className="ds-sb-logo">
                  <div className="ds-sb-logo-icon">{Icons.bolt}</div>
                  <div className="ds-sb-logo-text">
                    <span className="ds-sb-logo-name">Sandeep <span className="ds-sb-logo-accent">Clone</span></span>
                    <span className="ds-sb-logo-badge">AI OS</span>
                  </div>
                </div>
                <button className="ds-drawer-close" onClick={() => setMobileMenuOpen(false)}>
                  {Icons.close}
                </button>
             </div>
             
             <div className="ds-drawer-content">
               <div className="ds-drawer-profile-card">
                 <div className="ds-sb-avatar">
                   <img src="https://ui-avatars.com/api/?name=Sandeep+Kumar&background=4F8CFF&color=fff&size=44" alt="" />
                 </div>
                 <div className="ds-drawer-profile-info">
                   <div className="ds-drawer-profile-name">Sandeep Kumar</div>
                   <div className="ds-drawer-profile-email">sandeep@cloneos.com</div>
                   <div className="ds-drawer-profile-status">
                     <div className="ds-drawer-status-dot" /> Online
                   </div>
                 </div>
                 <div className="ds-drawer-profile-arrow">{Icons.chevronRight}</div>
               </div>

               <div className="ds-drawer-section">
                  <div className="ds-drawer-section-header">
                    <span>SYSTEM STATUS</span>
                    <span className="ds-drawer-viewall">View All</span>
                  </div>
                  <div className="ds-drawer-status-list">
                    <div className="ds-drawer-status-item">
                      <div className="ds-drawer-status-icon ds-text-green">{Icons.check}</div>
                      <div className="ds-drawer-status-text">
                        <div className="ds-drawer-status-title">All Systems Operational</div>
                        <div className="ds-drawer-status-sub">99.9% Uptime</div>
                      </div>
                    </div>
                    {[
                      { name: 'AI Engine', val: 100, color: 'var(--green)' },
                      { name: 'WhatsApp Sync', val: 100, color: 'var(--green)' },
                      { name: 'Database', val: 98, color: 'var(--purple)' },
                      { name: 'API Services', val: 100, color: 'var(--orange)' },
                      { name: 'Voice System', val: 100, color: 'var(--cyan)' },
                    ].map(sys => (
                      <div key={sys.name} className="ds-drawer-progress-item">
                        <div className="ds-drawer-progress-header">
                           <span className="ds-drawer-progress-name">{sys.name}</span>
                           <span className="ds-drawer-progress-val">{sys.val}%</span>
                        </div>
                        <div className="ds-drawer-progress-bar">
                           <div className="ds-drawer-progress-fill" style={{ width: `${sys.val}%`, background: sys.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Floating Action Button (Mic) ── */}
      <Link href="/voice" className="fab-mic">
        {Icons.mic}
      </Link>

      {/* ── Mobile Menu Bar ── */}
      <nav className="ds-mobile-menubar">
        <Link href="/" className={`ds-mobile-item ${isActive('/') ? 'ds-mobile-item--active' : ''}`}>
          <div className="ds-mobile-item-icon">{Icons.dashboard}</div>
          <span className="ds-mobile-item-label">Dashboard</span>
        </Link>
        <Link href="/clients" className={`ds-mobile-item ${isActive('/clients') ? 'ds-mobile-item--active' : ''}`}>
          <div className="ds-mobile-item-icon">{Icons.clients}</div>
          <span className="ds-mobile-item-label">Clients</span>
        </Link>
        
        {/* Center AI Button */}
        <Link href="/chat" className="ds-mobile-item-center">
           <div className="ds-mobile-ai-btn">
              <span className="ds-mobile-ai-text">AI</span>
              <div className="ds-mobile-ai-glow" />
           </div>
        </Link>

        <Link href="/voice" className={`ds-mobile-item ${isActive('/voice') ? 'ds-mobile-item--active' : ''}`}>
          <div className="ds-mobile-item-icon">{Icons.mic}</div>
          <span className="ds-mobile-item-label">Voice</span>
        </Link>
        <Link href="/settings" className={`ds-mobile-item ${isActive('/settings') ? 'ds-mobile-item--active' : ''}`}>
          <div className="ds-mobile-item-icon">{Icons.settings}</div>
          <span className="ds-mobile-item-label">Settings</span>
        </Link>
      </nav>
    </div>
  )
}

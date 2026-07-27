'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Icons } from './Icons'
import { ProgressBar } from './ProgressBar'

const systemStatus = [
  { label: 'AI Engine', value: 100, color: 'green' },
  { label: 'WhatsApp Sync', value: 100, color: 'cyan' },
  { label: 'Database', value: 98, color: 'purple' },
  { label: 'API Services', value: 100, color: 'orange' },
  { label: 'Voice System', value: 100, color: 'blue' },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [micActive, setMicActive] = useState(false)
  const pathname = usePathname()

  const navItems = [
    { id: '/', icon: Icons.dashboard, label: 'Dashboard' },
    { id: '/clients', icon: Icons.clients, label: 'Clients' },
    { id: '/chat', icon: Icons.chat, label: 'AI Chat' },
    { id: '/upload', icon: Icons.upload, label: 'Upload' },
    { id: '/settings', icon: Icons.settings, label: 'Settings' },
  ]

  const isActive = (path: string) => pathname === path || (path !== '/' && pathname.startsWith(path))

  return (
    <div className="app-root">
      
      {/* ── Background System ── */}
      <div className="bg-system">
        <div className="bg-grid" />
        <div className="bg-grad" />
        {Array.from({ length: 60 }).map((_, i) => (
          <div key={i} className="star" style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${Math.random() * 2 + 1}px`,
            height: `${Math.random() * 2 + 1}px`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${Math.random() * 3 + 2}s`,
          }} />
        ))}
      </div>

      {/* ── Top Header (Desktop) ── */}
      <header className="desk-header">
        <div className="desk-logo">
          <div className="desk-logo-icon">{Icons.dashboard}</div>
          <div className="desk-logo-text">Sandeep <span style={{ color: 'var(--purple-light)' }}>Clone</span></div>
          <div className="desk-logo-badge">AI OS</div>
        </div>

        <nav className="desk-nav">
          {navItems.map(item => (
            <Link key={item.id} href={item.id} className={`d-nav-item ${isActive(item.id) ? 'd-nav-active' : ''}`}>
              {item.icon} {item.label}
              {isActive(item.id) && <div className="d-nav-indicator" />}
            </Link>
          ))}
        </nav>

        <div className="desk-header-right">
          <button className="icon-btn">{Icons.moon}</button>
          <button className="icon-btn relative">
            {Icons.bell}
            <span className="notif-badge">3</span>
          </button>
          <div className="avatar-wrap">
            <img src="https://ui-avatars.com/api/?name=Sandeep+Kumar&background=4F8CFF&color=fff&size=40" alt="Avatar" />
            <div className="avatar-dot" />
          </div>
          <button className="btn-primary-sm">Open System →</button>
        </div>
      </header>

      {/* ── Mobile specific header (Mock status bar removed) ── */}
      <div className="mob-only-header">
        <header className="mob-header">
          <button className="icon-btn-ghost" onClick={() => setSidebarOpen(true)}>{Icons.menu}</button>
          <div className="desk-logo">
            <div className="desk-logo-icon">{Icons.dashboard}</div>
            <div className="desk-logo-text">Sandeep Clone</div>
            <div className="desk-logo-badge">AI OS</div>
          </div>
          <div className="mob-header-right">
            <button className="icon-btn-ghost relative">
              {Icons.bell}
              <span className="notif-badge">3</span>
            </button>
            <div className="avatar-wrap-sm">
              <img src="https://ui-avatars.com/api/?name=Sandeep+Kumar&background=4F8CFF&color=fff&size=32" alt="Avatar" />
              <div className="avatar-dot" />
            </div>
          </div>
        </header>
      </div>

      {/* ── Page Content ── */}
      {children}

      {/* ── Mobile Bottom Nav ── */}
      <nav className="mob-nav">
        <div className="mob-nav-glass" />
        {[
          { id: '/', icon: Icons.dashboard, lbl: 'Dashboard' },
          { id: '/clients', icon: Icons.clients, lbl: 'Clients' },
          { id: '/ai', icon: null, lbl: 'AI', center: true },
          { id: '/chat', icon: Icons.chat, lbl: 'AI Chat' },
          { id: '/settings', icon: Icons.settings, lbl: 'Settings' },
        ].map(item => item.center ? (
          <div key={item.id} className="mob-nav-center" />
        ) : (
          <Link key={item.id} href={item.id} className={`mob-nav-item ${isActive(item.id) ? 'mob-nav--active' : ''}`}>
            <div className="mob-nav-icon">{item.icon}</div>
            <span className="mob-nav-lbl">{item.lbl}</span>
            {isActive(item.id) && <div className="mob-nav-ind" />}
          </Link>
        ))}
      </nav>

      {/* Mobile FAB */}
      <button className="mob-fab" onClick={() => setMicActive(!micActive)}>
        <div className="mob-fab-inner">{Icons.mic}</div>
      </button>

      {/* ── Mobile Slide-out Sidebar (Menu / Assistant) ── */}
      <div className={`mob-sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />
      <div className={`mob-sidebar ${sidebarOpen ? 'open' : ''}`}>
        
        <div className="ms-header">
          <div className="desk-logo">
            <div className="desk-logo-icon">{Icons.dashboard}</div>
            <div className="desk-logo-text">Sandeep Clone</div>
            <div className="desk-logo-badge">AI OS</div>
          </div>
          <button className="icon-btn-ghost" onClick={() => setSidebarOpen(false)}>{Icons.close}</button>
        </div>

        <div className="ms-profile-card">
          <div className="avatar-wrap">
            <img src="https://ui-avatars.com/api/?name=Sandeep+Kumar&background=4F8CFF&color=fff&size=40" alt="Avatar" />
          </div>
          <div className="ms-profile-info">
            <div className="ms-name">Sandeep Kumar</div>
            <div className="ms-email">sandeep@cloneos.com</div>
            <div className="ms-status"><div className="sys-dot-small" /> Online</div>
          </div>
          <div className="ms-profile-chevron">{Icons.chevronRight}</div>
        </div>

        <div className="ms-section">
          <div className="ms-section-head">
            <span>SYSTEM STATUS</span>
            <a href="#" className="ms-link">View All</a>
          </div>
          <div className="ms-panel">
            <div className="sys-overall" style={{marginBottom:'16px'}}>
              <div className="sys-dot" style={{width:'20px', height:'20px'}}/>
              <div>
                <div className="sys-main" style={{fontSize:'13px'}}>All Systems Operational</div>
                <div className="sys-sub" style={{fontSize:'11px'}}>99.9% Uptime</div>
              </div>
            </div>
            <div className="sys-bars">
              {systemStatus.map((s, i) => <ProgressBar key={i} {...s} />)}
            </div>
          </div>
        </div>

        <div className="ms-section">
          <div className="ms-panel ai-assist-panel">
            <div className="hud-head" style={{marginBottom:'8px'}}>
              <div className="hud-title">{Icons.bolt} AI ASSISTANT</div>
            </div>
            <div className="waveform">
              {Array.from({length:32}).map((_,i)=>(
                <div key={i} className="wave-bar" style={{animationDelay:`${i*0.05}s`}} />
              ))}
            </div>
            <div className="ai-text">
              <div className="ai-listen">Listening...</div>
              <div className="ai-prompt" style={{fontSize:'14px'}}>How can I assist you today?</div>
            </div>
            <button className={`btn-speak ${micActive ? 'active' : ''}`} onClick={() => setMicActive(!micActive)}>
              {Icons.mic} {micActive ? 'Listening...' : 'Speak Now'}
            </button>
          </div>
        </div>

        <div className="ms-section">
          <div className="ms-section-head">
            <span>TODAY'S ACTIVITY</span>
            <a href="#" className="ms-link">View All</a>
          </div>
          <div className="ms-panel activity-list">
            {[
              { icon: Icons.whatsapp, label: 'WhatsApp Messages', val: '320', trend: '↑ 12.5%', color: 'green' },
              { icon: Icons.chat, label: 'AI Conversations', val: '842', trend: '↑ 18.3%', color: 'purple' },
              { icon: Icons.mic, label: 'Voice Commands', val: '486', trend: '↑ 15.2%', color: 'cyan' },
              { icon: Icons.folder, label: 'Files Processed', val: '128', trend: '↑ 10.6%', color: 'orange' },
              { icon: Icons.settings, label: 'Automations Run', val: '36', trend: '↑ 8.4%', color: 'blue' },
            ].map((act, i) => (
              <div key={i} className="act-item">
                <div className={`act-icon act--${act.color}`}>{act.icon}</div>
                <div className="act-lbl">{act.label}</div>
                <div className="act-val">{act.val}</div>
                <div className="act-trend">{act.trend}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="ms-section">
          <div className="ms-section-head">
            <span>QUICK ACTIONS</span>
          </div>
          <div className="ms-panel action-list">
            {[
              { icon: Icons.clients, label: 'New Client', sub: 'Add new client to system', color: 'blue' },
              { icon: Icons.whatsapp, label: 'Send Message', sub: 'Send WhatsApp message', color: 'green' },
              { icon: Icons.chat, label: 'AI Chat', sub: 'Chat with AI Assistant', color: 'purple' },
              { icon: Icons.upload, label: 'Upload File', sub: 'Upload documents or files', color: 'orange' },
            ].map((act, i) => (
              <div key={i} className="qa-list-item">
                <div className={`qa-list-icon qa-l--${act.color}`}>{act.icon}</div>
                <div className="qa-list-text">
                  <div className="qa-list-lbl">{act.label}</div>
                  <div className="qa-list-sub">{act.sub}</div>
                </div>
                <div className="ms-profile-chevron">{Icons.chevronRight}</div>
              </div>
            ))}
            <div className="qa-list-item" style={{borderBottom:'none'}}>
              <div className="qa-list-icon qa-l--purple">{Icons.moon}</div>
              <div className="qa-list-text">
                <div className="qa-list-lbl">Dark Mode</div>
                <div className="qa-list-sub">Enabled</div>
              </div>
              <div className="toggle-switch active"><div className="toggle-knob"/></div>
            </div>
          </div>
        </div>

        <div style={{height:'100px'}}/> {/* padding bottom */}
      </div>

    </div>
  )
}

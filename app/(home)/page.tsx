'use client'

import { useEffect, useRef, useState } from 'react'
import { Icons } from '../../components/Icons'

// ── Animated Counter ──
function useCounter(target: number, duration = 2000) {
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting && !started) setStarted(true) }, { threshold: 0.3 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [started])
  useEffect(() => {
    if (!started) return
    let s = 0; const step = target / (duration / 16)
    const iv = setInterval(() => {
      s += step; if (s >= target) { setCount(target); clearInterval(iv) } else setCount(Math.floor(s))
    }, 16)
    return () => clearInterval(iv)
  }, [started, target, duration])
  return { count, ref }
}

function StatCard({ icon, value, label, trend, color, sparkColor, sparkPath }: any) {
  const { count, ref } = useCounter(value)
  const display = value >= 1000 ? count.toLocaleString() : count
  return (
    <div ref={ref} className="dash-stat">
      <div className="dash-stat-top">
        <div className={`dash-stat-icon dai--${color}`}>{icon}</div>
        <span className="dash-stat-trend dash-stat-trend--up">{trend}</span>
      </div>
      <div className="dash-stat-value">{display}</div>
      <div className="dash-stat-label">{label}</div>
      <svg className="dash-stat-spark" viewBox="0 0 100 20" preserveAspectRatio="none">
        <defs><linearGradient id={`sg-${color}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={sparkColor} stopOpacity="0.3"/><stop offset="100%" stopColor={sparkColor} stopOpacity="0"/></linearGradient></defs>
        <path d={sparkPath + ' L100,20 L0,20 Z'} fill={`url(#sg-${color})`}/>
        <path d={sparkPath} fill="none" stroke={sparkColor} strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    </div>
  )
}

function ProgressBar({ label, value, color }: any) {
  const [w, setW] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setTimeout(() => setW(value), 300) }, { threshold: 0.3 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [value])
  return (
    <div ref={ref} className="dash-pb">
      <div className="dash-pb-head">
        <span className="dash-pb-lbl">{label}</span>
        <span className={`dash-pb-val dpv--${color}`}>{value}%</span>
      </div>
      <div className="dash-pb-track"><div className={`dash-pb-fill dpf--${color}`} style={{ width: `${w}%`, transition: 'width 1.4s cubic-bezier(.4,0,.2,1)' }}/></div>
    </div>
  )
}

export default function DashboardPage() {
  const stats = [
    { icon: Icons.clients, value: 1248, label: 'Total Clients', trend: '↑ 12.5%', color: 'blue', sparkColor: '#4F8CFF', sparkPath: 'M0,15 C15,8 25,12 40,5 C55,0 65,8 80,5 C90,3 95,2 100,1' },
    { icon: Icons.chat, value: 3562, label: 'AI Conversations', trend: '↑ 18.6%', color: 'purple', sparkColor: '#8B5CF6', sparkPath: 'M0,16 C12,6 22,12 35,8 C50,2 62,9 75,4 C85,1 92,0 100,0' },
    { icon: Icons.bolt, value: 12458, label: 'AI Requests Today', trend: '↑ 23.1%', color: 'cyan', sparkColor: '#00E5FF', sparkPath: 'M0,16 C10,6 18,2 30,4 C45,1 55,5 70,3 C80,8 88,5 100,1' },
    { icon: Icons.chart, value: 486, label: 'Voice Commands', trend: '↑ 15.2%', color: 'green', sparkColor: '#22C55E', sparkPath: 'M0,18 C10,12 20,16 35,4 C50,0 60,5 75,2 C85,1 92,2 100,2' },
  ]

  const systemStatus = [
    { label: 'AI Engine', value: 100, color: 'green' },
    { label: 'WhatsApp Sync', value: 100, color: 'cyan' },
    { label: 'Database', value: 98, color: 'purple' },
    { label: 'API Services', value: 100, color: 'orange' },
    { label: 'Voice System', value: 100, color: 'blue' },
  ]

  const orbitNodes = [
    { icon: Icons.whatsapp, label: 'WhatsApp', sub: 'Connected', cls: 'gn--green', style: { top: '10%', left: '5%' } },
    { icon: Icons.openai, label: 'OpenAI', sub: 'AI Models', cls: 'gn--purple', style: { top: '5%', right: '10%' } },
    { icon: Icons.github, label: 'GitHub', sub: 'Repository', cls: 'gn--white', style: { top: '40%', left: '-5%' } },
    { icon: Icons.react, label: 'React', sub: 'Frontend', cls: 'gn--cyan', style: { bottom: '15%', left: '8%' } },
    { icon: Icons.database, label: 'Database', sub: 'Secure', cls: 'gn--orange', style: { bottom: '10%', right: '5%' } },
    { icon: Icons.mic, label: 'Voice AI', sub: 'Commands', cls: 'gn--cyan', style: { bottom: '40%', right: '-2%' } },
    { icon: Icons.node, label: 'Node.js', sub: 'Backend', cls: 'gn--green', style: { top: '35%', right: '0%' } },
    { icon: Icons.vercel, label: 'Vercel', sub: 'Deploy', cls: 'gn--white', style: { bottom: '5%', left: '35%' } },
  ]

  const quickActions = [
    { icon: Icons.whatsapp, label: 'WhatsApp', color: 'green' },
    { icon: Icons.chat, label: 'AI Chat', color: 'purple' },
    { icon: Icons.mic, label: 'Voice AI', color: 'cyan' },
    { icon: Icons.globe, label: 'Web Builder', color: 'blue' },
    { icon: Icons.upload, label: 'Upload', color: 'orange' },
    { icon: Icons.shield, label: 'Approvals', color: 'green' },
  ]

  return (
    <div className="dash-container">
      {/* Greeting */}
      <div className="dash-greeting">
        <div className="dash-greeting-left">
          <div>
            <span className="dash-greeting-wave">👋</span>{' '}
            <span className="dash-greeting-title">Good Evening, <span className="gradient-text">Sandeep</span></span>
          </div>
          <div className="dash-greeting-sub">Welcome back to your AI Operating System</div>
        </div>
        <div className="dash-greeting-status">
          <div className="dash-greeting-status-dot" />
          All Systems Online · 99.9% Uptime
        </div>
      </div>

      {/* Stats */}
      <div className="dash-stats">
        {stats.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      {/* Main Grid */}
      <div className="dash-grid">
        <div className="dash-grid-left">
          {/* AI Core Section (Globe) */}
          <div className="dash-globe-section glass-panel ds-mobile-ai-core">
            <div className="dash-globe-kicker">AI POWERED · AUTOMATION DRIVEN</div>
            <h2 className="dash-globe-title">
              YOUR PERSONAL <span className="gradient-text">AI OPERATING SYSTEM</span>
            </h2>
            <p className="dash-globe-sub">
              Control WhatsApp, Clients, AI Agents, Voice Commands and Business Automation from one intelligent dashboard.
            </p>

            <div className="globe-wrap">
              <div className="globe-ring globe-ring-1" />
              <div className="globe-ring globe-ring-2" />
              <div className="globe-ring globe-ring-3" />

              {orbitNodes.map((node, i) => (
                <div key={i} className={`globe-node ${node.cls}`} style={node.style}>
                  <div className="globe-node-icon">{node.icon}</div>
                  <div className="globe-node-lbl">{node.label}</div>
                </div>
              ))}

              <div className="globe-core">
                <div className="globe-core-glow" />
                <div className="globe-core-sphere" />
                <div className="globe-core-text">
                  AI
                  <div className="globe-core-bars">
                    <div className="globe-core-bar" />
                    <div className="globe-core-bar" />
                    <div className="globe-core-bar" />
                    <div className="globe-core-bar" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="ds-mobile-section">
            <div className="section-title">QUICK ACTIONS</div>
            <div className="dash-actions dash-mobile-scroll">
              {quickActions.map((a, i) => (
                <div key={i} className="dash-action glass-card ds-mobile-quick-card">
                  <div className={`dash-action-icon dai--${a.color}`}>{a.icon}</div>
                  <div className="dash-action-lbl">{a.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="dash-grid-right">
          {/* AI Assistant */}
          <div className="dash-ai-panel glass-panel ds-mobile-ai-panel">
            <div className="dash-sys-title">{Icons.bolt} AI ASSISTANT</div>
            <div className="dash-ai-wave">
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="dash-ai-wave-bar" style={{ animationDelay: `${i * 0.05}s` }} />
              ))}
            </div>
            <div className="dash-ai-listen">Listening...</div>
            <div className="dash-ai-prompt">How can I assist you today?</div>
            <button className="dash-ai-speak-btn ds-mobile-speak-btn">
              {Icons.mic} Speak Now
            </button>
          </div>

          {/* System Status */}
          <div className="dash-sys-panel glass-panel ds-mobile-sys-panel">
            <div className="dash-sys-title">{Icons.bolt} SYSTEM STATUS</div>
            <div className="dash-sys-overall">
              <div className="dash-sys-dot" />
              <div>
                <div className="dash-sys-main">All Systems Operational</div>
                <div className="dash-sys-sub">99.9% Uptime</div>
              </div>
            </div>
            <div className="dash-sys-bars">
              {systemStatus.map((s, i) => <ProgressBar key={i} {...s} />)}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="dash-sys-panel glass-panel ds-mobile-activity">
            <div className="dash-sys-title">{Icons.activity} RECENT ACTIVITY</div>
            <div className="ds-mobile-timeline">
              {[
                { icon: Icons.whatsapp, text: '320 new WhatsApp messages', time: '2m ago', color: 'green' },
                { icon: Icons.chat, text: 'AI processed 842 conversations', time: '15m ago', color: 'purple' },
                { icon: Icons.upload, text: '12 files uploaded to knowledge', time: '1h ago', color: 'blue' },
                { icon: Icons.shield, text: '3 approvals pending review', time: '2h ago', color: 'orange' },
              ].map((item, i) => (
                <div key={i} className="ds-mobile-timeline-item">
                  <div className={`dash-action-icon dai--${item.color} ds-timeline-icon`}>{item.icon}</div>
                  <div className="ds-timeline-content">
                    <div className="ds-timeline-text">{item.text}</div>
                    <div className="ds-timeline-time">{item.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

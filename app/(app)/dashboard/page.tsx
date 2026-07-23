'use client'

import { useEffect, useState } from 'react'

const API = ''

interface Stats {
  overview: {
    total_clients: number
    new_leads: number
    active_projects: number
    pending_approvals: number
    msgs_today: number
    unread_notifications: number
  }
  ai_activity: {
    messages_sent: number
    messages_received: number
    total_today: number
  }
  recent_clients: Array<{
    id: number
    name: string
    company: string
    status: string
    platform: string
    requirement: string
    created_at: string
  }>
  platform_breakdown: Record<string, number>
}

const PLATFORM_ICONS: Record<string, string> = {
  whatsapp: '💬',
  email: '📧',
  linkedin: '💼',
  instagram: '📸',
  facebook: '👍',
  twitter: '🐦',
  direct: '🖥️',
}

const STATUS_COLORS: Record<string, string> = {
  lead: 'badge-lead',
  active: 'badge-active',
  inactive: 'badge-inactive',
  converted: 'badge-converted',
}

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Abhi'
  if (diffMins < 60) return `${diffMins} min pehle`
  if (diffHours < 24) return `${diffHours} ghante pehle`
  return `${diffDays} din pehle`
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetch_stats = async () => {
      try {
        const res = await fetch(`${API}/api/dashboard/stats`)
        if (!res.ok) throw new Error('Backend se connection nahi ho raha')
        const data = await res.json()
        setStats(data)
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    fetch_stats()
    const interval = setInterval(fetch_stats, 60000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <div>
            <div className="page-title">Dashboard</div>
            <div className="page-subtitle">Loading...</div>
          </div>
        </div>
        <div className="stat-grid">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="stat-card">
              <div className="skeleton" style={{ height: 40, width: 40, marginBottom: 14, borderRadius: 8 }} />
              <div className="skeleton" style={{ height: 30, width: '60%', marginBottom: 8 }} />
              <div className="skeleton" style={{ height: 14, width: '80%' }} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">⚠️</div>
        <div className="empty-state-title">Backend se connect nahi ho paya</div>
        <div className="empty-state-sub">{error}</div>
        <div style={{ marginTop: 16, fontSize: 13, color: 'var(--text-muted)' }}>
          Terminal mein run karein: <code style={{ background: 'var(--bg-elevated)', padding: '2px 8px', borderRadius: 4 }}>cd backend && python -m uvicorn main:app --reload</code>
        </div>
      </div>
    )
  }

  const ov = stats!.overview
  const ai = stats!.ai_activity

  return (
    <div className="animate-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">⚡ Dashboard</h1>
          <div className="page-subtitle">
            Namaste! Aaj ka overview — {new Date().toLocaleDateString('hi-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <a href="/clients/new" className="btn btn-primary">
            + Naya Client
          </a>
          {ov.pending_approvals > 0 && (
            <a href="/approvals" className="btn btn-ghost" style={{ position: 'relative' }}>
              <span>🔔</span>
              <span>{ov.pending_approvals} Pending</span>
              <span style={{
                position: 'absolute', top: -6, right: -6,
                background: 'var(--red)', color: 'white',
                width: 18, height: 18, borderRadius: '50%',
                fontSize: 11, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{ov.pending_approvals}</span>
            </a>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon purple">👥</div>
          <div className="stat-number">{ov.total_clients}</div>
          <div className="stat-label">Total Clients</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">🎯</div>
          <div className="stat-number">{ov.new_leads}</div>
          <div className="stat-label">New Leads</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon cyan">🚀</div>
          <div className="stat-number">{ov.active_projects}</div>
          <div className="stat-label">Active Projects</div>
        </div>
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => window.location.href = '/approvals'}>
          <div className="stat-icon red">✅</div>
          <div className="stat-number" style={{ color: ov.pending_approvals > 0 ? 'var(--orange)' : undefined }}>
            {ov.pending_approvals}
          </div>
          <div className="stat-label">Pending Approvals</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">💬</div>
          <div className="stat-number">{ai.messages_sent}</div>
          <div className="stat-label">AI Msgs Sent Today</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon pink">🔔</div>
          <div className="stat-number">{ov.unread_notifications}</div>
          <div className="stat-label">Unread Notifications</div>
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="dashboard-grid">
        {/* Recent Clients */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700 }}>Recent Clients</h2>
            <a href="/clients" className="btn btn-ghost btn-sm">Sab dekhein →</a>
          </div>

          {stats!.recent_clients.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">👥</div>
              <div className="empty-state-title">Koi client nahi mila</div>
              <div className="empty-state-sub">Upload karein ya manually add karein</div>
            </div>
          ) : (
            <div className="table-wrap" style={{ border: 'none' }}>
              <table>
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Platform</th>
                    <th>Status</th>
                    <th>Kab</th>
                  </tr>
                </thead>
                <tbody>
                  {stats!.recent_clients.map(c => (
                    <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => window.location.href = `/clients/${c.id}`}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.company || 'N/A'}</div>
                      </td>
                      <td>
                        <span className="platform-badge">
                          {PLATFORM_ICONS[c.platform] || '🌐'} {c.platform}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${STATUS_COLORS[c.status] || 'badge-lead'}`}>
                          {c.status}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                        {c.created_at ? timeAgo(c.created_at) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* AI Activity */}
          <div className="card">
            <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>🤖 AI Activity (Aaj)</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Messages Sent', value: ai.messages_sent, color: 'var(--purple)' },
                { label: 'Messages Received', value: ai.messages_received, color: 'var(--cyan)' },
                { label: 'Total Conversations', value: ai.total_today, color: 'var(--green)' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{item.label}</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: item.color }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Platform Breakdown */}
          <div className="card">
            <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>📊 Platforms</h2>
            {Object.keys(stats!.platform_breakdown).length === 0 ? (
              <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: 16 }}>Abhi koi data nahi</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {Object.entries(stats!.platform_breakdown).map(([platform, count]) => (
                  <div key={platform} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span>{PLATFORM_ICONS[platform] || '🌐'}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                        <span style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{platform}</span>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{count}</span>
                      </div>
                      <div style={{ height: 4, background: 'var(--bg-elevated)', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          width: `${Math.min((count / ov.total_clients) * 100, 100)}%`,
                          background: 'var(--grad-brand)',
                          borderRadius: 4,
                        }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>⚡ Quick Actions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <a href="/chat" className="btn btn-ghost btn-sm" style={{ justifyContent: 'flex-start' }}>
                💬 AI se baat karein
              </a>
              <a href="/upload" className="btn btn-ghost btn-sm" style={{ justifyContent: 'flex-start' }}>
                📂 CSV Upload karein
              </a>
              <a href="/approvals" className="btn btn-ghost btn-sm" style={{ justifyContent: 'flex-start' }}>
                ✅ Approvals dekhein
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

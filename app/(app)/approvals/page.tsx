'use client'
import { Icons } from '@/components/Icons'

const approvals = [
  { title: 'New Client Onboarding — Priya Patel', type: 'Client', priority: 'urgent', requester: 'AI Assistant', time: '10 min ago', description: 'AI requests approval to onboard a new Enterprise client with custom integration.' },
  { title: 'Website Deployment — Landing Page v3', type: 'Deployment', priority: 'high', requester: 'Web Builder', time: '1 hour ago', description: 'New landing page ready for production deployment on Vercel.' },
  { title: 'API Key Regeneration — Sarah Johnson', type: 'Security', priority: 'urgent', requester: 'System', time: '2 hours ago', description: 'Client\'s expired API key needs regeneration. Waiting for admin approval.' },
  { title: 'Bulk Message Campaign — Q3 Promotion', type: 'Marketing', priority: 'normal', requester: 'AI Chat', time: '5 hours ago', description: 'AI drafted promotional messages for 420 clients. Pending send approval.' },
  { title: 'Database Migration — Schema Update', type: 'System', priority: 'high', requester: 'System', time: '1 day ago', description: 'New schema migration adding conversation analytics tables.' },
]

const priorityStyles: Record<string, any> = {
  urgent: { bg: 'rgba(239,68,68,0.1)', color: 'var(--red)', border: 'rgba(239,68,68,0.2)' },
  high: { bg: 'rgba(245,158,11,0.1)', color: 'var(--orange)', border: 'rgba(245,158,11,0.2)' },
  normal: { bg: 'rgba(79,140,255,0.1)', color: 'var(--primary)', border: 'rgba(79,140,255,0.2)' },
}

export default function ApprovalsPage() {
  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Approvals</h1>
          <p className="page-subtitle">Review and manage pending actions</p>
        </div>
        <div className="page-header-actions">
          <button className="btn-outline">{Icons.check} Approve All</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Pending', value: '5', color: 'orange' },
          { label: 'Approved Today', value: '12', color: 'green' },
          { label: 'Rejected', value: '2', color: 'red' },
        ].map((s, i) => (
          <div key={i} className="glass-card-static" style={{ padding: 20 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontFamily: 'var(--font-head)', fontSize: 28, fontWeight: 700 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Approval Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {approvals.map((item, i) => {
          const ps = priorityStyles[item.priority]
          return (
            <div key={i} className="glass-card" style={{ padding: 20, display: 'flex', gap: 20, alignItems: 'flex-start' }}>
              {/* Priority indicator */}
              <div style={{ width: 4, minHeight: 60, borderRadius: 4, background: ps.color, boxShadow: `0 0 8px ${ps.border}`, marginTop: 4 }} />

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{item.title}</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: ps.bg, color: ps.color, border: `1px solid ${ps.border}`, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.priority}</span>
                      <span style={{ fontSize: 10, fontWeight: 500, padding: '2px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>{item.type}</span>
                    </div>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.time}</span>
                </div>

                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 14 }}>{item.description}</p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Requested by: <span style={{ color: 'var(--text)' }}>{item.requester}</span></span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button style={{ padding: '8px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600, background: 'rgba(34,197,94,0.1)', color: 'var(--green)', border: '1px solid rgba(34,197,94,0.2)', cursor: 'pointer', transition: 'all 0.2s' }}>✓ Approve</button>
                    <button style={{ padding: '8px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600, background: 'rgba(239,68,68,0.1)', color: 'var(--red)', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer', transition: 'all 0.2s' }}>✕ Reject</button>
                    <button className="btn-outline" style={{ padding: '8px 14px', fontSize: 12 }}>{Icons.edit}</button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

'use client'

import { Icons } from '@/components/Icons'

const projects = [
  { name: 'Main Business Website', url: 'sandeepclone.com', status: 'live', lastDeploy: '2 hours ago', framework: 'Next.js', visits: '12.4K' },
  { name: 'Client Portal', url: 'portal.sandeepclone.com', status: 'live', lastDeploy: '1 day ago', framework: 'React', visits: '3.2K' },
  { name: 'AI Landing Page', url: 'ai.sandeepclone.com', status: 'building', lastDeploy: 'In progress', framework: 'Next.js', visits: '—' },
  { name: 'WhatsApp Campaign Page', url: 'wa.sandeepclone.com', status: 'draft', lastDeploy: 'Not deployed', framework: 'Vite', visits: '—' },
]

const statusStyle: Record<string, any> = {
  live: { bg: 'rgba(34,197,94,0.1)', color: 'var(--green)', border: 'rgba(34,197,94,0.2)', dot: 'var(--green)' },
  building: { bg: 'rgba(245,158,11,0.1)', color: 'var(--orange)', border: 'rgba(245,158,11,0.2)', dot: 'var(--orange)' },
  draft: { bg: 'rgba(100,116,139,0.1)', color: 'var(--text-muted)', border: 'rgba(100,116,139,0.15)', dot: 'var(--text-muted)' },
}

export default function WebsiteBuilderPage() {
  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Website Builder</h1>
          <p className="page-subtitle">Build and deploy websites powered by AI</p>
        </div>
        <div className="page-header-actions">
          <button className="btn-outline">{Icons.github} Connect GitHub</button>
          <button className="btn-primary">{Icons.plus} New Project</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Live Projects', value: '2', color: 'green' },
          { label: 'Total Visits', value: '15.6K', color: 'blue' },
          { label: 'Deployments', value: '48', color: 'purple' },
          { label: 'Build Time Avg', value: '43s', color: 'cyan' },
        ].map((s, i) => (
          <div key={i} className="glass-card-static" style={{ padding: 20 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontFamily: 'var(--font-head)', fontSize: 24, fontWeight: 700 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Project Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 16 }}>
        {projects.map((proj, i) => {
          const ss = statusStyle[proj.status]
          return (
            <div key={i} className="glass-card">
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{proj.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {Icons.externalLink} <span>{proj.url}</span>
                  </div>
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 600, padding: '4px 10px', borderRadius: 100,
                  background: ss.bg, color: ss.color, border: `1px solid ${ss.border}`,
                  display: 'flex', alignItems: 'center', gap: 5, textTransform: 'uppercase', letterSpacing: '0.5px',
                }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: ss.dot, boxShadow: proj.status === 'live' ? `0 0 6px ${ss.dot}` : 'none' }} />
                  {proj.status}
                </span>
              </div>

              {/* Meta */}
              <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  <span>Framework: </span>
                  <span style={{ color: 'var(--text)', fontWeight: 500 }}>{proj.framework}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  <span>Visits: </span>
                  <span style={{ color: 'var(--text)', fontWeight: 500 }}>{proj.visits}</span>
                </div>
              </div>

              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
                Last deployed: <span style={{ color: 'var(--text)' }}>{proj.lastDeploy}</span>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn-outline" style={{ flex: 1, fontSize: 12, padding: '8px' }}>{Icons.eye} Preview</button>
                <button className="btn-outline" style={{ flex: 1, fontSize: 12, padding: '8px' }}>{Icons.edit} Edit</button>
                <button className="btn-primary" style={{ flex: 1, fontSize: 12, padding: '8px' }}>{Icons.send} Deploy</button>
              </div>
            </div>
          )
        })}

        {/* New Project Card */}
        <button style={{
          background: 'rgba(79,140,255,0.03)', border: '2px dashed var(--border-light)',
          borderRadius: 'var(--radius)', padding: 32, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 12, cursor: 'pointer',
          transition: 'all 0.3s', color: 'var(--text-muted)', minHeight: 200,
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(79,140,255,0.06)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary)'; (e.currentTarget as HTMLElement).style.color = 'var(--primary)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(79,140,255,0.03)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-light)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)' }}
        >
          <div style={{ width: 48, height: 48, borderRadius: 12, border: '2px dashed currentColor', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {Icons.plus}
          </div>
          <span style={{ fontSize: 14, fontWeight: 500 }}>Create New Project</span>
        </button>
      </div>
    </div>
  )
}

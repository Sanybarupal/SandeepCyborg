'use client'
import { useState } from 'react'
import { Icons } from '@/components/Icons'

const initialApprovals = [
  { id: 1, title: 'New Client Onboarding — Priya Patel', type: 'Client', priority: 'urgent', requester: 'AI Assistant', time: '10 min ago', description: 'AI requests approval to onboard a new Enterprise client with custom integration.' },
  { id: 2, title: 'Website Deployment — Landing Page v3', type: 'Deployment', priority: 'high', requester: 'Web Builder', time: '1 hour ago', description: 'New landing page ready for production deployment on Vercel.' },
  { id: 3, title: 'API Key Regeneration — Sarah Johnson', type: 'Security', priority: 'urgent', requester: 'System', time: '2 hours ago', description: 'Client\'s expired API key needs regeneration. Waiting for admin approval.' },
  { id: 4, title: 'Bulk Message Campaign — Q3 Promotion', type: 'Marketing', priority: 'normal', requester: 'AI Chat', time: '5 hours ago', description: 'AI drafted promotional messages for 420 clients. Pending send approval.' },
  { id: 5, title: 'Database Migration — Schema Update', type: 'System', priority: 'high', requester: 'System', time: '1 day ago', description: 'New schema migration adding conversation analytics tables.' },
]

const priorityStyles: Record<string, any> = {
  urgent: { bg: 'rgba(239,68,68,0.1)', color: 'var(--red)', border: 'rgba(239,68,68,0.2)' },
  high: { bg: 'rgba(245,158,11,0.1)', color: 'var(--orange)', border: 'rgba(245,158,11,0.2)' },
  normal: { bg: 'rgba(79,140,255,0.1)', color: 'var(--primary)', border: 'rgba(79,140,255,0.2)' },
}

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState(initialApprovals)
  const [actionHistory, setActionHistory] = useState<Array<{ id: number; action: string; title: string }>>([])
  const [toast, setToast] = useState<string | null>(null)

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  function handleApprove(id: number) {
    const item = approvals.find(a => a.id === id)
    if (!item) return
    setApprovals(prev => prev.filter(a => a.id !== id))
    setActionHistory(prev => [{ id, action: 'approved', title: item.title }, ...prev])
    showToast(`✓ Approved: ${item.title.split('—')[0].trim()}`)
  }

  function handleReject(id: number) {
    const item = approvals.find(a => a.id === id)
    if (!item) return
    setApprovals(prev => prev.filter(a => a.id !== id))
    setActionHistory(prev => [{ id, action: 'rejected', title: item.title }, ...prev])
    showToast(`✕ Rejected: ${item.title.split('—')[0].trim()}`)
  }

  function handleApproveAll() {
    if (approvals.length === 0) return
    setActionHistory(prev => [...approvals.map(a => ({ id: a.id, action: 'approved', title: a.title })), ...prev])
    showToast(`✓ Approved all ${approvals.length} pending items`)
    setApprovals([])
  }

  const approvedCount = actionHistory.filter(a => a.action === 'approved').length
  const rejectedCount = actionHistory.filter(a => a.action === 'rejected').length

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Approvals</h1>
          <p className="page-subtitle">Review and manage pending actions</p>
        </div>
        <div className="page-header-actions">
          <button className="btn-outline" onClick={handleApproveAll} style={{ opacity: approvals.length === 0 ? 0.4 : 1 }}>
            {Icons.check} Approve All
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Pending', value: approvals.length.toString(), color: 'orange' },
          { label: 'Approved Today', value: (12 + approvedCount).toString(), color: 'green' },
          { label: 'Rejected', value: (2 + rejectedCount).toString(), color: 'red' },
        ].map((s, i) => (
          <div key={i} className="glass-card-static" style={{ padding: 20 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontFamily: 'var(--font-head)', fontSize: 28, fontWeight: 700 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Approval Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {approvals.length === 0 && (
          <div className="glass-card" style={{ padding: 48, textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🎉</div>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>All Caught Up!</div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>No pending approvals. Great job staying on top of things!</div>
          </div>
        )}

        {approvals.map((item) => {
          const ps = priorityStyles[item.priority]
          return (
            <div key={item.id} className="glass-card" style={{ padding: 20, display: 'flex', gap: 20, alignItems: 'flex-start', transition: 'all 0.3s', animation: 'fadeIn 0.3s ease-out' }}>
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
                    <button
                      onClick={() => handleApprove(item.id)}
                      style={{
                        padding: '8px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                        background: 'rgba(34,197,94,0.1)', color: 'var(--green)',
                        border: '1px solid rgba(34,197,94,0.2)', cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(34,197,94,0.2)'; e.currentTarget.style.transform = 'scale(1.02)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(34,197,94,0.1)'; e.currentTarget.style.transform = 'scale(1)' }}
                    >✓ Approve</button>
                    <button
                      onClick={() => handleReject(item.id)}
                      style={{
                        padding: '8px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                        background: 'rgba(239,68,68,0.1)', color: 'var(--red)',
                        border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; e.currentTarget.style.transform = 'scale(1.02)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.transform = 'scale(1)' }}
                    >✕ Reject</button>
                    <button className="btn-outline" style={{ padding: '8px 14px', fontSize: 12 }}>{Icons.edit}</button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Action History */}
      {actionHistory.length > 0 && (
        <div style={{ marginTop: 28 }}>
          <div className="section-title">RECENT ACTIONS</div>
          <div className="glass-card-static" style={{ padding: 0 }}>
            {actionHistory.slice(0, 5).map((act, i) => (
              <div key={i} style={{
                padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12,
                borderBottom: i < Math.min(actionHistory.length, 5) - 1 ? '1px solid var(--border)' : 'none',
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12,
                  background: act.action === 'approved' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                  color: act.action === 'approved' ? 'var(--green)' : 'var(--red)',
                }}>
                  {act.action === 'approved' ? '✓' : '✕'}
                </div>
                <div style={{ flex: 1, fontSize: 13 }}>
                  <span style={{ fontWeight: 500 }}>{act.title.split('—')[0].trim()}</span>
                  <span style={{ color: 'var(--text-muted)' }}> — {act.action}</span>
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 4, textTransform: 'uppercase',
                  background: act.action === 'approved' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                  color: act.action === 'approved' ? 'var(--green)' : 'var(--red)',
                }}>{act.action}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 100, left: '50%', transform: 'translateX(-50%)', zIndex: 200,
          padding: '14px 24px', borderRadius: 12,
          background: 'rgba(12,17,35,0.95)', border: '1px solid var(--border-light)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.4)', backdropFilter: 'blur(16px)',
          fontSize: 14, fontWeight: 500, color: 'var(--text)',
          animation: 'toastSlideUp 0.3s ease-out', whiteSpace: 'nowrap',
        }}>
          {toast}
        </div>
      )}
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'

const API = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:8000' : '')

interface Approval {
  id: number
  type: string
  title: string
  description: string
  payload: Record<string, any>
  status: string
  priority: string
  client_id: number | null
  created_at: string
  reviewed_at?: string
}

const TYPE_ICONS: Record<string, string> = {
  send_message: '💬',
  bulk_message: '📣',
  import_clients: '👥',
  github_push: '🐙',
  vercel_deploy: '🚀',
  send_proposal: '📋',
  make_call: '📞',
  other: '⚡',
}

const PRIORITY_CLASS: Record<string, string> = {
  high: 'high-priority',
  normal: '',
  low: 'low-priority',
}

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr + 'Z')
  const now = new Date()
  const diffMins = Math.floor((now.getTime() - date.getTime()) / 60000)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} min ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours} hours ago`
  return `${Math.floor(diffHours / 24)} days ago`
}

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<Approval[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')
  const [actionMsg, setActionMsg] = useState('')
  const [processing, setProcessing] = useState<number | null>(null)
  
  // Edit modal state
  const [editingApproval, setEditingApproval] = useState<Approval | null>(null)
  const [editedPayloadText, setEditedPayloadText] = useState('')

  const fetchApprovals = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/approvals/?status=${filter}&limit=50`)
      const data = await res.json()
      setApprovals(data.approvals || [])
      setTotal(data.total || 0)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { fetchApprovals() }, [filter])

  const handleApprove = async (id: number, title: string, type: string) => {
    setProcessing(id)
    try {
      const res = await fetch(`${API}/api/approvals/${id}/approve`, { method: 'POST' })
      const data = await res.json()
      setActionMsg(data.message)

      if (type === 'import_clients') {
        await fetch(`${API}/api/upload/execute-import/${id}`, { method: 'POST' })
        setActionMsg(`${data.message} — Clients imported successfully!`)
      }

      fetchApprovals()
      setTimeout(() => setActionMsg(''), 5000)
    } catch { setActionMsg('Error! Try again.') }
    setProcessing(null)
  }

  const handleReject = async (id: number, title: string) => {
    const reason = prompt(`"${title}" — Reject reasons (optional):`) ?? ''
    setProcessing(id)
    try {
      const res = await fetch(`${API}/api/approvals/${id}/reject?reason=${encodeURIComponent(reason)}`, { method: 'POST' })
      const data = await res.json()
      setActionMsg(data.message)
      fetchApprovals()
      setTimeout(() => setActionMsg(''), 4000)
    } catch {}
    setProcessing(null)
  }

  const handleSendBack = async (id: number) => {
    const feedback = prompt("Enter feedback to send back to AI Agent:")
    if (feedback === null) return
    setProcessing(id)
    try {
      const res = await fetch(`${API}/api/approvals/${id}/send-back`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback })
      })
      const data = await res.json()
      setActionMsg(data.message)
      fetchApprovals()
      setTimeout(() => setActionMsg(''), 4000)
    } catch {}
    setProcessing(null)
  }

  const handleOpenEdit = (a: Approval) => {
    setEditingApproval(a)
    setEditedPayloadText(JSON.stringify(a.payload, null, 2))
  }

  const handleSaveEdit = async () => {
    if (!editingApproval) return
    try {
      const parsedPayload = JSON.parse(editedPayloadText)
      const res = await fetch(`${API}/api/approvals/${editingApproval.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload: parsedPayload })
      })
      if (res.ok) {
        setEditingApproval(null)
        setActionMsg("Approval updated successfully!")
        fetchApprovals()
        setTimeout(() => setActionMsg(''), 3000)
      }
    } catch (e) {
      alert("Invalid JSON format. Please verify and try again.")
    }
  }

  const pendingCount = approvals.filter(a => a.status === 'pending').length

  return (
    <div className="animate-in" style={{ padding: '40px 32px' }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 30 }}>
        <div>
          <h1 className="page-title">✅ Approval Center</h1>
          <div className="page-subtitle">
            {filter === 'pending' && pendingCount > 0
              ? `⚠️ ${pendingCount} items awaiting your authorization`
              : 'Approve or edit AI suggestions before execution'}
          </div>
        </div>

        {/* Filter Tabs */}
        <div style={{ display:'flex', gap:6, background:'var(--bg-elevated)', padding:4, borderRadius:10, border:'1px solid var(--border)' }}>
          {['pending', 'approved', 'rejected'].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              style={{
                padding:'6px 14px',
                borderRadius:7,
                fontSize:12,
                fontWeight:600,
                border:'none',
                cursor:'pointer',
                background: filter === s ? 'rgba(255,107,0,0.15)' : 'transparent',
                color: filter === s ? 'var(--purple-light)' : 'var(--text-muted)',
                textTransform:'capitalize',
                boxShadow: filter === s ? '0 1px 3px rgba(0,0,0,0.2)' : 'none'
              }}
            >{s}</button>
          ))}
        </div>
      </div>

      {/* Action Message */}
      {actionMsg && (
        <div style={{
          padding:'12px 16px', marginBottom:16, borderRadius:8, fontSize:14,
          background: 'rgba(16,185,129,0.1)',
          border: '1px solid rgba(16,185,129,0.2)',
          color: 'var(--green)',
        }}>
          {actionMsg}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height:120, borderRadius:12 }} />)}
        </div>
      ) : approvals.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">{filter === 'pending' ? '🎉' : '📭'}</div>
          <div className="empty-state-title">
            {filter === 'pending' ? 'All clear! No pending approvals.' : `No ${filter} requests found.`}
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 20 }}>
          {approvals.map(a => (
            <div key={a.id} className={`card ${PRIORITY_CLASS[a.priority] || ''}`} style={{ borderLeft: a.priority === 'high' ? '4px solid var(--red)' : '1px solid var(--border)', padding: 24 }}>
              <div style={{ display:'flex', alignItems:'flex-start', gap:16 }}>
                {/* Icon */}
                <div style={{
                  width:48, height:48, borderRadius:12,
                  background:'var(--bg-secondary)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:22, flexShrink:0,
                }}>
                  {TYPE_ICONS[a.type] || '⚡'}
                </div>

                {/* Content */}
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>{a.title}</div>
                    {a.priority === 'high' && (
                      <span style={{ background:'rgba(239,68,68,0.1)', color:'var(--red)', fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:20 }}>
                        URGENT
                      </span>
                    )}
                    <span className={`badge badge-${a.status}`} style={{ marginLeft:'auto' }}>{a.status}</span>
                  </div>

                  {a.description && (
                    <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 14, whiteSpace: 'pre-wrap' }}>
                      {a.description}
                    </div>
                  )}

                  {/* Payload Preview */}
                  {a.payload && Object.keys(a.payload).length > 0 && (
                    <div style={{
                      background:'var(--bg-secondary)', borderRadius:8, padding:'12px 16px',
                      marginBottom:16, fontSize:13, color:'var(--text-secondary)',
                      border:'1px solid var(--border)',
                    }}>
                      <div style={{ fontWeight: 600, marginBottom: 6, fontSize: 11, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Draft Content</div>
                      {Object.entries(a.payload).map(([k, v]) => (
                        <div key={k} style={{ display:'flex', gap:8, marginBottom:4 }}>
                          <span style={{ color:'var(--text-muted)', minWidth:100, fontWeight: 500 }}>{k}:</span>
                          <span style={{ whiteSpace: 'pre-wrap' }}>{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    {a.status === 'pending' ? (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          className="btn btn-primary"
                          onClick={() => handleApprove(a.id, a.title, a.type)}
                          disabled={processing === a.id}
                        >
                          Approve
                        </button>
                        <button
                          className="btn btn-ghost"
                          onClick={() => handleOpenEdit(a)}
                          disabled={processing === a.id}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="btn btn-ghost"
                          onClick={() => handleSendBack(a.id)}
                          disabled={processing === a.id}
                        >
                          🔄 Send Back
                        </button>
                        <button
                          className="btn btn-danger"
                          style={{ background: 'transparent', color: 'var(--red)', border: '1px solid var(--red)' }}
                          onClick={() => handleReject(a.id, a.title)}
                          disabled={processing === a.id}
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        Reviewed on {a.reviewed_at ? new Date(a.reviewed_at).toLocaleString() : ''}
                      </div>
                    )}
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {timeAgo(a.created_at)} • Type: <strong style={{ textTransform: 'capitalize' }}>{a.type.replace('_', ' ')}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingApproval && (
        <div style={{
          position:'fixed', inset:0, background:'rgba(0,0,0,0.7)',
          display:'flex', alignItems:'center', justifyContent:'center',
          zIndex:1000, padding:20,
        }}>
          <div className="card" style={{ width:'100%', maxWidth:540 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
              <h2 style={{ fontSize:18, fontWeight:700 }}>Edit AI Suggestion Payload</h2>
              <button onClick={() => setEditingApproval(null)} className="btn btn-ghost btn-sm">✕</button>
            </div>
            
            <div className="form-group">
              <label className="form-label">Payload JSON</label>
              <textarea 
                className="input" 
                value={editedPayloadText}
                onChange={e => setEditedPayloadText(e.target.value)}
                rows={10}
                style={{ fontFamily: 'monospace', fontSize: 13 }}
              />
            </div>

            <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:16 }}>
              <button className="btn btn-ghost" onClick={() => setEditingApproval(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveEdit}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

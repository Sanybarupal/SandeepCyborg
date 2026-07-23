'use client'

import { useRef, useState } from 'react'

const API = ''

interface UploadResult {
  message: string
  clients_found: number
  preview: Array<{ name?: string; phone?: string; company?: string; email?: string; requirement?: string }>
  approval_id: number
  status: string
}

export default function UploadPage() {
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<UploadResult | null>(null)
  const [error, setError] = useState('')
  const [approved, setApproved] = useState(false)
  const [approving, setApproving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    setError('')
    setResult(null)
    setApproved(false)
    setUploading(true)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch(`${API}/api/upload/clients`, {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Upload fail ho gaya')
      }

      const data: UploadResult = await res.json()
      setResult(data)
    } catch (e: any) {
      setError(e.message || 'Upload mein error aaya')
    }

    setUploading(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleApprove = async () => {
    if (!result?.approval_id) return
    setApproving(true)

    try {
      // First approve
      await fetch(`${API}/api/approvals/${result.approval_id}/approve`, { method: 'POST' })
      // Then execute import
      const res = await fetch(`${API}/api/upload/execute-import/${result.approval_id}`, { method: 'POST' })
      const data = await res.json()
      setApproved(true)
      setResult(prev => prev ? { ...prev, message: data.message } : prev)
    } catch {
      setError('Approval mein error aaya')
    }
    setApproving(false)
  }

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">📂 Client Upload</h1>
          <div className="page-subtitle">CSV, Excel ya PDF se clients bulk import karein</div>
        </div>
      </div>

      {/* Instructions */}
      <div className="card" style={{ marginBottom: 20, borderColor: 'rgba(34,211,238,0.15)' }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: 'var(--cyan)' }}>📋 File Format Guide</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>CSV / Excel Columns:</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.8 }}>
              • <code style={{ background:'var(--bg-elevated)', padding:'1px 5px', borderRadius:3 }}>Name</code> (zaroori)<br/>
              • <code style={{ background:'var(--bg-elevated)', padding:'1px 5px', borderRadius:3 }}>Phone</code><br/>
              • <code style={{ background:'var(--bg-elevated)', padding:'1px 5px', borderRadius:3 }}>Company</code><br/>
              • <code style={{ background:'var(--bg-elevated)', padding:'1px 5px', borderRadius:3 }}>Email</code><br/>
              • <code style={{ background:'var(--bg-elevated)', padding:'1px 5px', borderRadius:3 }}>Requirement</code>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>Supported Formats:</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 2 }}>
              • .csv (Excel se export kiya)<br/>
              • .xlsx (Excel 2007+)<br/>
              • .xls (Excel old format)<br/>
              • .pdf (text extract hoga)
            </div>
          </div>
        </div>
      </div>

      {/* Upload Zone */}
      <div
        className={`upload-zone ${dragging ? 'dragover' : ''}`}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".csv,.xlsx,.xls,.pdf"
          style={{ display: 'none' }}
          onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        {uploading ? (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
            <div className="upload-title">File upload ho rahi hai...</div>
            <div className="upload-sub">Clients extract ho rahe hain</div>
          </>
        ) : (
          <>
            <div className="upload-icon">📂</div>
            <div className="upload-title">File yahan drop karein</div>
            <div className="upload-sub">
              ya click karein select karne ke liye<br/>
              <span style={{ color: 'var(--purple-light)', marginTop: 8, display: 'block' }}>CSV • Excel • PDF</span>
            </div>
          </>
        )}
      </div>

      {/* Error */}
      {error && (
        <div style={{
          marginTop: 16, padding: '12px 16px',
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 8, color: 'var(--red)', fontSize: 14
        }}>
          ❌ {error}
        </div>
      )}

      {/* Result */}
      {result && !approved && (
        <div className="card" style={{ marginTop: 20, borderColor: 'rgba(245,158,11,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ fontSize: 32 }}>👥</div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
                {result.clients_found} Clients Mile!
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                {result.message}
              </div>
            </div>
          </div>

          {/* Preview Table */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Preview (Pehle 5 clients):
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Naam</th>
                    <th>Phone</th>
                    <th>Company</th>
                    <th>Email</th>
                    <th>Requirement</th>
                  </tr>
                </thead>
                <tbody>
                  {result.preview.map((c, i) => (
                    <tr key={i}>
                      <td>{c.name || '—'}</td>
                      <td style={{ fontSize: 12 }}>{c.phone || '—'}</td>
                      <td>{c.company || '—'}</td>
                      <td style={{ fontSize: 12 }}>{c.email || '—'}</td>
                      <td style={{ fontSize: 12, color: 'var(--text-secondary)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.requirement || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Approval Required */}
          <div style={{
            background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
            borderRadius: 10, padding: '16px 20px', marginBottom: 20,
          }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--orange)', marginBottom: 6 }}>
              ⚠️ Aapki Permission Chahiye
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              {result.clients_found} clients import hone waale hain. Kya aap approve karte hain?
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              className="btn btn-success"
              onClick={handleApprove}
              disabled={approving}
              style={{ fontSize: 15, padding: '12px 24px' }}
            >
              {approving ? '⏳ Import ho raha...' : `✅ Haan! ${result.clients_found} Clients Import Karein`}
            </button>
            <button
              className="btn btn-danger"
              onClick={() => setResult(null)}
              disabled={approving}
            >
              ❌ Cancel
            </button>
          </div>
        </div>
      )}

      {/* Success */}
      {approved && result && (
        <div className="card" style={{ marginTop: 20, borderColor: 'rgba(16,185,129,0.2)', textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--green)', marginBottom: 8 }}>Import Successful!</div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>{result.message}</div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <a href="/clients" className="btn btn-primary">👥 Clients Dekhein</a>
            <button className="btn btn-ghost" onClick={() => { setResult(null); setApproved(false) }}>
              📂 Aur Upload Karein
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

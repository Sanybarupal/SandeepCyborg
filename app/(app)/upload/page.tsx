'use client'
import { useState, useRef } from 'react'
import { Icons } from '@/components/Icons'

export default function UploadPage() {
  const [dragging, setDragging] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState([
    { name: 'company-handbook.pdf', size: '2.4 MB', status: 'processed', type: 'PDF', date: 'Jul 25, 2026' },
    { name: 'pricing-guide-v3.docx', size: '890 KB', status: 'processed', type: 'DOC', date: 'Jul 24, 2026' },
    { name: 'client-database.csv', size: '5.1 MB', status: 'processing', type: 'CSV', date: 'Jul 26, 2026' },
    { name: 'product-images.zip', size: '34 MB', status: 'processed', type: 'ZIP', date: 'Jul 22, 2026' },
    { name: 'api-documentation.md', size: '128 KB', status: 'processed', type: 'MD', date: 'Jul 21, 2026' },
  ])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  function getFileType(name: string): string {
    const ext = name.split('.').pop()?.toUpperCase() || 'FILE'
    return ext
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  function handleFileSelect(selectedFiles: FileList | null) {
    if (!selectedFiles || selectedFiles.length === 0) return
    const now = new Date()
    const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    
    const newFiles = Array.from(selectedFiles).map(file => ({
      name: file.name,
      size: formatFileSize(file.size),
      status: 'processing',
      type: getFileType(file.name),
      date: dateStr,
    }))

    setFiles(prev => [...newFiles, ...prev])
    showToast(`📄 ${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''} uploaded! Processing with AI...`)

    // Simulate processing completion
    setTimeout(() => {
      setFiles(prev => prev.map(f => f.status === 'processing' && newFiles.some(nf => nf.name === f.name) ? { ...f, status: 'processed' } : f))
      showToast(`✓ ${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''} processed and added to knowledge base!`)
    }, 3000)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }

  function handleDelete(name: string) {
    setFiles(prev => prev.filter(f => f.name !== name))
    showToast(`🗑 "${name}" removed from knowledge base`)
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Upload Center</h1>
          <p className="page-subtitle">Upload files to train your AI knowledge base</p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Total Files', value: files.length.toString(), color: 'blue' },
          { label: 'Knowledge Base', value: '1.2 GB', color: 'green' },
          { label: 'Processing', value: files.filter(f => f.status === 'processing').length.toString(), color: 'orange' },
          { label: 'AI Trained', value: '99.2%', color: 'purple' },
        ].map((s, i) => (
          <div key={i} className="glass-card-static" style={{ padding: 20 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontFamily: 'var(--font-head)', fontSize: 24, fontWeight: 700 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Upload Zone */}
      <div
        className="glass-card-static"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        style={{
          padding: 48, textAlign: 'center', marginBottom: 28, cursor: 'pointer',
          border: `2px dashed ${dragging ? 'var(--primary)' : 'var(--border-light)'}`,
          background: dragging ? 'rgba(79,140,255,0.05)' : 'var(--panel)',
          transition: 'all 0.3s',
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.doc,.csv,.txt,.md,.json,.zip"
          style={{ display: 'none' }}
          onChange={e => handleFileSelect(e.target.files)}
        />
        <div style={{ width: 64, height: 64, margin: '0 auto 16px', borderRadius: 16, background: dragging ? 'rgba(79,140,255,0.2)' : 'rgba(79,140,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', transition: 'all 0.3s', transform: dragging ? 'scale(1.1)' : 'scale(1)' }}>
          {Icons.upload}
        </div>
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
          {dragging ? 'Drop files here!' : 'Drop files here or click to upload'}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Supports PDF, DOCX, CSV, TXT, MD, JSON up to 50MB</div>
      </div>

      {/* File List */}
      <div className="glass-card-static" style={{ padding: 0 }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="section-title" style={{ margin: 0 }}>UPLOADED FILES</span>
          <button className="btn-outline" style={{ padding: '6px 14px', fontSize: 12 }}>{Icons.filter} Filter</button>
        </div>
        {files.map((file, i) => (
          <div key={`${file.name}-${i}`} style={{
            padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 16,
            borderBottom: i < files.length - 1 ? '1px solid var(--border)' : 'none',
            transition: 'background 0.15s', cursor: 'pointer',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(79,140,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontSize: 11, fontWeight: 700 }}>
              {file.type}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{file.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{file.size} · {file.date}</div>
            </div>
            <span style={{
              fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.5px',
              background: file.status === 'processed' ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)',
              color: file.status === 'processed' ? 'var(--green)' : 'var(--orange)',
              border: `1px solid ${file.status === 'processed' ? 'rgba(34,197,94,0.2)' : 'rgba(245,158,11,0.2)'}`,
            }}>{file.status}</span>
            <div style={{ display: 'flex', gap: 4 }}>
              <button className="ds-nav-btn" style={{ width: 32, height: 32 }}>{Icons.eye}</button>
              <button className="ds-nav-btn" style={{ width: 32, height: 32 }} onClick={(e) => { e.stopPropagation(); handleDelete(file.name) }}>{Icons.trash}</button>
            </div>
          </div>
        ))}
        {files.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
            No files uploaded yet. Drag and drop or click the upload zone above.
          </div>
        )}
      </div>

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

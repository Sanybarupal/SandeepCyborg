'use client'
import { useState, useRef } from 'react'
import { Icons } from '@/components/Icons'

const initialClients = [
  { name: 'Rahul Sharma', email: 'rahul@example.com', phone: '+91 98765 43210', status: 'active', tag: 'Premium', lastActive: '2 hours ago', messages: 42 },
  { name: 'Priya Patel', email: 'priya@example.com', phone: '+91 87654 32109', status: 'active', tag: 'Enterprise', lastActive: '5 min ago', messages: 128 },
  { name: 'Amit Kumar', email: 'amit@example.com', phone: '+91 76543 21098', status: 'inactive', tag: 'Starter', lastActive: '3 days ago', messages: 8 },
  { name: 'Sarah Johnson', email: 'sarah@corp.com', phone: '+1 555 1234', status: 'active', tag: 'Enterprise', lastActive: '1 hour ago', messages: 67 },
  { name: 'Mike Chen', email: 'mike@tech.io', phone: '+1 555 5678', status: 'active', tag: 'Premium', lastActive: '30 min ago', messages: 93 },
  { name: 'Lisa Wang', email: 'lisa@design.co', phone: '+86 138 0000', status: 'pending', tag: 'Trial', lastActive: '1 day ago', messages: 15 },
]

const lastMessages: Record<string, string> = {
  'Rahul Sharma': 'Hey Sandeep, are we still on for the meeting tomorrow?',
  'Priya Patel': 'The invoice has been sent. Please review it at your earliest.',
  'Amit Kumar': 'Thanks for the onboarding info. I\'ll get back to you soon.',
  'Sarah Johnson': 'My API integration is failing. Can you help with this?',
  'Mike Chen': 'Loved the new features! Looking forward to the next update.',
  'Lisa Wang': 'Is there a trial extension available? We need more time.',
}

export default function ClientsPage() {
  const [search, setSearch] = useState('')
  const [clients, setClients] = useState(initialClients)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showActionToast, setShowActionToast] = useState<{ message: string; type: string } | null>(null)
  const [newClient, setNewClient] = useState({ name: '', email: '', phone: '', tag: 'Starter' })
  const toastTimeout = useRef<NodeJS.Timeout | null>(null)

  const filtered = clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()))

  function showToast(message: string, type = 'success') {
    if (toastTimeout.current) clearTimeout(toastTimeout.current)
    setShowActionToast({ message, type })
    toastTimeout.current = setTimeout(() => setShowActionToast(null), 3000)
  }

  function handleAddClient() {
    if (!newClient.name.trim() || !newClient.email.trim()) return
    setClients(prev => [...prev, {
      name: newClient.name,
      email: newClient.email,
      phone: newClient.phone || '+91 00000 00000',
      status: 'active',
      tag: newClient.tag,
      lastActive: 'Just now',
      messages: 0,
    }])
    setNewClient({ name: '', email: '', phone: '', tag: 'Starter' })
    setShowAddModal(false)
    showToast(`✓ Client "${newClient.name}" added successfully!`)
  }

  function handleCall(name: string) {
    showToast(`📞 Initiating call to ${name}...`, 'info')
  }

  function handleWhatsApp(name: string) {
    showToast(`💬 Opening WhatsApp chat with ${name}...`, 'success')
  }

  function handleAiReply(name: string) {
    showToast(`🤖 AI is generating a reply for ${name}...`, 'ai')
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 16px', borderRadius: 10,
    background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-light)',
    color: 'var(--text)', fontSize: 14, outline: 'none', fontFamily: 'var(--font-body)',
    transition: 'border 0.2s, box-shadow 0.2s',
  }

  return (
    <div className="page-container ds-mobile-page">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Clients</h1>
          <p className="page-subtitle">Manage your client relationships</p>
        </div>
        <div className="page-header-actions ds-desktop-only">
          <button className="btn-outline">{Icons.filter} Filter</button>
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>{Icons.plus} Add Client</button>
        </div>
      </div>

      {/* Stats Row (Horizontal scroll on mobile) */}
      <div className="dash-stats dash-mobile-scroll" style={{ marginBottom: 28 }}>
        {[
          { label: 'Total Clients', value: clients.length.toLocaleString(), color: 'blue' },
          { label: 'Active', value: clients.filter(c => c.status === 'active').length.toLocaleString(), color: 'green' },
          { label: 'New This Week', value: '47', color: 'purple' },
          { label: 'Pending', value: clients.filter(c => c.status === 'pending').length.toLocaleString(), color: 'orange' },
        ].map((s, i) => (
          <div key={i} className="glass-card ds-mobile-stat-card" style={{ padding: 20, flex: 1, minWidth: 160 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontFamily: 'var(--font-head)', fontSize: 24, fontWeight: 700 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Search & Actions (Mobile) */}
      <div className="ds-mobile-search-row">
        <div className="glass-card" style={{ padding: '12px 16px', flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ color: 'var(--text-muted)' }}>{Icons.search}</div>
          <input
            type="text"
            placeholder="Search clients..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontSize: 14 }}
          />
        </div>
        <button className="btn-primary ds-mobile-add-btn" onClick={() => setShowAddModal(true)} style={{ padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {Icons.plus}
        </button>
      </div>

      {/* Client Cards Grid/List */}
      <div className="ds-mobile-client-list">
        {filtered.map((client, i) => (
          <div key={i} className="glass-card ds-client-card">
            <div className="ds-client-card-top">
              <div className="ds-client-avatar">
                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(client.name)}&background=4F8CFF&color=fff&size=50`} alt="" />
              </div>
              <div className="ds-client-info">
                <div className="ds-client-name">{client.name}</div>
                <div className="ds-client-tag">
                  <span style={{ color: 'var(--primary)' }}>{client.tag}</span> · {client.messages} msgs
                </div>
              </div>
              <span className={`ds-client-badge ds-badge-${client.status}`}>
                {client.status}
              </span>
            </div>
            
            <div className="ds-client-message-preview">
              <span className="ds-preview-lbl">Last Message:</span> &ldquo;{lastMessages[client.name] || 'No messages yet'}&rdquo;
            </div>
            
            <div className="ds-client-card-actions">
               <button className="ds-client-action-btn" onClick={() => handleCall(client.name)}>{Icons.phone} Call</button>
               <button className="ds-client-action-btn ds-client-action-btn-whatsapp" onClick={() => handleWhatsApp(client.name)}>{Icons.whatsapp} WhatsApp</button>
               <button className="ds-client-action-btn ds-client-action-btn-ai" onClick={() => handleAiReply(client.name)}>{Icons.bolt} AI Reply</button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="glass-card" style={{ padding: 40, textAlign: 'center', gridColumn: '1 / -1' }}>
            <div style={{ color: 'var(--text-muted)', marginBottom: 8, fontSize: 14 }}>No clients found matching &ldquo;{search}&rdquo;</div>
            <button className="btn-outline" onClick={() => setSearch('')}>Clear Search</button>
          </div>
        )}
      </div>

      {/* ── Add Client Modal ── */}
      {showAddModal && (
        <div className="ds-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowAddModal(false) }}>
          <div className="ds-modal">
            <div className="ds-modal-header">
              <div>
                <h3 style={{ fontFamily: 'var(--font-head)', fontSize: 18, fontWeight: 700 }}>Add New Client</h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Fill in the details to add a new client</p>
              </div>
              <button className="ds-modal-close" onClick={() => setShowAddModal(false)}>{Icons.close}</button>
            </div>

            <div className="ds-modal-body">
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 500 }}>Full Name *</label>
                <input
                  value={newClient.name}
                  onChange={e => setNewClient(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Rahul Sharma"
                  style={inputStyle}
                  onFocus={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = '0 0 0 3px var(--primary-glow)' }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.boxShadow = 'none' }}
                  autoFocus
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 500 }}>Email Address *</label>
                <input
                  value={newClient.email}
                  onChange={e => setNewClient(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="e.g. rahul@example.com"
                  type="email"
                  style={inputStyle}
                  onFocus={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = '0 0 0 3px var(--primary-glow)' }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.boxShadow = 'none' }}
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 500 }}>Phone Number</label>
                <input
                  value={newClient.phone}
                  onChange={e => setNewClient(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="e.g. +91 98765 43210"
                  type="tel"
                  style={inputStyle}
                  onFocus={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = '0 0 0 3px var(--primary-glow)' }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.boxShadow = 'none' }}
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 500 }}>Client Plan</label>
                <select
                  value={newClient.tag}
                  onChange={e => setNewClient(prev => ({ ...prev, tag: e.target.value }))}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  <option value="Trial">Trial</option>
                  <option value="Starter">Starter</option>
                  <option value="Premium">Premium</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </div>
            </div>

            <div className="ds-modal-footer">
              <button className="btn-outline" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button
                className="btn-primary"
                onClick={handleAddClient}
                style={{ opacity: (!newClient.name.trim() || !newClient.email.trim()) ? 0.5 : 1, pointerEvents: (!newClient.name.trim() || !newClient.email.trim()) ? 'none' : 'auto' }}
              >
                {Icons.plus} Add Client
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast Notification ── */}
      {showActionToast && (
        <div className="ds-toast" style={{
          position: 'fixed', bottom: 100, left: '50%', transform: 'translateX(-50%)', zIndex: 200,
          padding: '14px 24px', borderRadius: 12,
          background: showActionToast.type === 'ai' ? 'linear-gradient(135deg, rgba(139,92,246,0.9), rgba(79,140,255,0.9))' : 'rgba(12,17,35,0.95)',
          border: `1px solid ${showActionToast.type === 'ai' ? 'rgba(139,92,246,0.3)' : 'var(--border-light)'}`,
          boxShadow: '0 12px 40px rgba(0,0,0,0.4), 0 0 20px rgba(79,140,255,0.1)',
          backdropFilter: 'blur(16px)',
          fontSize: 14, fontWeight: 500, color: 'var(--text)',
          animation: 'toastSlideUp 0.3s ease-out',
          whiteSpace: 'nowrap',
        }}>
          {showActionToast.message}
        </div>
      )}
    </div>
  )
}

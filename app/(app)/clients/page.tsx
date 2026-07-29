'use client'
import { useState } from 'react'
import { Icons } from '@/components/Icons'

const mockClients = [
  { name: 'Rahul Sharma', email: 'rahul@example.com', status: 'active', tag: 'Premium', lastActive: '2 hours ago', messages: 42 },
  { name: 'Priya Patel', email: 'priya@example.com', status: 'active', tag: 'Enterprise', lastActive: '5 min ago', messages: 128 },
  { name: 'Amit Kumar', email: 'amit@example.com', status: 'inactive', tag: 'Starter', lastActive: '3 days ago', messages: 8 },
  { name: 'Sarah Johnson', email: 'sarah@corp.com', status: 'active', tag: 'Enterprise', lastActive: '1 hour ago', messages: 67 },
  { name: 'Mike Chen', email: 'mike@tech.io', status: 'active', tag: 'Premium', lastActive: '30 min ago', messages: 93 },
  { name: 'Lisa Wang', email: 'lisa@design.co', status: 'pending', tag: 'Trial', lastActive: '1 day ago', messages: 15 },
]

export default function ClientsPage() {
  const [search, setSearch] = useState('')
  const filtered = mockClients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="page-container ds-mobile-page">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Clients</h1>
          <p className="page-subtitle">Manage your client relationships</p>
        </div>
        <div className="page-header-actions ds-desktop-only">
          <button className="btn-outline">{Icons.filter} Filter</button>
          <button className="btn-primary">{Icons.plus} Add Client</button>
        </div>
      </div>

      {/* Stats Row (Horizontal scroll on mobile) */}
      <div className="dash-stats dash-mobile-scroll" style={{ marginBottom: 28 }}>
        {[
          { label: 'Total Clients', value: '1,248', color: 'blue' },
          { label: 'Active', value: '1,102', color: 'green' },
          { label: 'New This Week', value: '47', color: 'purple' },
          { label: 'Pending', value: '12', color: 'orange' },
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
        <button className="btn-primary ds-mobile-add-btn" style={{ padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
              <span className="ds-preview-lbl">Last Message:</span> "Hey Sandeep, are we still on for the meeting tomorrow?"
            </div>
            
            <div className="ds-client-card-actions">
               <button className="ds-client-action-btn">{Icons.phone} Call</button>
               <button className="ds-client-action-btn ds-client-action-btn-whatsapp">{Icons.whatsapp} WhatsApp</button>
               <button className="ds-client-action-btn ds-client-action-btn-ai">{Icons.bolt} AI Reply</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

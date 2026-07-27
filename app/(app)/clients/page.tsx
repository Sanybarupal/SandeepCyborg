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
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Clients</h1>
          <p className="page-subtitle">Manage your client relationships</p>
        </div>
        <div className="page-header-actions">
          <button className="btn-outline">{Icons.filter} Filter</button>
          <button className="btn-primary">{Icons.plus} Add Client</button>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Total Clients', value: '1,248', color: 'blue' },
          { label: 'Active', value: '1,102', color: 'green' },
          { label: 'New This Week', value: '47', color: 'purple' },
          { label: 'Pending', value: '12', color: 'orange' },
        ].map((s, i) => (
          <div key={i} className="glass-card-static" style={{ padding: 20 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontFamily: 'var(--font-head)', fontSize: 24, fontWeight: 700 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="glass-card-static" style={{ padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ color: 'var(--text-muted)' }}>{Icons.search}</div>
        <input
          type="text"
          placeholder="Search clients..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontSize: 14 }}
        />
      </div>

      {/* Client Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
        {filtered.map((client, i) => (
          <div key={i} className="glass-card" style={{ padding: 20, cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, overflow: 'hidden', border: '2px solid var(--border-light)' }}>
                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(client.name)}&background=4F8CFF&color=fff&size=44`} alt="" style={{ width: '100%', height: '100%' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{client.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{client.email}</div>
              </div>
              <span style={{
                fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 100,
                background: client.status === 'active' ? 'rgba(34,197,94,0.1)' : client.status === 'pending' ? 'rgba(245,158,11,0.1)' : 'rgba(100,116,139,0.1)',
                color: client.status === 'active' ? 'var(--green)' : client.status === 'pending' ? 'var(--orange)' : 'var(--text-muted)',
                border: `1px solid ${client.status === 'active' ? 'rgba(34,197,94,0.2)' : client.status === 'pending' ? 'rgba(245,158,11,0.2)' : 'rgba(100,116,139,0.15)'}`,
                textTransform: 'uppercase', letterSpacing: '0.5px',
              }}>
                {client.status}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}>
              <span>Tag: <span style={{ color: 'var(--primary)' }}>{client.tag}</span></span>
              <span>{client.messages} messages</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>Last active: {client.lastActive}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

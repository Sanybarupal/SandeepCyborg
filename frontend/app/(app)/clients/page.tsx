'use client'

import { useEffect, useState } from 'react'

const API = ''

interface Client {
  id: number
  name: string
  phone: string
  company: string
  email: string
  requirement: string
  budget: string
  timeline: string
  platform: string
  status: string
  tags: string
  created_at: string
}

const PLATFORM_ICONS: Record<string, string> = {
  whatsapp:'💬', email:'📧', linkedin:'💼', instagram:'📸',
  facebook:'👍', twitter:'🐦', direct:'🖥️',
}

const STATUS_LIST = ['', 'new_lead', 'interested', 'meeting_booked', 'proposal_sent', 'project_started', 'completed']
const PLATFORM_LIST = ['', 'whatsapp', 'email', 'linkedin', 'instagram', 'facebook', 'direct']

function WhatsAppSettingsToggle() {
  const [enabled, setEnabled] = useState(true)
  const [waStatus, setWaStatus] = useState<{ready: boolean, qr: string | null}>({ ready: false, qr: null })
  const [showQrModal, setShowQrModal] = useState(false)

  useEffect(() => {
    // Fetch AI setting
    fetch(`${API}/api/whatsapp/settings`)
      .then(res => res.json())
      .then(data => setEnabled(data.whatsapp_ai_enabled))
      .catch(() => {})

    // Fetch WA Node connection status
    const checkStatus = () => {
      fetch(`${API}/api/whatsapp/status`)
        .then(res => res.json())
        .then(data => {
          setWaStatus({ ready: data.ready, qr: data.qr })
        })
        .catch(() => {})
    }
    
    checkStatus()
    const interval = setInterval(checkStatus, 3000)
    return () => clearInterval(interval)
  }, [])

  const toggle = async () => {
    const newVal = !enabled
    setEnabled(newVal)
    await fetch(`${API}/api/whatsapp/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ whatsapp_ai_enabled: newVal })
    })
  }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg-elevated)', padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)' }}>
        {!waStatus.ready ? (
          <button 
            onClick={() => setShowQrModal(true)}
            className="btn btn-sm" 
            style={{ background: 'var(--orange)', color: '#fff', border: 'none', padding: '4px 10px', fontSize: 12, borderRadius: 6 }}
          >
            Connect WhatsApp
          </button>
        ) : (
          <span style={{ fontSize: 12, color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }}/>
            WA Connected
          </span>
        )}
        
        <div style={{ width: 1, height: 16, background: 'var(--border)' }} />

        <span style={{ fontSize: 13, fontWeight: 600 }}>AI Auto-Reply</span>
        <button 
          onClick={toggle}
          style={{
            width: 36, height: 20, borderRadius: 10, border: 'none', cursor: 'pointer',
            background: enabled ? 'var(--green)' : 'var(--text-muted)',
            position: 'relative', transition: 'all 0.2s'
          }}
        >
          <div style={{
            width: 16, height: 16, background: '#fff', borderRadius: '50%',
            position: 'absolute', top: 2, left: enabled ? 18 : 2, transition: 'all 0.2s'
          }} />
        </button>
      </div>

      {showQrModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: 20,
        }}>
          <div className="card" style={{ width: '100%', maxWidth: 400, textAlign: 'center', position: 'relative' }}>
            <button onClick={() => setShowQrModal(false)} className="btn btn-ghost btn-sm" style={{ position: 'absolute', top: 10, right: 10 }}>✕</button>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>Connect WhatsApp</h2>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20 }}>
              Apne phone mein WhatsApp open karein &rarr; Linked Devices &rarr; Link a device.
            </p>
            
            {waStatus.ready ? (
              <div style={{ padding: 40, color: 'var(--green)', fontSize: 16, fontWeight: 600 }}>
                ✅ WhatsApp successfully connected!
              </div>
            ) : waStatus.qr ? (
              <div style={{ background: '#fff', padding: 20, borderRadius: 8, display: 'inline-block', marginBottom: 20 }}>
                <img src={waStatus.qr} alt="WhatsApp QR Code" style={{ width: 256, height: 256 }} />
              </div>
            ) : (
              <div style={{ padding: 40, color: 'var(--text-muted)' }}>
                QR Code load ho raha hai...
                <br/>
                <span style={{ fontSize: 12 }}>(Ensure whatsapp-service is running)</span>
              </div>
            )}
            
            {waStatus.ready && (
              <button className="btn btn-primary" onClick={() => setShowQrModal(false)} style={{ width: '100%' }}>Done</button>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [platform, setPlatform] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name:'', phone:'', company:'', email:'', requirement:'', budget:'', timeline:'', platform:'whatsapp', status:'new_lead' })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  // New states for the split-pane view
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [chatMessages, setChatMessages] = useState<any[]>([])
  const [chatInput, setChatInput] = useState('')

  const fetchClients = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (status) params.set('status', status)
      if (platform) params.set('platform', platform)
      const res = await fetch(`${API}/api/clients/?${params}`)
      const data = await res.json()
      setClients(data.clients || [])
      setTotal(data.total || 0)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { fetchClients() }, [search, status, platform])

  const createClient = async () => {
    setSaving(true)
    try {
      const res = await fetch(`${API}/api/clients/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      setMessage(data.message || 'Client add ho gaya!')
      setShowModal(false)
      setForm({ name:'', phone:'', company:'', email:'', requirement:'', budget:'', timeline:'', platform:'whatsapp', status:'new_lead' })
      fetchClients()
      setTimeout(() => setMessage(''), 3000)
    } catch { setMessage('Error! Try again.') }
    setSaving(false)
  }

  const deleteClient = async (id: number, name: string) => {
    if (!confirm(`"${name}" ko delete karein?`)) return
    await fetch(`${API}/api/clients/${id}`, { method: 'DELETE' })
    fetchClients()
    if (selectedClient?.id === id) setSelectedClient(null)
  }

  const fetchChatHistory = async (clientId: number) => {
    try {
      // Assuming a generic chat history endpoint based on client ID. 
      // If it doesn't exist, we will create it in the backend later.
      const res = await fetch(`${API}/api/chat/history_by_client/${clientId}`)
      if (res.ok) {
        const data = await res.json()
        setChatMessages(data || [])
      } else {
        setChatMessages([]) // clear or handle 404
      }
    } catch (e) {
      setChatMessages([])
    }
  }

  const handleSelectClient = (c: Client) => {
    setSelectedClient(c)
    fetchChatHistory(c.id)
  }

  const updateClientInfo = async (field: keyof Client, value: string) => {
    if (!selectedClient) return
    const updatedClient = { ...selectedClient, [field]: value }
    setSelectedClient(updatedClient)
    // Optimistic update in list
    setClients(clients.map(c => c.id === selectedClient.id ? updatedClient : c))
    
    try {
      await fetch(`${API}/api/clients/${selectedClient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedClient)
      })
    } catch (e) {
      console.error("Failed to update client")
    }
  }

  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 48px)', overflow: 'hidden' }}>
      {/* Header */}
      <div className="page-header" style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)', flexShrink: 0 }}>
        <div>
          <h1 className="page-title">👥 Clients</h1>
          <div className="page-subtitle">{total} clients — manage conversations and details</div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <WhatsAppSettingsToggle />
          <a href="/upload" className="btn btn-ghost">📂 Upload CSV</a>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Naya Client</button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Column: Client List */}
        <div style={{ width: 320, minWidth: 280, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', background: 'var(--bg-surface)' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
            <input
              className="input"
              placeholder="🔍 Search clients..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', marginBottom: 10 }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <select className="input" value={status} onChange={e => setStatus(e.target.value)} style={{ flex: 1, padding: '6px 10px', fontSize: 13 }}>
                {STATUS_LIST.map(s => <option key={s} value={s}>{s || 'All Status'}</option>)}
              </select>
              <select className="input" value={platform} onChange={e => setPlatform(e.target.value)} style={{ flex: 1, padding: '6px 10px', fontSize: 13 }}>
                {PLATFORM_LIST.map(p => <option key={p} value={p}>{p ? `${PLATFORM_ICONS[p]} ${p}` : 'All Platforms'}</option>)}
              </select>
            </div>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: 16, color: 'var(--text-muted)' }}>Loading...</div>
            ) : clients.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>Koi client nahi mila</div>
            ) : (
              clients.map(c => (
                <div 
                  key={c.id} 
                  onClick={() => handleSelectClient(c)}
                  style={{ 
                    padding: '16px', 
                    borderBottom: '1px solid var(--border)', 
                    cursor: 'pointer',
                    background: selectedClient?.id === c.id ? 'var(--bg-elevated)' : 'transparent',
                    transition: 'background 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{c.name}</div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.created_at ? new Date(c.created_at).toLocaleDateString() : ''}</span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {c.requirement || 'No requirement specified'}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className={`badge badge-${c.status}`}>{c.status || 'new_lead'}</span>
                    <span className="platform-badge" style={{ padding: '2px 6px', fontSize: 11 }}>
                      {PLATFORM_ICONS[c.platform] || '🌐'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Middle Column: Chat Window */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-base)' }}>
          {selectedClient ? (
            <>
              {/* Chat Header */}
              <div style={{ padding: '12px 20px', background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--grad-brand)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 'bold', flexShrink: 0 }}>
                    {selectedClient.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedClient.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', display: 'inline-block', flexShrink: 0 }}/>
                      Active on {selectedClient.platform || 'Direct'}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                  <a href={`/chat?client=${selectedClient.id}`} className="btn btn-ghost btn-sm">🤖 AI Chat</a>
                  <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red)' }} onClick={() => deleteClient(selectedClient.id, selectedClient.name)}>🗑️</button>
                </div>
              </div>

              {/* Chat Messages */}
              <div style={{ flex: 1, padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
                {chatMessages.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 40 }}>
                    <div style={{ fontSize: 40, marginBottom: 10 }}>💬</div>
                    <div>No chat history found.</div>
                    <div style={{ fontSize: 13 }}>Send a message to start the conversation.</div>
                  </div>
                ) : (
                  chatMessages.map((msg, i) => (
                    <div key={i} style={{ 
                      alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                      background: msg.role === 'user' ? 'var(--purple)' : 'var(--bg-elevated)',
                      color: msg.role === 'user' ? '#fff' : 'inherit',
                      padding: '10px 16px',
                      borderRadius: '16px',
                      borderBottomRightRadius: msg.role === 'user' ? 4 : 16,
                      borderBottomLeftRadius: msg.role === 'ai' ? 4 : 16,
                      maxWidth: '75%',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                      border: msg.role !== 'user' ? '1px solid var(--border)' : 'none',
                    }}>
                      <div style={{ fontSize: 14 }}>{msg.content}</div>
                      {msg.created_at && (
                        <div style={{ fontSize: 10, marginTop: 4, opacity: 0.7, textAlign: 'right' }}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Chat Input */}
              <div style={{ padding: 16, background: 'var(--bg-surface)', borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn btn-ghost" style={{ padding: '0 12px' }} title="Send File">📎</button>
                  <input 
                    className="input" 
                    placeholder="Type a manual reply..." 
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    style={{ flex: 1, borderRadius: 20 }}
                  />
                  <button className="btn btn-primary" style={{ borderRadius: 20, padding: '0 20px' }}>Send</button>
                </div>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', flexDirection: 'column' }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>👋</div>
              <h2>Select a client</h2>
              <p>Choose a client from the left panel to view their chat.</p>
            </div>
          )}
        </div>

        {/* Right Column: Client Details */}
        {selectedClient && (
          <div style={{ width: 300, minWidth: 260, borderLeft: '1px solid var(--border)', background: 'var(--bg-surface)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: 16 }}>
              Client Information
            </div>
            <div style={{ padding: 24, flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
              
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Status</label>
                <select 
                  className="input" 
                  value={selectedClient.status} 
                  onChange={e => updateClientInfo('status', e.target.value)}
                  style={{ background: 'var(--bg-secondary)', border: 'none', fontWeight: 600 }}
                >
                  {STATUS_LIST.slice(1).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Name</label>
                <input 
                  className="input" 
                  value={selectedClient.name} 
                  onChange={e => updateClientInfo('name', e.target.value)}
                  style={{ padding: '8px 12px' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Phone</label>
                <input 
                  className="input" 
                  value={selectedClient.phone || ''} 
                  onChange={e => updateClientInfo('phone', e.target.value)}
                  placeholder="No phone"
                  style={{ padding: '8px 12px' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Email</label>
                <input 
                  className="input" 
                  value={selectedClient.email || ''} 
                  onChange={e => updateClientInfo('email', e.target.value)}
                  placeholder="No email"
                  style={{ padding: '8px 12px' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Requirement</label>
                <textarea 
                  className="input" 
                  value={selectedClient.requirement || ''} 
                  onChange={e => updateClientInfo('requirement', e.target.value)}
                  placeholder="Client's requirement..."
                  rows={4}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Budget</label>
                  <input 
                    className="input" 
                    value={selectedClient.budget || ''} 
                    onChange={e => updateClientInfo('budget', e.target.value)}
                    placeholder="e.g. 50k"
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Timeline</label>
                  <input 
                    className="input" 
                    value={selectedClient.timeline || ''} 
                    onChange={e => updateClientInfo('timeline', e.target.value)}
                    placeholder="e.g. 1 month"
                  />
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* Add Client Modal */}
      {showModal && (
        <div style={{
          position:'fixed', inset:0, background:'rgba(0,0,0,0.7)',
          display:'flex', alignItems:'center', justifyContent:'center',
          zIndex:1000, padding:20,
        }}>
          <div className="card" style={{ width:'100%', maxWidth:480, maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
              <h2 style={{ fontSize:18, fontWeight:700 }}>Naya Client Add Karein</h2>
              <button onClick={() => setShowModal(false)} className="btn btn-ghost btn-sm">✕</button>
            </div>

            <div className="form-group">
              <label className="form-label">Naam *</label>
              <input className="input" placeholder="Rahul Sharma" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="input" placeholder="+91 9876543210" value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))} />
            </div>
            <div className="form-group">
              <label className="form-label">Company</label>
              <input className="input" placeholder="Company naam" value={form.company} onChange={e => setForm(p => ({...p, company: e.target.value}))} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="input" type="email" placeholder="rahul@example.com" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div className="form-group">
                <label className="form-label">Platform</label>
                <select className="input" value={form.platform} onChange={e => setForm(p => ({...p, platform: e.target.value}))}>
                  {PLATFORM_LIST.slice(1).map(p => <option key={p} value={p}>{PLATFORM_ICONS[p]} {p}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="input" value={form.status} onChange={e => setForm(p => ({...p, status: e.target.value}))}>
                  {STATUS_LIST.slice(1).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Requirement</label>
              <textarea className="input" placeholder="Kya chahiye client ko?" value={form.requirement} onChange={e => setForm(p => ({...p, requirement: e.target.value}))} />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div className="form-group">
                <label className="form-label">Budget</label>
                <input className="input" placeholder="e.g. 50k" value={form.budget} onChange={e => setForm(p => ({...p, budget: e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">Timeline</label>
                <input className="input" placeholder="e.g. 1 month" value={form.timeline} onChange={e => setForm(p => ({...p, timeline: e.target.value}))} />
              </div>
            </div>

            <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:8 }}>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={createClient} disabled={!form.name || saving}>
                {saving ? 'Add ho raha...' : 'Add Client'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

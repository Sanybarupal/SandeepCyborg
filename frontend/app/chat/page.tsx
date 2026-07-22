'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

const API = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:8000' : '')

interface Message {
  id?: number
  role: 'user' | 'ai' | 'system'
  content: string
  created_at?: string
}

interface Session {
  session_id: string
  client_id: number | null
  client_name: string | null
  platform: string
  last_message: string
  last_active: string
}

interface ClientDetails {
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
  ai_paused: boolean
}

function ChatInner() {
  const searchParams = useSearchParams()
  const urlClientId = searchParams.get('client')

  const [messages, setMessages] = useState<Message[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null)
  const [clientDetails, setClientDetails] = useState<ClientDetails | null>(null)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [aiMode, setAiMode] = useState('mock')
  const [aiStatus, setAiStatus] = useState<'idle' | 'processing'>('idle')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchSessions()
    fetchAiMode()
  }, [])

  useEffect(() => {
    if (urlClientId) {
      const cid = parseInt(urlClientId)
      setSelectedClientId(cid)
      fetchClientDetails(cid)
      // Attempt to find a session for this client
      const foundSession = sessions.find(s => s.client_id === cid)
      if (foundSession) {
        loadSession(foundSession.session_id, cid)
      } else {
        setSessionId(null)
        setMessages([{
          role: 'ai',
          content: 'Sandeep AI is ready. Start typing to initiate conversation with this client.'
        }])
      }
    }
  }, [urlClientId, sessions])

  const fetchAiMode = async () => {
    try {
      const res = await fetch(`${API}/`)
      const data = await res.json()
      setAiMode(data.ai_mode || 'mock')
    } catch {}
  }

  const fetchSessions = async () => {
    try {
      const res = await fetch(`${API}/api/chat/sessions`)
      const data = await res.json()
      setSessions(data || [])
    } catch {}
  }

  const fetchClientDetails = async (cid: number) => {
    try {
      const res = await fetch(`${API}/api/clients/${cid}`)
      if (res.ok) {
        const data = await res.json()
        setClientDetails(data)
      }
    } catch {}
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(scrollToBottom, [messages])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || sending) return

    setInput('')
    setSending(true)
    setAiStatus('processing')

    // Add user message instantly
    setMessages(prev => [...prev, { role: 'user', content: text }])
    setMessages(prev => [...prev, { role: 'ai', content: '__typing__' }])

    try {
      const res = await fetch(`${API}/api/chat/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          client_id: selectedClientId,
          session_id: sessionId,
          platform: 'direct',
        }),
      })
      const data = await res.json()

      // Remove typing indicator and add real response
      setMessages(prev => [
        ...prev.filter(m => m.content !== '__typing__'),
        { role: 'ai', content: data.response }
      ])

      if (data.session_id && !sessionId) {
        setSessionId(data.session_id)
      }
      setAiMode(data.mode || 'mock')
      fetchSessions()
    } catch {
      setMessages(prev => [
        ...prev.filter(m => m.content !== '__typing__'),
        { role: 'ai', content: 'Sorry, backend connection failed. Ensure FastAPI is running.' }
      ])
    }

    setSending(false)
    setAiStatus('idle')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const loadSession = async (sid: string, cid: number | null) => {
    setSessionId(sid)
    setSelectedClientId(cid)
    if (cid) {
      fetchClientDetails(cid)
    } else {
      setClientDetails(null)
    }

    try {
      const res = await fetch(`${API}/api/chat/history/${sid}`)
      const data = await res.json()
      const msgs = data.map((m: any) => ({
        id: m.id,
        role: m.role as 'user' | 'ai' | 'system',
        content: m.content,
        created_at: m.created_at,
      }))
      setMessages(msgs)
    } catch {}
  }

  const toggleAiPause = async (pause: boolean) => {
    if (!selectedClientId || !clientDetails) return
    try {
      const res = await fetch(`${API}/api/clients/${selectedClientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ai_paused: pause })
      })
      if (res.ok) {
        setClientDetails({ ...clientDetails, ai_paused: pause })
        setMessages(prev => [...prev, {
          role: 'system',
          content: `AI Auto-reply has been ${pause ? 'PAUSED' : 'RESUMED'} for this client.`
        }])
      }
    } catch {}
  }

  const handleRequestApproval = async () => {
    if (!selectedClientId) return
    try {
      const res = await fetch(`${API}/api/clients/${selectedClientId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: "Requesting approval for budget & timeline proposed by AI." })
      })
      if (res.ok) {
        alert("Approval request sent successfully!")
      }
    } catch {}
  }

  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 48px)', overflow: 'hidden' }}>
      <div className="page-header" style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)', flexShrink: 0 }}>
        <div>
          <h1 className="page-title">💬 AI Chat</h1>
          <div className="page-subtitle">
            Monitor and manage AI interactions with clients
            <span className={`ai-mode-badge ${aiMode === 'gpt4' ? 'ai-mode-gpt4' : 'ai-mode-mock'}`} style={{ marginLeft: 10 }}>
              {aiMode === 'gpt4' ? '🟢 GPT-4' : '🟡 Mock Mode'}
            </span>
          </div>
        </div>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => { 
            setMessages([{ role: 'ai', content: 'Namaste! Nayi chat shuru karein.' }]); 
            setSessionId(null);
            setSelectedClientId(null);
            setClientDetails(null);
          }}
        >
          + Nayi Chat
        </button>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Column: Recent AI Conversations */}
        <div style={{ width: 300, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', background: 'var(--bg-surface)' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>
            Recent Conversations
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {sessions.length === 0 ? (
              <div style={{ padding: 20, fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>
                Abhi koi active chat nahi hai.
              </div>
            ) : (
              sessions.map(s => (
                <div
                  key={s.session_id}
                  className={`chat-session-item ${sessionId === s.session_id ? 'active' : ''}`}
                  onClick={() => loadSession(s.session_id, s.client_id)}
                  style={{
                    padding: '16px',
                    borderBottom: '1px solid var(--border)',
                    cursor: 'pointer',
                    background: sessionId === s.session_id ? 'var(--bg-elevated)' : 'transparent',
                    transition: 'background 0.2s'
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{s.client_name || 'AI Sandbox'}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {s.last_message || 'No messages yet'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Middle Column: Active Chat Feed */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-base)' }}>
          {/* Chat Header */}
          <div style={{ padding: '12px 20px', background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--grad-brand)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 'bold', flexShrink: 0 }}>
                {clientDetails ? clientDetails.name.charAt(0).toUpperCase() : '🤖'}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{clientDetails ? clientDetails.name : 'AI operating System Sandbox'}</div>
                <div style={{ fontSize: 12, color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }}/>
                  {aiStatus === 'processing' ? 'AI is replying...' : 'AI Active (Online)'}
                </div>
              </div>
            </div>
            {clientDetails && (
              <span className={`badge ${clientDetails.ai_paused ? 'badge-completed' : 'badge-interested'}`}>
                {clientDetails.ai_paused ? '⏸️ AI Paused' : '🤖 AI Autopilot'}
              </span>
            )}
          </div>

          {/* Messages Feed */}
          <div style={{ flex: 1, padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {messages.map((msg, i) => {
              if (msg.role === 'system') {
                return (
                  <div key={i} style={{ alignSelf: 'center', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', padding: '6px 16px', borderRadius: 20, fontSize: 12, fontWeight: 500 }}>
                    {msg.content}
                  </div>
                )
              }
              return (
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
                  border: msg.role !== 'user' ? '1px solid var(--border)' : 'none'
                }}>
                  {msg.content === '__typing__' ? (
                    <div className="typing-dots">
                      <span/><span/><span/>
                    </div>
                  ) : (
                    <div style={{ fontSize: 14 }}>{msg.content}</div>
                  )}
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div style={{ padding: 16, background: 'var(--bg-surface)', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <input 
                className="input" 
                placeholder={clientDetails?.ai_paused ? "AI is paused. Send manual message..." : "Type here to chat with the AI Sandbox..."}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{ flex: 1, borderRadius: 20 }}
              />
              <button 
                className="btn btn-primary" 
                onClick={sendMessage}
                style={{ borderRadius: 20, padding: '0 20px' }}
                disabled={!input.trim() || sending}
              >
                Send
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: AI Controls & Client Info */}
        {clientDetails && (
          <div style={{ width: 300, borderLeft: '1px solid var(--border)', background: 'var(--bg-surface)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: 16 }}>
              AI Controls & Client Info
            </div>
            <div style={{ padding: 24, flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
              
              <div>
                <h4 style={{ fontSize: 13, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>AI Actions</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {clientDetails.ai_paused ? (
                    <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => toggleAiPause(false)}>
                      ▶️ Resume AI Agent
                    </button>
                  ) : (
                    <button className="btn btn-ghost" style={{ width: '100%', borderColor: 'var(--red)', color: 'var(--red)' }} onClick={() => toggleAiPause(true)}>
                      ⏸️ Pause AI / Takeover
                    </button>
                  )}
                  
                  <button className="btn btn-ghost" style={{ width: '100%' }} onClick={handleRequestApproval}>
                    📝 Request Approval
                  </button>
                  <button className="btn btn-ghost" style={{ width: '100%' }} onClick={() => alert("Proposal generated successfully!")}>
                    💼 Generate Proposal
                  </button>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
                <h4 style={{ fontSize: 13, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>Client Context</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14 }}>
                  <div>
                    <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: 12 }}>Requirement</span>
                    <strong style={{ fontWeight: 500 }}>{clientDetails.requirement || 'Not specified'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: 12 }}>Budget</span>
                    <strong style={{ fontWeight: 500 }}>{clientDetails.budget ? `₹${clientDetails.budget}` : 'Not specified'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: 12 }}>Timeline</span>
                    <strong style={{ fontWeight: 500 }}>{clientDetails.timeline || 'Not specified'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: 12 }}>Phone</span>
                    <strong>{clientDetails.phone || 'No phone'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: 12 }}>Email</span>
                    <strong>{clientDetails.email || 'No email'}</strong>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div style={{ color: 'var(--text-muted)', padding: 40 }}>Loading...</div>}>
      <ChatInner />
    </Suspense>
  )
}

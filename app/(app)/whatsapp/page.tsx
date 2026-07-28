'use client'

import { useState } from 'react'
import { Icons } from '@/components/Icons'

const chats = [
  { name: 'Rahul Sharma', preview: 'Thanks for the update! When can we schedule...', time: '2m', unread: 3, status: 'online' },
  { name: 'Priya Patel', preview: 'The invoice has been sent to your email.', time: '15m', unread: 0, status: 'online' },
  { name: 'Tech Solutions Ltd', preview: 'We need the API documentation by Friday.', time: '1h', unread: 1, status: 'offline' },
  { name: 'Sarah Johnson', preview: 'My integration still isn\'t working. Can you help?', time: '2h', unread: 5, status: 'online' },
  { name: 'Mike Chen', preview: 'Loved the new features! Looking forward to...', time: '5h', unread: 0, status: 'offline' },
]

const messages = [
  { from: 'client', text: 'Hi! I wanted to ask about the Enterprise plan pricing.', time: '10:30 AM' },
  { from: 'ai', text: 'Hello Rahul! The Enterprise plan starts at ₹49,999/month and includes unlimited clients, WhatsApp automation, AI Chat, Voice AI, and dedicated support. Would you like a detailed breakdown?', time: '10:30 AM' },
  { from: 'client', text: 'Yes please! Also, can it handle 500+ clients?', time: '10:32 AM' },
  { from: 'ai', text: 'Absolutely! Our Enterprise plan handles unlimited clients with no performance limitations. We currently manage 1,200+ clients for other Enterprise customers. I can schedule a demo call for you — what time works best?', time: '10:32 AM' },
]

export default function WhatsAppPage() {
  const [activeChat, setActiveChat] = useState(0)
  const [msg, setMsg] = useState('')

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - var(--navbar-h))', overflow: 'hidden' }}>
      {/* Chat List */}
      <div style={{ width: 320, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', background: 'rgba(8,12,28,0.5)' }}>
        <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 18, fontWeight: 700 }}>WhatsApp</h2>
            <div style={{ fontSize: 10, color: 'var(--green)', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', padding: '3px 10px', borderRadius: 100, display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--green)' }} /> Connected
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px' }}>
            <div style={{ color: 'var(--text-muted)' }}>{Icons.search}</div>
            <input placeholder="Search conversations..." style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontSize: 13 }} />
          </div>
        </div>

        <div style={{ flex: 1, overflow: 'auto' }}>
          {chats.map((chat, i) => (
            <div key={i} onClick={() => setActiveChat(i)} style={{
              padding: '14px 16px', cursor: 'pointer', borderBottom: '1px solid var(--border)',
              background: activeChat === i ? 'rgba(79,140,255,0.06)' : 'transparent',
              borderLeft: activeChat === i ? '2px solid var(--primary)' : '2px solid transparent',
              transition: 'all 0.15s', display: 'flex', gap: 12, alignItems: 'center',
            }}>
              <div style={{ position: 'relative' }}>
                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(chat.name)}&background=22C55E&color=fff&size=40`} style={{ width: 40, height: 40, borderRadius: '50%' }} alt="" />
                {chat.status === 'online' && <div style={{ position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, background: 'var(--green)', borderRadius: '50%', border: '2px solid var(--bg)' }} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{chat.name}</span>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{chat.time}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{chat.preview}</div>
              </div>
              {chat.unread > 0 && <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--green)', color: 'white', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{chat.unread}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '14px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(chats[activeChat].name)}&background=22C55E&color=fff&size=40`} style={{ width: 40, height: 40, borderRadius: '50%' }} alt="" />
            <div>
              <div style={{ fontWeight: 600 }}>{chats[activeChat].name}</div>
              <div style={{ fontSize: 12, color: 'var(--green)' }}>● Online</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-outline" style={{ fontSize: 12, padding: '8px 14px' }}>{Icons.activity} AI Reply</button>
          </div>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: m.from === 'client' ? 'flex-start' : 'flex-end', maxWidth: '70%', alignSelf: m.from === 'client' ? 'flex-start' : 'flex-end' }}>
              <div>
                <div style={{
                  background: m.from === 'client' ? 'var(--panel)' : 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(34,197,94,0.1))',
                  border: `1px solid ${m.from === 'client' ? 'var(--border)' : 'rgba(34,197,94,0.2)'}`,
                  borderRadius: 14, padding: '12px 16px', fontSize: 14, lineHeight: 1.5,
                }}>{m.text}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4, textAlign: m.from === 'client' ? 'left' : 'right' }}>{m.time}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', gap: 12, background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 14, padding: '10px 16px', alignItems: 'center' }}>
            <input value={msg} onChange={e => setMsg(e.target.value)} placeholder="Type a message..." style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontSize: 14 }} />
            <button style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, var(--green), #16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>{Icons.send}</button>
          </div>
        </div>
      </div>

      {/* Client Details Panel */}
      <div style={{ width: 280, borderLeft: '1px solid var(--border)', padding: 20, background: 'rgba(8,12,28,0.4)', display: 'flex', flexDirection: 'column', gap: 20, overflow: 'auto' }}>
        <div style={{ textAlign: 'center', paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
          <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(chats[activeChat].name)}&background=22C55E&color=fff&size=64`} style={{ width: 64, height: 64, borderRadius: '50%', marginBottom: 10 }} alt="" />
          <div style={{ fontWeight: 600 }}>{chats[activeChat].name}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Enterprise Client</div>
        </div>
        <div>
          <div className="section-title">AI SUGGESTIONS</div>
          {['Send pricing proposal', 'Schedule demo call', 'Share case study'].map((s, i) => (
            <button key={i} style={{ width: '100%', textAlign: 'left', padding: '10px 12px', marginBottom: 8, borderRadius: 8, background: 'rgba(79,140,255,0.06)', border: '1px solid rgba(79,140,255,0.12)', color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer' }}>
              → {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

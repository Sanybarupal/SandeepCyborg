'use client'
import { useState } from 'react'
import { Icons } from '@/components/Icons'

const conversations = [
  { name: 'System Assistant', preview: 'I\'ve processed 128 new documents for your knowledge base.', time: '2m', unread: 3, model: 'GPT-4' },
  { name: 'Client Support Bot', preview: 'Rahul Sharma asked about pricing for enterprise plan.', time: '15m', unread: 1, model: 'Claude' },
  { name: 'Content Writer', preview: 'Draft for the landing page copy is ready for review.', time: '1h', unread: 0, model: 'GPT-4' },
  { name: 'Code Assistant', preview: 'Fixed the API endpoint issue. PR ready for review.', time: '3h', unread: 0, model: 'GPT-4' },
]

const messages = [
  { role: 'user', text: 'Summarize all client conversations from today and highlight any urgent issues.' },
  { role: 'ai', text: 'Here\'s your daily summary:\n\n• **42 new conversations** across all channels\n• **3 urgent issues** flagged for attention:\n  1. Rahul Sharma — billing dispute (Enterprise)\n  2. Sarah Johnson — integration failing (API key expired)\n  3. Mike Chen — requesting custom AI model\n\n• **128 documents** processed into knowledge base\n• **Average response time**: 1.2 seconds\n\nWould you like me to draft responses for the urgent issues?' },
  { role: 'user', text: 'Yes, draft a response for Sarah Johnson\'s issue.' },
  { role: 'ai', text: 'Draft response for Sarah Johnson:\n\n---\n\nHi Sarah,\n\nThank you for reaching out about the integration issue. I\'ve identified that your API key expired on July 24th.\n\nI\'ve generated a new key and sent it to your registered email. The integration should resume working within 5 minutes of updating the key.\n\nPlease let me know if you need any further assistance!\n\nBest regards,\nSandeep\'s AI Assistant\n\n---\n\nShall I send this directly via WhatsApp?' },
]

export default function ChatPage() {
  const [input, setInput] = useState('')
  const [activeChat, setActiveChat] = useState(0)

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - var(--navbar-h))', overflow: 'hidden' }}>
      {/* Conversation List */}
      <div style={{ width: 320, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', background: 'rgba(8,12,28,0.5)' }}>
        <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 18, fontWeight: 700, marginBottom: 12 }}>AI Chat</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px' }}>
            <div style={{ color: 'var(--text-muted)' }}>{Icons.search}</div>
            <input placeholder="Search conversations..." style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontSize: 13 }} />
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>
          {conversations.map((c, i) => (
            <div key={i} onClick={() => setActiveChat(i)} style={{
              padding: '14px 16px', cursor: 'pointer', borderBottom: '1px solid var(--border)',
              background: activeChat === i ? 'rgba(79,140,255,0.06)' : 'transparent',
              borderLeft: activeChat === i ? '2px solid var(--primary)' : '2px solid transparent',
              transition: 'all 0.15s',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.time}</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.preview}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                <span style={{ fontSize: 10, color: 'var(--purple-light)', background: 'rgba(139,92,246,0.1)', padding: '2px 8px', borderRadius: 4 }}>{c.model}</span>
                {c.unread > 0 && <span style={{ fontSize: 10, fontWeight: 700, background: 'var(--primary)', color: 'white', width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{c.unread}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Chat Header */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 16 }}>{conversations[activeChat].name}</div>
            <div style={{ fontSize: 12, color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 6, height: 6, background: 'var(--green)', borderRadius: '50%' }} /> Online · {conversations[activeChat].model}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-outline" style={{ padding: '8px 14px', fontSize: 12 }}>{Icons.download} Export</button>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflow: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%', alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{
                background: msg.role === 'user' ? 'linear-gradient(135deg, rgba(79,140,255,0.2), rgba(139,92,246,0.2))' : 'var(--panel)',
                border: `1px solid ${msg.role === 'user' ? 'rgba(79,140,255,0.2)' : 'var(--border)'}`,
                borderRadius: 16, padding: '14px 18px', fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap',
              }}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 14, padding: '12px 16px' }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask your AI assistant..."
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontSize: 14 }}
            />
            <button style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, var(--primary), var(--purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              {Icons.send}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

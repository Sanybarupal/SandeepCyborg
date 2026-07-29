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
  const [activeChat, setActiveChat] = useState<number | null>(null) // null means showing list on mobile

  return (
    <div className="ds-chat-container">
      {/* Conversation List */}
      <div className={`ds-chat-sidebar ${activeChat !== null ? 'ds-mobile-hidden' : ''}`}>
        <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 18, fontWeight: 700, marginBottom: 12 }}>AI Chat</h2>
          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px' }}>
            <div style={{ color: 'var(--text-muted)' }}>{Icons.search}</div>
            <input placeholder="Search conversations..." style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontSize: 13 }} />
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>
          {conversations.map((c, i) => (
            <div key={i} onClick={() => setActiveChat(i)} className="ds-chat-list-item" style={{
              background: activeChat === i ? 'rgba(79,140,255,0.06)' : 'transparent',
              borderLeft: activeChat === i ? '2px solid var(--primary)' : '2px solid transparent',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontWeight: 600, fontSize: 15 }}>{c.name}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.time}</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.preview}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                <span style={{ fontSize: 10, color: 'var(--purple-light)', background: 'rgba(139,92,246,0.1)', padding: '3px 8px', borderRadius: 6 }}>{c.model}</span>
                {c.unread > 0 && <span style={{ fontSize: 11, fontWeight: 700, background: 'var(--primary)', color: 'white', width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{c.unread}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className={`ds-chat-window ${activeChat === null ? 'ds-mobile-hidden' : ''}`}>
        {/* Chat Header */}
        <div className="ds-chat-header glass-panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="ds-chat-back-btn ds-desktop-hidden" onClick={() => setActiveChat(null)}>
              {Icons.chevronRight} {/* Reusing chevron for back icon by rotating in CSS */}
            </button>
            <div>
              <div style={{ fontWeight: 600, fontSize: 16 }}>{activeChat !== null ? conversations[activeChat].name : ''}</div>
              <div style={{ fontSize: 12, color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 6, height: 6, background: 'var(--green)', borderRadius: '50%', boxShadow: '0 0 4px var(--green)' }} /> Online
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-outline" style={{ padding: '8px', fontSize: 12, borderRadius: '50%' }}>{Icons.phone}</button>
          </div>
        </div>

        {/* Messages */}
        <div className="ds-chat-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`ds-chat-msg-row ${msg.role === 'user' ? 'ds-msg-user' : 'ds-msg-ai'}`}>
              <div className={`ds-chat-bubble ${msg.role === 'user' ? 'ds-bubble-user' : 'ds-bubble-ai'}`}>
                {msg.text}
              </div>
            </div>
          ))}
          {/* Typing Indicator */}
          <div className="ds-chat-msg-row ds-msg-ai">
             <div className="ds-chat-bubble ds-bubble-ai ds-typing-indicator">
               <span className="ds-dot"></span>
               <span className="ds-dot"></span>
               <span className="ds-dot"></span>
             </div>
          </div>
        </div>

        {/* AI Suggested Replies */}
        <div className="ds-chat-suggestions ds-mobile-scroll">
           <button className="ds-suggest-btn">Yes, send it.</button>
           <button className="ds-suggest-btn">Edit draft first</button>
           <button className="ds-suggest-btn">Schedule for tomorrow</button>
        </div>

        {/* Input */}
        <div className="ds-chat-input-area glass-panel">
          <div className="ds-chat-input-wrapper">
            <button style={{ color: 'var(--text-muted)' }}>{Icons.upload}</button>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Message..."
              className="ds-chat-input"
            />
            {input ? (
              <button className="ds-chat-send-btn">{Icons.send}</button>
            ) : (
              <button className="ds-chat-mic-btn">{Icons.mic}</button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

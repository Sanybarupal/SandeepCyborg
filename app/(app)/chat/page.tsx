'use client'
import { useState, useRef, useEffect } from 'react'
import { Icons } from '@/components/Icons'

const conversations = [
  { name: 'System Assistant', preview: 'I\'ve processed 128 new documents for your knowledge base.', time: '2m', unread: 3, model: 'GPT-4' },
  { name: 'Client Support Bot', preview: 'Rahul Sharma asked about pricing for enterprise plan.', time: '15m', unread: 1, model: 'Claude' },
  { name: 'Content Writer', preview: 'Draft for the landing page copy is ready for review.', time: '1h', unread: 0, model: 'GPT-4' },
  { name: 'Code Assistant', preview: 'Fixed the API endpoint issue. PR ready for review.', time: '3h', unread: 0, model: 'GPT-4' },
]

const initialMessages: Record<number, Array<{ role: string; text: string }>> = {
  0: [
    { role: 'user', text: 'Summarize all client conversations from today and highlight any urgent issues.' },
    { role: 'ai', text: 'Here\'s your daily summary:\n\n• **42 new conversations** across all channels\n• **3 urgent issues** flagged for attention:\n  1. Rahul Sharma — billing dispute (Enterprise)\n  2. Sarah Johnson — integration failing (API key expired)\n  3. Mike Chen — requesting custom AI model\n\n• **128 documents** processed into knowledge base\n• **Average response time**: 1.2 seconds\n\nWould you like me to draft responses for the urgent issues?' },
    { role: 'user', text: 'Yes, draft a response for Sarah Johnson\'s issue.' },
    { role: 'ai', text: 'Draft response for Sarah Johnson:\n\n---\n\nHi Sarah,\n\nThank you for reaching out about the integration issue. I\'ve identified that your API key expired on July 24th.\n\nI\'ve generated a new key and sent it to your registered email. The integration should resume working within 5 minutes of updating the key.\n\nPlease let me know if you need any further assistance!\n\nBest regards,\nSandeep\'s AI Assistant\n\n---\n\nShall I send this directly via WhatsApp?' },
  ],
  1: [
    { role: 'ai', text: 'Hi! I\'m your Client Support Bot. I\'ve been handling incoming queries. Here\'s a summary:\n\n• Rahul Sharma asked about Enterprise pricing — I sent the standard pricing sheet\n• 2 new trial sign-ups today\n• No escalation needed currently\n\nNeed me to do anything specific?' },
  ],
  2: [
    { role: 'ai', text: 'I\'ve finished drafting the landing page copy. Here\'s the hero section:\n\n**"Transform Your Business with AI-Powered Automation"**\n\nControl WhatsApp, manage clients, and automate your workflows — all from one intelligent dashboard.\n\nWould you like me to revise the tone or focus on specific features?' },
  ],
  3: [
    { role: 'ai', text: 'I fixed the `/api/clients` endpoint issue. The problem was a missing pagination parameter causing timeouts on large datasets.\n\n**Changes made:**\n- Added `limit` and `offset` query params\n- Implemented cursor-based pagination\n- Added response caching (5 min TTL)\n\nPR #47 is ready for review. Want me to auto-merge after CI passes?' },
  ],
}

const aiResponses = [
  'I\'ve processed your request. Here are the results:\n\n• Analysis complete — all metrics look healthy\n• No anomalies detected in the last 24 hours\n• I\'ve updated the dashboard with the latest figures\n\nWould you like me to generate a detailed report?',
  'Great question! Based on our current data:\n\n• Client satisfaction is at **94.2%** (up 3.1% from last month)\n• Response time has improved to **0.8 seconds** average\n• WhatsApp automation is handling **78%** of routine queries\n\nI recommend focusing on the remaining 22% manual queries for potential automation.',
  'I\'ve completed the task. Here\'s what I did:\n\n1. **Analyzed** the incoming data patterns\n2. **Optimized** the response workflow\n3. **Generated** suggested improvements\n\nThe changes are now live. You can monitor them in the Analytics dashboard.',
  'I understand your requirements. Let me break this down:\n\n• **Phase 1**: Data collection and analysis (complete)\n• **Phase 2**: Model training with updated parameters (in progress)\n• **Phase 3**: Deployment and monitoring (scheduled)\n\nEstimated completion: 2 hours. I\'ll notify you when it\'s ready.',
]

export default function ChatPage() {
  const [input, setInput] = useState('')
  const [activeChat, setActiveChat] = useState<number | null>(null)
  const [messages, setMessages] = useState(initialMessages)
  const [isTyping, setIsTyping] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const filteredConversations = conversations.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.preview.toLowerCase().includes(searchQuery.toLowerCase())
  )

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, activeChat, isTyping])

  function handleSend() {
    if (!input.trim() || isTyping) return
    const chatIdx = activeChat ?? 0
    setMessages(prev => ({
      ...prev,
      [chatIdx]: [...(prev[chatIdx] || []), { role: 'user', text: input }],
    }))
    setInput('')
    setIsTyping(true)

    setTimeout(() => {
      const reply = aiResponses[Math.floor(Math.random() * aiResponses.length)]
      setMessages(prev => ({
        ...prev,
        [chatIdx]: [...(prev[chatIdx] || []), { role: 'ai', text: reply }],
      }))
      setIsTyping(false)
    }, 1500 + Math.random() * 2000)
  }

  function handleSuggestion(text: string) {
    if (isTyping) return
    const chatIdx = activeChat ?? 0
    setMessages(prev => ({
      ...prev,
      [chatIdx]: [...(prev[chatIdx] || []), { role: 'user', text }],
    }))
    setIsTyping(true)

    setTimeout(() => {
      const reply = aiResponses[Math.floor(Math.random() * aiResponses.length)]
      setMessages(prev => ({
        ...prev,
        [chatIdx]: [...(prev[chatIdx] || []), { role: 'ai', text: reply }],
      }))
      setIsTyping(false)
    }, 1500 + Math.random() * 2000)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const activeMessages = messages[activeChat ?? 0] || []

  return (
    <div className="ds-chat-container">
      {/* Conversation List */}
      <div className={`ds-chat-sidebar ${activeChat !== null ? 'ds-mobile-hidden' : ''}`}>
        <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 18, fontWeight: 700, marginBottom: 12 }}>AI Chat</h2>
          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px' }}>
            <div style={{ color: 'var(--text-muted)' }}>{Icons.search}</div>
            <input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontSize: 13 }}
            />
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>
          {filteredConversations.map((c, i) => {
            const originalIdx = conversations.indexOf(c)
            return (
              <div key={originalIdx} onClick={() => setActiveChat(originalIdx)} className="ds-chat-list-item" style={{
                background: activeChat === originalIdx ? 'rgba(79,140,255,0.06)' : 'transparent',
                borderLeft: activeChat === originalIdx ? '2px solid var(--primary)' : '2px solid transparent',
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
            )
          })}
        </div>
      </div>

      {/* Chat Window */}
      <div className={`ds-chat-window ${activeChat === null ? 'ds-mobile-hidden' : ''}`}>
        {/* Chat Header */}
        <div className="ds-chat-header glass-panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="ds-chat-back-btn ds-desktop-hidden" onClick={() => setActiveChat(null)}>
              {Icons.chevronRight}
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
          {activeMessages.map((msg, i) => (
            <div key={i} className={`ds-chat-msg-row ${msg.role === 'user' ? 'ds-msg-user' : 'ds-msg-ai'}`}>
              <div className={`ds-chat-bubble ${msg.role === 'user' ? 'ds-bubble-user' : 'ds-bubble-ai'}`}>
                {msg.text}
              </div>
            </div>
          ))}
          {/* Typing Indicator */}
          {isTyping && (
            <div className="ds-chat-msg-row ds-msg-ai">
               <div className="ds-chat-bubble ds-bubble-ai ds-typing-indicator">
                 <span className="ds-dot"></span>
                 <span className="ds-dot"></span>
                 <span className="ds-dot"></span>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* AI Suggested Replies */}
        <div className="ds-chat-suggestions ds-mobile-scroll">
           <button className="ds-suggest-btn" onClick={() => handleSuggestion('Yes, send it.')}>Yes, send it.</button>
           <button className="ds-suggest-btn" onClick={() => handleSuggestion('Edit draft first')}>Edit draft first</button>
           <button className="ds-suggest-btn" onClick={() => handleSuggestion('Schedule for tomorrow')}>Schedule for tomorrow</button>
        </div>

        {/* Input */}
        <div className="ds-chat-input-area glass-panel">
          <div className="ds-chat-input-wrapper">
            <button style={{ color: 'var(--text-muted)' }}>{Icons.upload}</button>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message..."
              className="ds-chat-input"
            />
            {input ? (
              <button className="ds-chat-send-btn" onClick={handleSend}>{Icons.send}</button>
            ) : (
              <button className="ds-chat-mic-btn">{Icons.mic}</button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

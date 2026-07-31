'use client'

import { useState, useRef, useEffect } from 'react'
import { Icons } from '@/components/Icons'

const chats = [
  { name: 'Rahul Sharma', preview: 'Thanks for the update! When can we schedule...', time: '2m', unread: 3, status: 'online' },
  { name: 'Priya Patel', preview: 'The invoice has been sent to your email.', time: '15m', unread: 0, status: 'online' },
  { name: 'Tech Solutions Ltd', preview: 'We need the API documentation by Friday.', time: '1h', unread: 1, status: 'offline' },
  { name: 'Sarah Johnson', preview: 'My integration still is not working. Can you help?', time: '2h', unread: 5, status: 'online' },
  { name: 'Mike Chen', preview: 'Loved the new features! Looking forward to...', time: '5h', unread: 0, status: 'offline' },
]

const initialMessages: Record<number, Array<{ from: string; text: string; time: string }>> = {
  0: [
    { from: 'client', text: 'Hi! I wanted to ask about the Enterprise plan pricing.', time: '10:30 AM' },
    { from: 'ai', text: 'Hello Rahul! The Enterprise plan starts at Rs. 49,999/month and includes unlimited clients, WhatsApp automation, AI Chat, Voice AI, and dedicated support. Would you like a detailed breakdown?', time: '10:30 AM' },
    { from: 'client', text: 'Yes please! Also, can it handle 500+ clients?', time: '10:32 AM' },
    { from: 'ai', text: 'Absolutely. Our Enterprise plan handles unlimited clients with no performance limitations. I can schedule a demo call for you. What time works best?', time: '10:32 AM' },
  ],
  1: [
    { from: 'client', text: 'Hi, could you send me the latest invoice?', time: '9:15 AM' },
    { from: 'ai', text: 'Sure Priya! I\'ve sent the invoice to your registered email priya@example.com. The total is ₹2,49,999 for the Enterprise plan renewal.', time: '9:15 AM' },
  ],
  2: [
    { from: 'client', text: 'We need the API documentation by Friday.', time: '11:00 AM' },
    { from: 'ai', text: 'I\'ll have the comprehensive API documentation ready by Thursday evening so you have time to review it. Would you prefer it in Markdown or PDF format?', time: '11:01 AM' },
  ],
  3: [
    { from: 'client', text: 'My integration still is not working. Can you help?', time: '3:00 PM' },
    { from: 'ai', text: 'I\'ve identified the issue — your API key expired on July 24th. I\'ve generated a new key and sent it to your email. The integration should resume within 5 minutes.', time: '3:01 PM' },
  ],
  4: [
    { from: 'client', text: 'Loved the new features! Looking forward to the next update.', time: '8:00 AM' },
    { from: 'ai', text: 'Thank you Mike! We\'re rolling out real-time analytics and custom AI model support in the next release. I\'ll keep you posted!', time: '8:01 AM' },
  ],
}

const aiReplies = [
  'Thank you for your message! I\'m processing your request now. Is there anything specific you\'d like me to help with?',
  'Got it! I\'ve noted this down and will follow up with the relevant team. You\'ll hear back within 24 hours.',
  'That\'s a great question! Let me pull up the latest information for you. One moment please.',
  'I appreciate you reaching out. I\'ve updated your records accordingly. Is there anything else I can assist with?',
  'Understood! I\'ve scheduled this for review. You can track the progress in your dashboard under "Recent Activity".',
]

const searchFilter = (query: string, name: string, preview: string) => {
  const q = query.toLowerCase()
  return name.toLowerCase().includes(q) || preview.toLowerCase().includes(q)
}

export default function WhatsAppPage() {
  const [activeChat, setActiveChat] = useState<number | null>(null)
  const [msg, setMsg] = useState('')
  const [chatMessages, setChatMessages] = useState(initialMessages)
  const [searchQuery, setSearchQuery] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const currentChat = chats[activeChat ?? 0]

  const filteredChats = chats.filter((c) => searchFilter(searchQuery, c.name, c.preview))

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages, activeChat])

  function getCurrentTime() {
    return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  }

  function handleSendMessage() {
    if (!msg.trim()) return
    const chatIdx = activeChat ?? 0
    const time = getCurrentTime()
    setChatMessages(prev => ({
      ...prev,
      [chatIdx]: [...(prev[chatIdx] || []), { from: 'ai', text: msg, time }],
    }))
    setMsg('')

    // Simulate client reply after a delay
    setTimeout(() => {
      const reply = aiReplies[Math.floor(Math.random() * aiReplies.length)]
      setChatMessages(prev => ({
        ...prev,
        [chatIdx]: [...(prev[chatIdx] || []), { from: 'client', text: reply, time: getCurrentTime() }],
      }))
    }, 1500 + Math.random() * 2000)
  }

  function handleSuggestion(suggestion: string) {
    const chatIdx = activeChat ?? 0
    const time = getCurrentTime()
    setChatMessages(prev => ({
      ...prev,
      [chatIdx]: [...(prev[chatIdx] || []), { from: 'ai', text: `[${suggestion}] Action initiated for ${currentChat.name}. I'll follow up with the details shortly.`, time }],
    }))
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const activeMessages = chatMessages[activeChat ?? 0] || []

  return (
    <div className="wa-shell">
      <div className={`wa-list ${activeChat !== null ? 'wa-mobile-hidden' : ''}`}>
        <div className="wa-list-head">
          <div className="wa-title-row">
            <h2>WhatsApp</h2>
            <div className="wa-status"><span /> Connected</div>
          </div>
          <div className="wa-search">
            <div>{Icons.search}</div>
            <input placeholder="Search conversations..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
        </div>

        <div className="wa-list-body">
          {filteredChats.map((chat, i) => {
            const originalIdx = chats.indexOf(chat)
            return (
              <button key={originalIdx} onClick={() => setActiveChat(originalIdx)} className={`wa-chat-card ${activeChat === originalIdx ? 'wa-chat-card--active' : ''}`}>
                <div className="wa-avatar">
                  <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(chat.name)}&background=22C55E&color=fff&size=48`} alt="" />
                  {chat.status === 'online' && <span />}
                </div>
                <div className="wa-chat-main">
                  <div className="wa-chat-top">
                    <span>{chat.name}</span>
                    <em>{chat.time}</em>
                  </div>
                  <p>{chat.preview}</p>
                </div>
                {chat.unread > 0 && <div className="wa-unread">{chat.unread}</div>}
              </button>
            )
          })}
          {filteredChats.length === 0 && (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              No conversations found
            </div>
          )}
        </div>
      </div>

      <div className={`wa-window ${activeChat === null ? 'wa-mobile-hidden' : ''}`}>
        <div className="wa-chat-header">
          <div className="wa-header-person">
            <button className="ds-chat-back-btn ds-desktop-hidden" onClick={() => setActiveChat(null)}>{Icons.chevronRight}</button>
            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(currentChat.name)}&background=22C55E&color=fff&size=44`} alt="" />
            <div>
              <div className="wa-header-name">{currentChat.name}</div>
              <div className="wa-header-online">{currentChat.status === 'online' ? 'Online' : 'Last seen recently'}</div>
            </div>
          </div>
          <div className="wa-header-actions">
            <button title="Call">{Icons.phone}</button>
            <button title="Activity">{Icons.activity}</button>
          </div>
        </div>

        <div className="wa-messages">
          {activeMessages.map((m, i) => (
            <div key={i} className={`wa-message-row ${m.from === 'client' ? 'wa-message-client' : 'wa-message-ai'}`}>
              <div className="wa-bubble">
                <p>{m.text}</p>
                <span>{m.time}</span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="wa-suggestions">
          {['AI reply', 'Schedule demo', 'Send proposal'].map((s) => <button key={s} onClick={() => handleSuggestion(s)}>{s}</button>)}
        </div>

        <div className="wa-input">
          <button>{Icons.mic}</button>
          <input value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={handleKeyDown} placeholder="Type a message..." />
          <button className="wa-send" onClick={handleSendMessage} style={{ opacity: msg.trim() ? 1 : 0.4 }}>{Icons.send}</button>
        </div>
      </div>

      <aside className="wa-details">
        <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(currentChat.name)}&background=22C55E&color=fff&size=72`} alt="" />
        <h3>{currentChat.name}</h3>
        <p>Enterprise Client</p>
        <div className="section-title">AI SUGGESTIONS</div>
        {['Send pricing proposal', 'Schedule demo call', 'Share case study'].map((s) => <button key={s} onClick={() => handleSuggestion(s)}>{s}</button>)}
      </aside>
    </div>
  )
}

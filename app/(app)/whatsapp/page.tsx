'use client'

import { useState } from 'react'
import { Icons } from '@/components/Icons'

const chats = [
  { name: 'Rahul Sharma', preview: 'Thanks for the update! When can we schedule...', time: '2m', unread: 3, status: 'online' },
  { name: 'Priya Patel', preview: 'The invoice has been sent to your email.', time: '15m', unread: 0, status: 'online' },
  { name: 'Tech Solutions Ltd', preview: 'We need the API documentation by Friday.', time: '1h', unread: 1, status: 'offline' },
  { name: 'Sarah Johnson', preview: 'My integration still is not working. Can you help?', time: '2h', unread: 5, status: 'online' },
  { name: 'Mike Chen', preview: 'Loved the new features! Looking forward to...', time: '5h', unread: 0, status: 'offline' },
]

const messages = [
  { from: 'client', text: 'Hi! I wanted to ask about the Enterprise plan pricing.', time: '10:30 AM' },
  { from: 'ai', text: 'Hello Rahul! The Enterprise plan starts at Rs. 49,999/month and includes unlimited clients, WhatsApp automation, AI Chat, Voice AI, and dedicated support. Would you like a detailed breakdown?', time: '10:30 AM' },
  { from: 'client', text: 'Yes please! Also, can it handle 500+ clients?', time: '10:32 AM' },
  { from: 'ai', text: 'Absolutely. Our Enterprise plan handles unlimited clients with no performance limitations. I can schedule a demo call for you. What time works best?', time: '10:32 AM' },
]

export default function WhatsAppPage() {
  const [activeChat, setActiveChat] = useState<number | null>(null)
  const [msg, setMsg] = useState('')
  const currentChat = chats[activeChat ?? 0]

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
            <input placeholder="Search conversations..." />
          </div>
        </div>

        <div className="wa-list-body">
          {chats.map((chat, i) => (
            <button key={i} onClick={() => setActiveChat(i)} className={`wa-chat-card ${activeChat === i ? 'wa-chat-card--active' : ''}`}>
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
          ))}
        </div>
      </div>

      <div className={`wa-window ${activeChat === null ? 'wa-mobile-hidden' : ''}`}>
        <div className="wa-chat-header">
          <div className="wa-header-person">
            <button className="ds-chat-back-btn ds-desktop-hidden" onClick={() => setActiveChat(null)}>{Icons.chevronRight}</button>
            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(currentChat.name)}&background=22C55E&color=fff&size=44`} alt="" />
            <div>
              <div className="wa-header-name">{currentChat.name}</div>
              <div className="wa-header-online">Online</div>
            </div>
          </div>
          <div className="wa-header-actions">
            <button>{Icons.phone}</button>
            <button>{Icons.activity}</button>
          </div>
        </div>

        <div className="wa-messages">
          {messages.map((m, i) => (
            <div key={i} className={`wa-message-row ${m.from === 'client' ? 'wa-message-client' : 'wa-message-ai'}`}>
              <div className="wa-bubble">
                <p>{m.text}</p>
                <span>{m.time}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="wa-suggestions">
          {['AI reply', 'Schedule demo', 'Send proposal'].map((s) => <button key={s}>{s}</button>)}
        </div>

        <div className="wa-input">
          <button>{Icons.mic}</button>
          <input value={msg} onChange={e => setMsg(e.target.value)} placeholder="Type a message..." />
          <button className="wa-send">{Icons.send}</button>
        </div>
      </div>

      <aside className="wa-details">
        <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(currentChat.name)}&background=22C55E&color=fff&size=72`} alt="" />
        <h3>{currentChat.name}</h3>
        <p>Enterprise Client</p>
        <div className="section-title">AI SUGGESTIONS</div>
        {['Send pricing proposal', 'Schedule demo call', 'Share case study'].map((s) => <button key={s}>{s}</button>)}
      </aside>
    </div>
  )
}

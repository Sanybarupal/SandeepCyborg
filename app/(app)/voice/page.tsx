'use client'
import { useState } from 'react'
import { Icons } from '@/components/Icons'

const commandHistory = [
  { command: 'Send daily report to all enterprise clients', status: 'completed', time: '2:30 PM' },
  { command: 'Schedule meeting with Rahul Sharma for tomorrow', status: 'completed', time: '1:15 PM' },
  { command: 'Analyze WhatsApp conversations for urgent issues', status: 'completed', time: '12:45 PM' },
  { command: 'Generate revenue report for Q3', status: 'processing', time: '12:30 PM' },
  { command: 'Update website landing page with new pricing', status: 'completed', time: '11:00 AM' },
]

export default function VoicePage() {
  const [listening, setListening] = useState(false)

  return (
    <div className="page-container ds-mobile-page">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Voice AI</h1>
          <p className="page-subtitle">Control your AI system with voice commands</p>
        </div>
      </div>

      <div className="ds-voice-grid">
        {/* Main Voice Area */}
        <div className="glass-card ds-voice-main">
          {/* Background glow */}
          <div className="ds-voice-glow" style={{ background: `radial-gradient(circle, ${listening ? 'rgba(0,229,255,0.15)' : 'rgba(79,140,255,0.08)'} 0%, transparent 70%)` }} />

          {/* Mic button */}
          <button
            onClick={() => setListening(!listening)}
            className={`ds-voice-mic-btn ${listening ? 'ds-listening' : ''}`}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
          </button>

          {/* Pulse rings */}
          {listening && (
            <>
              <div className="ds-pulse-ring ring-1" />
              <div className="ds-pulse-ring ring-2" />
              <div className="ds-pulse-ring ring-3" />
            </>
          )}

          <div className="ds-voice-text-area">
            <div className="ds-voice-status" style={{ color: listening ? 'var(--cyan)' : 'var(--text)' }}>
              {listening ? 'Listening...' : 'Tap to Speak'}
            </div>
            <div className="ds-voice-sub">
              {listening ? 'Say your command clearly' : 'Hold or tap the microphone to start'}
            </div>
          </div>

          {/* Waveform */}
          <div className="ds-voice-waveform">
            {Array.from({ length: 40 }).map((_, i) => (
              <div key={i} className="ds-wave-bar" style={{
                background: `linear-gradient(to top, ${listening ? 'var(--cyan)' : 'var(--primary)'}, ${listening ? 'var(--primary)' : 'var(--purple)'})`,
                animationName: listening ? 'waveAnim' : 'none',
                animationDelay: `${i * 0.04}s`, 
                height: listening ? undefined : 4,
                opacity: listening ? 1 : 0.3,
              }} />
            ))}
          </div>
        </div>

        {/* Command History */}
        <div className="glass-card ds-voice-history">
          <div className="section-title ds-history-title">{Icons.clock} COMMAND HISTORY</div>
          <div className="ds-history-list">
            {commandHistory.map((cmd, i) => (
              <div key={i} className="ds-history-item" style={{ borderBottom: i < commandHistory.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <div className="ds-history-cmd">{cmd.command}</div>
                <div className="ds-history-meta">
                  <span className={`ds-history-badge ds-badge-${cmd.status}`}>{cmd.status}</span>
                  <span className="ds-history-time">{cmd.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

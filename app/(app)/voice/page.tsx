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
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Voice AI</h1>
          <p className="page-subtitle">Control your AI system with voice commands</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 24 }}>
        {/* Main Voice Area */}
        <div className="glass-card-static" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 500, position: 'relative', overflow: 'hidden' }}>
          {/* Background glow */}
          <div style={{ position: 'absolute', width: 400, height: 400, background: `radial-gradient(circle, ${listening ? 'rgba(0,229,255,0.15)' : 'rgba(79,140,255,0.08)'} 0%, transparent 70%)`, borderRadius: '50%', transition: 'all 0.5s' }} />

          {/* Mic button */}
          <button
            onClick={() => setListening(!listening)}
            style={{
              position: 'relative', zIndex: 2, width: 120, height: 120, borderRadius: '50%',
              background: listening ? 'linear-gradient(135deg, var(--cyan), var(--primary))' : 'linear-gradient(135deg, var(--primary), var(--purple))',
              border: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: listening ? '0 0 40px var(--cyan-glow), 0 0 80px rgba(0,229,255,0.15)' : '0 0 30px var(--primary-glow)',
              transition: 'all 0.4s', cursor: 'pointer', transform: listening ? 'scale(1.05)' : 'scale(1)',
            }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
          </button>

          {/* Pulse rings */}
          {listening && (
            <>
              <div style={{ position: 'absolute', width: 160, height: 160, borderRadius: '50%', border: '2px solid rgba(0,229,255,0.2)', animation: 'pulse 2s infinite', zIndex: 1 }} />
              <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', border: '1px solid rgba(0,229,255,0.1)', animation: 'pulse 2s infinite 0.5s', zIndex: 1 }} />
              <div style={{ position: 'absolute', width: 250, height: 250, borderRadius: '50%', border: '1px solid rgba(0,229,255,0.05)', animation: 'pulse 2s infinite 1s', zIndex: 1 }} />
            </>
          )}

          <div style={{ marginTop: 32, textAlign: 'center', position: 'relative', zIndex: 2 }}>
            <div style={{ fontSize: 18, fontWeight: 600, color: listening ? 'var(--cyan)' : 'var(--text)' }}>
              {listening ? 'Listening...' : 'Tap to Speak'}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
              {listening ? 'Say your command clearly' : 'Hold or tap the microphone to start'}
            </div>
          </div>

          {/* Waveform */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, height: 50, marginTop: 32, position: 'relative', zIndex: 2 }}>
            {Array.from({ length: 40 }).map((_, i) => (
              <div key={i} style={{
                width: 3, borderRadius: 3,
                background: `linear-gradient(to top, ${listening ? 'var(--cyan)' : 'var(--primary)'}, ${listening ? 'var(--primary)' : 'var(--purple)'})`,
                animation: listening ? `waveAnim 0.8s ease-in-out infinite` : 'none',
                animationDelay: `${i * 0.04}s`, height: listening ? undefined : 4,
                opacity: listening ? 1 : 0.3,
              }} />
            ))}
          </div>
        </div>

        {/* Command History */}
        <div className="glass-card-static" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{Icons.clock} COMMAND HISTORY</div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {commandHistory.map((cmd, i) => (
              <div key={i} style={{ padding: '14px 0', borderBottom: i < commandHistory.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{cmd.command}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
                    background: cmd.status === 'completed' ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)',
                    color: cmd.status === 'completed' ? 'var(--green)' : 'var(--orange)',
                    textTransform: 'uppercase',
                  }}>{cmd.status}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{cmd.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

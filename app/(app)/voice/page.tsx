'use client'
import { useState, useRef, useEffect } from 'react'
import { Icons } from '@/components/Icons'

export default function VoicePage() {
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [commandHistory, setCommandHistory] = useState<any[]>([
    { command: 'Send daily report to all enterprise clients', status: 'completed', time: '2:30 PM' },
    { command: 'Schedule meeting with Rahul Sharma for tomorrow', status: 'completed', time: '1:15 PM' },
    { command: 'Analyze WhatsApp conversations for urgent issues', status: 'completed', time: '12:45 PM' },
    { command: 'Generate revenue report for Q3', status: 'processing', time: '12:30 PM' },
    { command: 'Update website landing page with new pricing', status: 'completed', time: '11:00 AM' },
  ])
  const recognitionRef = useRef<any>(null)
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      console.error('Speech Recognition not supported')
      return
    }

    recognitionRef.current = new SpeechRecognition()
    recognitionRef.current.continuous = false
    recognitionRef.current.interimResults = true
    recognitionRef.current.lang = 'en-US'

    recognitionRef.current.onstart = () => {
      setTranscript('')
      setListening(true)
      speak('Listening... Please tell me your command', false)
    }

    recognitionRef.current.onresult = (event: any) => {
      let interimTranscript = ''
      let finalTranscript = ''
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptSegment = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcriptSegment + ' '
        } else {
          interimTranscript += transcriptSegment
        }
      }

      if (finalTranscript) {
        setTranscript(finalTranscript.trim())
        handleCommand(finalTranscript.trim())
      } else {
        setTranscript(interimTranscript)
      }
    }

    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech Recognition error:', event.error)
      speak('Sorry, I did not understand. Please try again.', false)
      setListening(false)
    }

    recognitionRef.current.onend = () => {
      setListening(false)
    }

    return () => {
      recognitionRef.current?.stop()
    }
  }, [])

  // Text-to-Speech
  const speak = (text: string, isImportant = true) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return

    // Cancel any ongoing speech
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1.0
    utterance.pitch = 1.0
    utterance.volume = 1.0

    // Try to use a natural voice
    const voices = window.speechSynthesis.getVoices()
    const naturalVoice = voices.find(v => 
      v.name.includes('Google') || 
      v.name.includes('Natural') || 
      v.name.includes('Neural')
    )
    
    if (naturalVoice) {
      utterance.voice = naturalVoice
    }

    window.speechSynthesis.speak(utterance)
    synthRef.current = utterance
  }

  // Handle voice commands
  const handleCommand = async (command: string) => {
    setIsProcessing(true)
    const lowerCmd = command.toLowerCase()

    // Simulate command processing
    const newCommand = {
      command: command,
      status: 'processing',
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    }

    setCommandHistory(prev => [newCommand, ...prev])

    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Update command status
    setCommandHistory(prev => 
      prev.map((cmd, idx) => 
        idx === 0 ? { ...cmd, status: 'completed' } : cmd
      )
    )

    let response = 'Command processed successfully. '
    
    if (lowerCmd.includes('report')) {
      response = 'Your daily report has been generated and sent to all clients.'
    } else if (lowerCmd.includes('meeting')) {
      response = 'Meeting scheduled with Rahul Sharma for tomorrow at 2 PM.'
    } else if (lowerCmd.includes('whatsapp')) {
      response = 'I have analyzed WhatsApp conversations. No urgent issues found.'
    } else if (lowerCmd.includes('revenue')) {
      response = 'Revenue report for Q3 shows a 15% increase compared to Q2.'
    } else {
      response = 'I have processed your command: ' + command
    }

    speak(response, true)
    setIsProcessing(false)
    setTranscript('')
  }

  // Start/Stop listening
  const toggleListening = () => {
    if (listening) {
      recognitionRef.current?.stop()
      setListening(false)
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start()
        } catch (e) {
          console.error('Error starting recognition:', e)
        }
      }
    }
  }

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
            onClick={toggleListening}
            disabled={isProcessing}
            className={`ds-voice-mic-btn ${listening ? 'ds-listening' : ''}`}
            style={{ opacity: isProcessing ? 0.6 : 1 }}
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
            <div className="ds-voice-status" style={{ color: listening ? 'var(--cyan)' : isProcessing ? 'var(--purple)' : 'var(--text)' }}>
              {listening ? 'Listening...' : isProcessing ? 'Processing...' : 'Tap to Speak'}
            </div>
            <div className="ds-voice-sub">
              {listening ? 'Say your command clearly' : isProcessing ? 'Processing your command' : 'Hold or tap the microphone to start'}
            </div>
            {transcript && (
              <div style={{ marginTop: '12px', fontSize: '13px', color: 'var(--primary)', fontStyle: 'italic' }}>
                "{transcript}"
              </div>
            )}
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

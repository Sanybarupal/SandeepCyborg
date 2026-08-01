'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function VoiceAssistant() {
  const router = useRouter()
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<any>(null)
  const isStartedRef = useRef(false)
  const shouldListenRef = useRef(false)
  const isSpeakingRef = useRef(false)
  const hasGreeted = useRef(false)

  // ── 1. Text to Speech (TTS) ──
  const speak = (text: string, callback?: () => void) => {
    console.log('[VoiceAssistant] Speaking:', text)
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (callback) callback()
      return
    }

    try {
      window.speechSynthesis.cancel() // Clear any stuck speech queue
    } catch (e) {}

    const utterance = new SpeechSynthesisUtterance(text)
    isSpeakingRef.current = true

    // Pause recognition while speaking so AI doesn't hear itself
    if (recognitionRef.current && isStartedRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (e) {}
    }

    const voices = window.speechSynthesis.getVoices()
    let selectedVoice = voices.find(v => v.lang.includes('hi-IN') || v.lang.includes('hi'))
    if (!selectedVoice) {
      selectedVoice = voices.find(v =>
        v.name.includes('Google UK English Male') ||
        v.name.includes('Google US English') ||
        v.name.includes('Natural') ||
        v.name.includes('Neural') ||
        v.name.includes('David') ||
        v.name.includes('Ravi')
      )
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice
    }

    utterance.rate = 1.0
    utterance.pitch = 1.0

    const resumeListening = () => {
      isSpeakingRef.current = false
      if (shouldListenRef.current && !isStartedRef.current) {
        setTimeout(() => {
          if (shouldListenRef.current && !isStartedRef.current) {
            try {
              recognitionRef.current?.start()
            } catch (e) {}
          }
        }, 300)
      }
      if (callback) callback()
    }

    utterance.onend = resumeListening
    utterance.onerror = resumeListening

    window.speechSynthesis.speak(utterance)
  }

  // ── 2. Handle Voice Commands & Conversations ──
  const handleVoiceCommand = (rawCommand: string) => {
    const command = rawCommand.toLowerCase().trim()
    console.log('[VoiceAssistant] Handling command:', command)

    // Wake words / greetings
    const wakeWords = ['hey cybo', 'hey sandeep', 'hello sandeep', 'hello cybo', 'cybo', 'sandeep', 'hello', 'hi', 'sun rahe ho', 'suno']
    if (wakeWords.some(w => command === w || command.startsWith(w + ' '))) {
      speak('Haan Sandeep sir, bataiye main aapki kya madad kar sakta hoon?')
      return
    }

    // Conversational Queries
    if (command.includes('kaise ho') || command.includes('how are you') || command.includes('kya haal')) {
      speak('Main bilkul badhiya hoon Sandeep sir! Aapka AI Operating System full power mein online hai. Aaj kya task automate karein?')
      return
    }

    if (command.includes('kya kar sakte ho') || command.includes('what can you do') || command.includes('help')) {
      speak('Sir main aapke clients manage kar sakta hoon, WhatsApp automation dekh sakta hoon, approvals check kar sakta hoon, aur dashboard navigate kar sakta hoon.')
      return
    }

    if (command.includes('who are you') || command.includes('tum kaun ho') || command.includes('aap kaun ho') || command.includes('naam kya hai')) {
      speak('Main aapka personal AI Cyborg Operating System hoon Sandeep sir, aapke business automation ke liye.')
      return
    }

    if (command.includes('status') || command.includes('kya chal raha hai') || command.includes('system status')) {
      speak('System 100% operational hai sir. 3 approvals pending hain aur 320 new messages WhatsApp par handle ho chuke hain.')
      return
    }

    // Navigation Commands
    if (command.includes('open dashboard') || command.includes('dashboard kholo') || command.includes('go home') || command.includes('home page')) {
      speak('Opening Dashboard')
      router.push('/')
    } else if (command.includes('open client') || command.includes('client dikhao') || command.includes('clients kholo') || command.includes('go to clients')) {
      speak('Opening Clients section')
      router.push('/clients')
    } else if (command.includes('open chat') || command.includes('chat kholo') || command.includes('ai chat') || command.includes('open ai chat')) {
      speak('Opening AI Chat')
      router.push('/chat')
    } else if (command.includes('open whatsapp') || command.includes('whatsapp kholo') || command.includes('messages kholo')) {
      speak('Opening WhatsApp automation dashboard')
      router.push('/whatsapp')
    } else if (command.includes('open approval') || command.includes('approvals kholo') || command.includes('pending approvals')) {
      speak('Opening Approvals panel')
      router.push('/approvals')
    } else if (command.includes('open upload') || command.includes('upload kholo') || command.includes('knowledge base')) {
      speak('Opening Document Upload')
      router.push('/upload')
    } else if (command.includes('open analytics') || command.includes('analytics kholo') || command.includes('stats kholo')) {
      speak('Opening Analytics')
      router.push('/analytics')
    } else if (command.includes('open setting') || command.includes('settings kholo') || command.includes('profile kholo')) {
      speak('Opening Settings')
      router.push('/settings')
    } else if (command.includes('open voice') || command.includes('voice page') || command.includes('voice ai')) {
      speak('Opening Voice AI page')
      router.push('/voice')
    } else if (command.includes('open website builder') || command.includes('website builder') || command.includes('web builder')) {
      speak('Opening Website Builder')
      router.push('/website-builder')
    } else if (command.includes('stop listening') || command.includes('chup raho') || command.includes('band ho jao') || command.includes('pause voice')) {
      speak('Voice assistant paused. Jab bhi zaroorat ho mic par click karein.')
      stopListening()
    } else {
      // Smart Fallback Response
      speak(`Theek hai Sandeep sir, maine note kar liya hai: ${rawCommand}`)
    }
  }

  // ── 3. Start/Stop Safe Listeners ──
  const startListening = () => {
    shouldListenRef.current = true
    setIsListening(true)
    if (recognitionRef.current && !isStartedRef.current && !isSpeakingRef.current) {
      try {
        recognitionRef.current.start()
      } catch (e) {
        // Ignore InvalidStateError if already starting
      }
    }
  }

  const stopListening = () => {
    shouldListenRef.current = false
    setIsListening(false)
    if (recognitionRef.current && isStartedRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (e) {}
    }
  }

  const toggleListening = (forceState?: boolean) => {
    const nextState = forceState !== undefined ? forceState : !isListening
    if (nextState) {
      speak('Voice assistant active.', () => {
        startListening()
      })
    } else {
      speak('Voice assistant paused.')
      stopListening()
    }
  }

  // ── 4. Initialize SpeechRecognition Lifecycle ──
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Preload speech synthesis voices
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices()
      }
      window.speechSynthesis.getVoices()
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      console.warn('[VoiceAssistant] SpeechRecognition not supported in this browser.')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = false
    recognition.lang = 'en-IN'

    recognition.onstart = () => {
      isStartedRef.current = true
      setIsListening(true)
    }

    recognition.onresult = (event: any) => {
      if (isSpeakingRef.current) return
      const results = event.results
      if (results && results.length > 0) {
        const transcript = results[results.length - 1][0].transcript
        if (transcript) {
          handleVoiceCommand(transcript)
        }
      }
    }

    recognition.onerror = (event: any) => {
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        console.warn('[VoiceAssistant] Recognition notice:', event.error)
      }
    }

    recognition.onend = () => {
      isStartedRef.current = false
      if (shouldListenRef.current && !isSpeakingRef.current) {
        setTimeout(() => {
          if (shouldListenRef.current && !isStartedRef.current && !isSpeakingRef.current) {
            try {
              recognition.start()
            } catch (e) {}
          }
        }, 300)
      } else if (!shouldListenRef.current) {
        setIsListening(false)
      }
    }

    recognitionRef.current = recognition

    // Auto-Greeting
    const playGreeting = () => {
      if (hasGreeted.current) return
      hasGreeted.current = true
      shouldListenRef.current = true
      speak('Welcome back Sandeep sir, bataiye main aapki kya help kar sakta hoon?')
    }

    const timer = setTimeout(() => {
      playGreeting()
    }, 800)

    window.addEventListener('click', playGreeting, { once: true })
    window.addEventListener('keydown', playGreeting, { once: true })

    return () => {
      clearTimeout(timer)
      window.removeEventListener('click', playGreeting)
      window.removeEventListener('keydown', playGreeting)
      shouldListenRef.current = false
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort()
        } catch (e) {}
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999 }}>
      <button
        onClick={() => toggleListening()}
        style={{
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: isListening
            ? 'linear-gradient(135deg, #00E5FF, #4F8CFF)'
            : 'rgba(20, 25, 45, 0.85)',
          color: isListening ? '#050816' : '#4F8CFF',
          border: isListening ? '2px solid #00E5FF' : '1px solid rgba(79, 140, 255, 0.3)',
          boxShadow: isListening
            ? '0 0 25px rgba(0, 229, 255, 0.5), 0 4px 15px rgba(0,0,0,0.4)'
            : '0 4px 12px rgba(0,0,0,0.3)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
          backdropFilter: 'blur(10px)',
        }}
        title={isListening ? 'Voice Assistant Active (Click to Pause)' : 'Voice Assistant Paused (Click to Start)'}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
          <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
        </svg>
      </button>
    </div>
  )
}

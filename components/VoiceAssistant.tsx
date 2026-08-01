'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function VoiceAssistant() {
  const router = useRouter()
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase()
        console.log('Voice Command:', transcript)
        handleVoiceCommand(transcript)
      }

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error)
      }

      // Automatically restart if it stops and we want it listening
      recognitionRef.current.onend = () => {
        if (isListening) {
          try {
            recognitionRef.current.start()
          } catch (e) {}
        }
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [isListening])

  const handleVoiceCommand = async (command: string) => {
    const wakeWords = ['hey cybo', 'hey sandeep', 'hello sandeep', 'hello cybo', 'cybo', 'sandeep']
    if (wakeWords.some(w => command.includes(w))) {
      speak('haan main sun raha hu sir bataiye kya kaam hai')
      return
    }
    
    if (command.includes('open dashboard')) {
      speak('Opening dashboard')
      router.push('/dashboard')
    } else if (command.includes('open clients')) {
      speak('Opening clients')
      router.push('/clients')
    } else if (command.includes('open ai chat') || command.includes('open chat')) {
      speak('Opening AI chat')
      router.push('/chat')
    } else if (command.includes('open approvals')) {
      speak('Opening approvals')
      router.push('/approvals')
    } else if (command.includes('open upload')) {
      speak('Opening upload page')
      router.push('/upload')
    } else if (command.includes('open settings')) {
      speak('Opening settings')
      router.push('/settings')
    } else if (command.includes('stop listening')) {
      speak('Voice assistant paused')
      toggleListening(false)
    } else {
      console.log('Sending to AI backend:', command)
      try {
        const response = await fetch('http://localhost:8000/api/voice/command', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: command, speak: false }) // We'll handle TTS here
        })
        const data = await response.json()
        if (data && data.text) {
          speak(data.text)
        } else {
          speak('Command executed successfully.')
        }
      } catch (e) {
        console.error('Failed to communicate with AI backend', e)
        speak('Sorry, I could not reach the backend server.')
      }
    }
  }

  const speak = (text: string) => {
    console.log('[VoiceAssistant] Speaking:', text);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Clear any stuck queues
      const utterance = new SpeechSynthesisUtterance(text)
      
      const voices = window.speechSynthesis.getVoices()
      
      // Try to find a Hindi voice first for better Hinglish pronunciation
      let selectedVoice = voices.find(v => v.lang.includes('hi-IN') || v.lang.includes('hi'))
      
      // Fallback to English natural voices if Hindi is not found
      if (!selectedVoice) {
         selectedVoice = voices.find(v => v.name.includes('Google UK English Male') || v.name.includes('Google US English') || v.name.includes('Natural') || v.name.includes('Neural'))
      }
      
      if (selectedVoice) {
        utterance.voice = selectedVoice
        console.log('[VoiceAssistant] Selected Voice:', selectedVoice.name, selectedVoice.lang);
      } else {
        console.log('[VoiceAssistant] No specialized voice found. Using default.');
      }

      utterance.rate = 1.0 // Normal rate
      utterance.pitch = 1.0 // Normal pitch
      window.speechSynthesis.speak(utterance)
    } else {
      console.warn('[VoiceAssistant] Speech synthesis not supported in this environment.');
    }
  }

  // Ensure voices are loaded (sometimes takes a moment on page load)
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices()
      }
    }
  }, [])

  const hasGreeted = useRef(false)
  
  const toggleListening = (forceState?: boolean, isAutoGreeting?: boolean) => {
    setIsListening(prev => {
      const newState = forceState !== undefined ? forceState : !prev
      
      if (newState) {
        if (!isAutoGreeting) {
          speak('Voice assistant activated.')
        }
        try {
          recognitionRef.current?.start()
        } catch (e) {
          console.error("Mic start error", e)
        }
      } else {
        if (!isAutoGreeting) {
          speak('Voice assistant paused.')
        }
        recognitionRef.current?.stop()
      }
      
      return newState;
    })
  }

  useEffect(() => {
    const playGreeting = () => {
      if (!hasGreeted.current) {
        speak('Hi, welcome back Sandeep sir, main aapki kya madad kar sakta hu')
        hasGreeted.current = true
        // Start listening automatically
        toggleListening(true, true)
      }
    }
    
    // Auto-play might be blocked by browser policy without user interaction
    // We attach it to a click event just in case, but also attempt immediately
    const timer = setTimeout(() => {
       playGreeting()
    }, 1000)
    
    window.addEventListener('click', playGreeting, { once: true })
    
    return () => {
       clearTimeout(timer)
       window.removeEventListener('click', playGreeting)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // A global trigger could be added here, for now it's a fixed button at bottom right
  return (
    <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999 }}>
      <button 
        onClick={() => toggleListening()} 
        style={{
          width: 50, 
          height: 50, 
          borderRadius: '50%', 
          background: isListening ? 'var(--red)' : 'var(--purple)',
          color: 'white',
          border: 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 24,
          animation: isListening ? 'pulse 2s infinite' : 'none'
        }}
        title="Toggle Voice Assistant"
      >
        {isListening ? '🎙️' : '🎤'}
      </button>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7); }
          70% { box-shadow: 0 0 0 15px rgba(220, 38, 38, 0); }
          100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
        }
      `}} />
    </div>
  )
}

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
    const lowerCmd = command.toLowerCase().trim()
    
    // Greeting commands
    if (lowerCmd.includes('hi sandeep') || lowerCmd.includes('hi saibo') || lowerCmd.includes('hello sandeep')) {
      speak('Hello sir. How can I assist you with your business today?')
      return
    }
    
    // Navigation commands
    if (lowerCmd.includes('open dashboard') || lowerCmd.includes('go to dashboard')) {
      speak('Opening dashboard')
      setTimeout(() => router.push('/dashboard'), 800)
    } else if (lowerCmd.includes('open clients')) {
      speak('Opening clients page')
      setTimeout(() => router.push('/clients'), 800)
    } else if (lowerCmd.includes('open ai chat') || lowerCmd.includes('open chat')) {
      speak('Opening AI chat')
      setTimeout(() => router.push('/chat'), 800)
    } else if (lowerCmd.includes('open approvals')) {
      speak('Opening approvals')
      setTimeout(() => router.push('/approvals'), 800)
    } else if (lowerCmd.includes('open upload')) {
      speak('Opening upload page')
      setTimeout(() => router.push('/upload'), 800)
    } else if (lowerCmd.includes('open settings')) {
      speak('Opening settings')
      setTimeout(() => router.push('/settings'), 800)
    } else if (lowerCmd.includes('open voice')) {
      speak('Opening voice AI')
      setTimeout(() => router.push('/voice'), 800)
    } else if (lowerCmd.includes('stop listening')) {
      speak('Voice assistant paused')
      toggleListening(false)
    } else {
      // AI Response for general queries
      speak('I am processing your request. Please wait.')
      console.log('[Voice] Command received:', command)
      
      // Simulate AI processing
      setTimeout(() => {
        let response = 'I have processed your command.'
        
        if (lowerCmd.includes('report')) response = 'I will generate the report for you.'
        else if (lowerCmd.includes('client')) response = 'Accessing client information.'
        else if (lowerCmd.includes('whatsapp')) response = 'Checking WhatsApp messages.'
        else if (lowerCmd.includes('email')) response = 'Checking your emails.'
        else if (lowerCmd.includes('meeting')) response = 'I can help schedule a meeting for you.'
        
        speak(response)
      }, 1200)
    }
  }

  const speak = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      
      const utterance = new SpeechSynthesisUtterance(text)
      
      // Try to find a more natural/human voice
      const voices = window.speechSynthesis.getVoices()
      let selectedVoice = voices.find(v => 
        v.name.includes('Google') || 
        v.name.includes('Neural') || 
        v.name.includes('Natural')
      )
      
      if (selectedVoice) {
        utterance.voice = selectedVoice
      }

      utterance.rate = 1.0 // Natural speed
      utterance.pitch = 1.0 // Natural pitch
      utterance.volume = 1.0 // Full volume
      
      window.speechSynthesis.speak(utterance)
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

  const toggleListening = (forceState?: boolean) => {
    const newState = forceState !== undefined ? forceState : !isListening
    setIsListening(newState)
    
    if (newState) {
      speak('Voice assistant ready, I am Sandeep Saibo.')
      try {
        recognitionRef.current?.start()
      } catch (e) {}
    } else {
      recognitionRef.current?.stop()
    }
  }

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

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
    if (command.includes('hi sandeep') || command.includes('hi saibo') || command.includes('hello sandeep')) {
      speak('Hello sir. How can I assist you with your business today?')
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
      // Simulate passing to an LLM
      console.log('Sending to AI backend:', command)
      // Normally, here we would fetch from our /api/chat backend.
      // For now, if we don't recognize a command, we give a default AI response:
      if (command.length > 5 && !command.includes('sandeep') && !command.includes('saibo')) {
         speak('I am processing your request. Please wait.')
         setTimeout(() => {
            speak('I have recorded your command.')
         }, 2000)
      }
    }
  }

  const speak = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      
      // Try to find a more natural/human voice (e.g. Google or Microsoft natural voices)
      const voices = window.speechSynthesis.getVoices()
      // Fallback to finding male English voices which tend to sound closer to the desired outcome
      let selectedVoice = voices.find(v => v.name.includes('Google UK English Male') || v.name.includes('Google US English'))
      if (!selectedVoice) {
        selectedVoice = voices.find(v => v.name.includes('Natural') || v.name.includes('Neural'))
      }
      
      if (selectedVoice) {
        utterance.voice = selectedVoice
      }

      utterance.rate = 1.05 // Slightly faster for natural feel
      utterance.pitch = 0.9 // Slightly lower pitch for deeper male voice
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

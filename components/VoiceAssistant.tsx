'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function VoiceAssistant() {
  const router = useRouter()
  const [isListening, setIsListening] = useState(false)
  const [isAwaitingReplyTarget, setIsAwaitingReplyTarget] = useState(false)
  const [replyTargetUser, setReplyTargetUser] = useState('')
  const recognitionRef = useRef<any>(null)
  const isStartedRef = useRef(false)
  const shouldListenRef = useRef(false)
  const isSpeakingRef = useRef(false)
  const hasGreeted = useRef(false)

  // ── Helper to execute actions via Android Bridge (For Android App) ──
  const executeNativeAction = (actionType: string, payload: string = '') => {
    if (typeof window !== 'undefined' && (window as any).AndroidBridge) {
      (window as any).AndroidBridge.executeAction(actionType, payload)
      return true
    }
    return false
  }

  // ── Listen for Android Bridge Events ──
  useEffect(() => {
    const handleUnreadMessages = (e: any) => {
      try {
        const messagesStr = e.detail
        const messages = JSON.parse(messagesStr)
        if (messages.length === 0) {
          speak('You have no unread WhatsApp messages.')
          return
        }
        let text = `You have ${messages.length} unread messages. `
        messages.forEach((msg: any) => {
          text += `${msg.sender} sent: ${msg.message}. `
        })
        speak(text)
      } catch (err) {
        console.error('Error parsing unread messages:', err)
      }
    }
    
    if (typeof window !== 'undefined') {
      window.addEventListener('onUnreadMessages', handleUnreadMessages)
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('onUnreadMessages', handleUnreadMessages)
      }
    }
  }, [])

  // ── 1. Text to Speech (TTS) ──
  const speak = (text: string, callback?: () => void) => {
    console.log('[VoiceAssistant] Speaking:', text)
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (callback) callback()
      return
    }

    try {
      window.speechSynthesis.cancel() 
    } catch (e) {}

    const utterance = new SpeechSynthesisUtterance(text)
    isSpeakingRef.current = true

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

  // ── Execute System Command via SleepCycle API ──
  const executeSystemCommand = async (payload: any, retries = 1) => {
    let attempt = 0;
    while (attempt <= retries) {
      try {
        const res = await fetch('/api/system/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        const data = await res.json()
        if (data.success && data.message) {
          speak(data.message)
          return
        } else {
          if (attempt < retries) {
            console.warn(`[VoiceAssistant] Execution failed, retrying... (Attempt ${attempt + 1})`)
            attempt++
            // Short delay before retry
            await new Promise(r => setTimeout(r, 1000))
            continue
          }
          speak("Sir, main command execute nahi kar paya. System mein kuch error aaya hai.")
          return
        }
      } catch (e) {
        if (attempt < retries) {
          console.warn(`[VoiceAssistant] Network failed, retrying... (Attempt ${attempt + 1})`)
          attempt++
          await new Promise(r => setTimeout(r, 1000))
          continue
        }
        console.error(e)
        speak("Sir, connection error ki wajah se command fail ho gaya hai.")
        return
      }
    }
  }

  // ── 2. Handle Single Sub-Command ──
  const processSubCommand = async (cmd: string) => {
    const command = cmd.toLowerCase().trim()
    console.log('[VoiceAssistant] Processing subcommand:', command)

    // Wake words / greetings
    const wakeWords = ['hello', 'hi', 'sandeep sahab', 'assistant', 'sleepcycle', 'jarvis', 'hey jarvis']
    if (wakeWords.some(w => command === w || command.startsWith(w + ' '))) {
      speak('Ji Sir. Main ready hoon.')
      return
    }

    if (command.includes('who are you') || command.includes('tum kaun ho')) {
      speak('Main SleepCycle AI hoon, aapka personal operating system assistant.')
      return
    }

    // ── Module 6: Project Generation ──
    if (command.includes('project banao') || command.includes('react project')) {
      speak('Ji Sir. Project generate kar raha hoon...')
      await executeSystemCommand({ module: 'project_generator', action: 'create', projectType: 'react', projectName: 'NewAIProject' })
      return
    }

    // ── Module 9: File Manager ──
    if (command.match(/c drive open/i) || command.includes('open c drive')) {
      speak('Ji Sir. C Drive open kar raha hoon...')
      await executeSystemCommand({ module: 'file_manager', action: 'open', path: 'C:\\' })
      return
    }
    if (command.includes('folder banao') || command.includes('create folder')) {
      speak('Ji Sir. Folder bana raha hoon...')
      await executeSystemCommand({ module: 'file_manager', action: 'create_folder', path: 'C:\\SleepCycle_NewFolder' })
      return
    }
    if (command.includes('delete folder') || command.includes('folder delete karo')) {
      speak('Ji Sir. Folder delete kar raha hoon...')
      await executeSystemCommand({ module: 'file_manager', action: 'delete_folder', path: 'C:\\SleepCycle_NewFolder' })
      return
    }
    if (command.includes('rename folder') || command.includes('folder rename karo')) {
      speak('Ji Sir. Rename kar raha hoon...')
      await executeSystemCommand({ module: 'file_manager', action: 'rename', path: 'C:\\SleepCycle_NewFolder', destPath: 'C:\\SleepCycle_Renamed' })
      return
    }
    if (command.includes('open folder in vs code') || command.includes('vs code me open karo')) {
      speak('Ji Sir. VS Code me folder open kar raha hoon...')
      await executeSystemCommand({ module: 'file_manager', action: 'open_vscode', path: 'C:\\SleepCycle_NewFolder' })
      return
    }

    // ── Module 10: System Control ──
    if (command.includes('time kya hua hai') || command.includes('what is the time')) {
      await executeSystemCommand({ module: 'system_status', action: 'time' })
      return
    }
    if (command.includes('battery status') || command.includes('battery kitni hai')) {
      await executeSystemCommand({ module: 'system_status', action: 'battery' })
      return
    }
    if (command.includes('lock pc') || command.includes('pc lock karo')) {
      speak('Ji Sir. PC lock kar raha hoon...')
      await executeSystemCommand({ module: 'system_status', action: 'lock' })
      return
    }
    if (command.includes('restart pc') || command.includes('pc restart karo')) {
      speak('Ji Sir. System restart kar raha hoon...')
      await executeSystemCommand({ module: 'system_status', action: 'restart' })
      return
    }
    if (command.includes('open settings') || command.includes('settings open karo')) {
      speak('Ji Sir. Settings open kar raha hoon...')
      await executeSystemCommand({ module: 'system_status', action: 'settings' })
      return
    }

    // ── Module 11: Browser Automation ──
    if (command.includes('open chatgpt') || command.includes('chatgpt open karo')) {
      speak('Ji Sir. ChatGPT open kar raha hoon...')
      await executeSystemCommand({ module: 'system_status', action: 'browser', url: 'https://chat.openai.com' })
      return
    }
    if (command.includes('open deepseek') || command.includes('deepseek open karo')) {
      speak('Ji Sir. DeepSeek open kar raha hoon...')
      await executeSystemCommand({ module: 'system_status', action: 'browser', url: 'https://chat.deepseek.com' })
      return
    }
    if (command.includes('open youtube') || command.includes('youtube open karo')) {
      speak('Ji Sir. YouTube open kar raha hoon...')
      await executeSystemCommand({ module: 'system_status', action: 'browser', url: 'https://youtube.com' })
      return
    }
    if (command.includes('search google') || command.includes('google search karo')) {
      speak('Ji Sir. Google search kar raha hoon...')
      await executeSystemCommand({ module: 'system_status', action: 'browser', url: 'https://google.com' })
      return
    }

    // ── Module 7: Application Control (PC & Android) ──
    if (command.match(/open whatsapp/i) || command.includes('whatsapp open karo')) {
      speak('Ji Sir. WhatsApp open kar raha hoon...')
      if (!executeNativeAction('OPEN_APP', 'com.whatsapp')) {
        await executeSystemCommand({ module: 'app_control', action: 'open', appName: 'whatsapp' })
      } else {
        speak('WhatsApp open ho gaya.')
      }
      return
    }
    if (command.match(/open chrome/i) || command.includes('chrome open karo')) {
      speak('Ji Sir. Chrome open kar raha hoon...')
      await executeSystemCommand({ module: 'app_control', action: 'open', appName: 'chrome' })
      return
    }
    if (command.match(/open vs code/i) || command.includes('vs code open karo') || command.includes('open vscode')) {
      speak('Ji Sir. VS Code open kar raha hoon...')
      await executeSystemCommand({ module: 'app_control', action: 'open', appName: 'vscode' })
      return
    }
    if (command.match(/close whatsapp/i) || command.includes('whatsapp close karo')) {
      speak('Ji Sir. WhatsApp close kar raha hoon...')
      await executeSystemCommand({ module: 'app_control', action: 'close', appName: 'whatsapp' })
      return
    }
    
    // Fallback: Navigation
    if (command.includes('dashboard kholo')) {
      speak('Ji Sir. Dashboard open kar raha hoon.')
      router.push('/')
      return
    }
    if (command.includes('chup raho') || command.includes('stop listening')) {
      speak('Ji Sir. Assistant paused.')
      stopListening()
      return
    }

    speak(`Sir, "${cmd}" ke liye mere paas abhi protocol nahi hai.`)
  }

  // ── Multi-Step Task Planner ──
  const handleVoiceCommand = async (rawCommand: string) => {
    // Split by connecting words for multi-step execution
    const steps = rawCommand.split(/\baur\b|\band\b|\buske baad\b|\bthen\b/i).map(s => s.trim()).filter(s => s.length > 0)
    
    for (const step of steps) {
      await processSubCommand(step)
      // A small pause between steps could be added here if needed
    }
  }

  // ── 3. Start/Stop Safe Listeners ──
  const startListening = () => {
    shouldListenRef.current = true
    setIsListening(true)
    if (recognitionRef.current && !isStartedRef.current && !isSpeakingRef.current) {
      try {
        recognitionRef.current.start()
      } catch (e) {}
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
      speak('SleepCycle Assistant active.', () => {
        startListening()
      })
    } else {
      speak('SleepCycle Assistant paused.')
      stopListening()
    }
  }

  // ── 4. Initialize SpeechRecognition Lifecycle ──
  useEffect(() => {
    if (typeof window === 'undefined') return

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

    const playGreeting = () => {
      if (hasGreeted.current) return
      hasGreeted.current = true
      shouldListenRef.current = true
      speak('Welcome to SleepCycle AI. Hello Sandeep Sahab, bataiye main aapki kya help kar sakta hoon?')
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
            ? 'linear-gradient(135deg, #FF4B2B, #FF416C)'
            : 'rgba(20, 25, 45, 0.85)',
          color: isListening ? '#FFFFFF' : '#FF4B2B',
          border: isListening ? '2px solid #FF4B2B' : '1px solid rgba(255, 75, 43, 0.3)',
          boxShadow: isListening
            ? '0 0 25px rgba(255, 75, 43, 0.5), 0 4px 15px rgba(0,0,0,0.4)'
            : '0 4px 12px rgba(0,0,0,0.3)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
          backdropFilter: 'blur(10px)',
        }}
        title={isListening ? 'SleepCycle AI Active (Click to Pause)' : 'SleepCycle AI Paused (Click to Start)'}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
          <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
        </svg>
      </button>
    </div>
  )
}

import React from 'react'

export default function VoicePage() {
  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Voice Assistant</h1>
          <p className="page-subtitle">Control the AI Operating System with your voice</p>
        </div>
      </div>
      
      <div className="empty-state">
        <div className="empty-state-icon">🎤</div>
        <h3 className="empty-state-title">Voice Module Loading</h3>
        <p className="empty-state-sub">Global voice commands are active. Try saying "Open Dashboard"!</p>
      </div>
    </div>
  )
}

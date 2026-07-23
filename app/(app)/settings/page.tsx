import React from 'react'
import ThemeToggle from '@/components/ThemeToggle'

export default function SettingsPage() {
  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Configure your AI Operating System</p>
        </div>
      </div>
      
      <div className="card" style={{ maxWidth: '600px' }}>
        <h3 style={{ marginBottom: '16px' }}>System Preferences</h3>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
          <div>
            <div style={{ fontWeight: 600 }}>Theme Mode</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Toggle between light and dark themes.</div>
          </div>
          <ThemeToggle />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
          <div>
            <div style={{ fontWeight: 600 }}>Voice Assistant</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Enable global voice commands and readouts.</div>
          </div>
          <div className="badge badge-active">Enabled</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0' }}>
          <div>
            <div style={{ fontWeight: 600 }}>WhatsApp Sync</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Mock mode enabled for syncing chats.</div>
          </div>
          <div className="badge badge-pending">Mock Mode</div>
        </div>
      </div>
    </div>
  )
}

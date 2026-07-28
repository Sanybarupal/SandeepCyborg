'use client'

import { useState } from 'react'
import { Icons } from '@/components/Icons'

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      style={{
        width: 48, height: 26, borderRadius: 13,
        background: enabled ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
        border: 'none', cursor: 'pointer', position: 'relative',
        transition: 'background 0.3s',
        boxShadow: enabled ? '0 0 12px var(--primary-glow)' : 'none',
      }}
    >
      <div style={{
        position: 'absolute', top: 3, left: enabled ? 25 : 3,
        width: 20, height: 20, borderRadius: '50%',
        background: 'white', transition: 'left 0.3s',
        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
      }} />
    </button>
  )
}

function SettingRow({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '18px 0', borderBottom: '1px solid var(--border)',
    }}>
      <div>
        <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 2 }}>{title}</div>
        {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{sub}</div>}
      </div>
      {children}
    </div>
  )
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{
      background: 'var(--panel)', backdropFilter: 'blur(16px)',
      border: '1px solid var(--border)', borderRadius: 'var(--radius)',
      overflow: 'hidden', marginBottom: 20,
    }}>
      <div style={{
        padding: '18px 24px', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 10,
        background: 'rgba(255,255,255,0.02)',
      }}>
        <div style={{ color: 'var(--primary)' }}>{icon}</div>
        <span style={{ fontFamily: 'var(--font-hero)', fontSize: 11, fontWeight: 600, letterSpacing: '1.5px', color: 'var(--text-muted)' }}>
          {title}
        </span>
      </div>
      <div style={{ padding: '0 24px' }}>
        {children}
        {/* remove last border */}
        <div style={{ height: 1 }} />
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [whatsappSync, setWhatsappSync] = useState(true)
  const [notifications, setNotifications] = useState(true)
  const [autoApprove, setAutoApprove] = useState(false)
  const [darkMode, setDarkMode] = useState(true)
  const [aiModel, setAiModel] = useState('gpt-4')
  const [language, setLanguage] = useState('en')

  const selectStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
    borderRadius: 8, padding: '8px 14px', color: 'var(--text)',
    fontSize: 13, outline: 'none', cursor: 'pointer',
    minWidth: 160,
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Configure your AI Operating System</p>
        </div>
        <div className="page-header-actions">
          <button className="btn-primary">Save Changes</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Left Column */}
        <div>
          {/* Profile */}
          <Section title="PROFILE" icon={Icons.user}>
            <div style={{ padding: '20px 0', display: 'flex', alignItems: 'center', gap: 16, borderBottom: '1px solid var(--border)' }}>
              <div style={{ position: 'relative' }}>
                <img
                  src="https://ui-avatars.com/api/?name=Sandeep+Kumar&background=4F8CFF&color=fff&size=72"
                  style={{ width: 64, height: 64, borderRadius: 16, border: '2px solid rgba(79,140,255,0.3)' }}
                  alt="Avatar"
                />
                <div style={{ position: 'absolute', bottom: -2, right: -2, width: 14, height: 14, background: 'var(--green)', borderRadius: '50%', border: '2px solid var(--bg)' }} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 16 }}>Sandeep Kumar</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>sandeep@aioperatingsystem.com</div>
                <div style={{ fontSize: 11, color: 'var(--primary)', marginTop: 4 }}>Admin · AI OS Owner</div>
              </div>
            </div>
            <SettingRow title="Full Name" sub="Your display name across the system">
              <input defaultValue="Sandeep Kumar" style={{ ...selectStyle, minWidth: 200 }} />
            </SettingRow>
            <SettingRow title="Email Address" sub="Used for system notifications">
              <input defaultValue="sandeep@aioperatingsystem.com" style={{ ...selectStyle, minWidth: 220 }} />
            </SettingRow>
          </Section>

          {/* AI Configuration */}
          <Section title="AI CONFIGURATION" icon={Icons.bolt}>
            <SettingRow title="AI Model" sub="Default model for AI conversations">
              <select value={aiModel} onChange={e => setAiModel(e.target.value)} style={selectStyle}>
                <option value="gpt-4">GPT-4 Turbo</option>
                <option value="gpt-3.5">GPT-3.5</option>
                <option value="claude">Claude 3 Opus</option>
                <option value="gemini">Gemini Pro</option>
              </select>
            </SettingRow>
            <SettingRow title="Voice Assistant" sub="Enable global voice control">
              <Toggle enabled={voiceEnabled} onChange={setVoiceEnabled} />
            </SettingRow>
            <SettingRow title="Auto-Approve Low Priority" sub="AI auto-approves routine actions">
              <Toggle enabled={autoApprove} onChange={setAutoApprove} />
            </SettingRow>
            <SettingRow title="Response Language" sub="Primary language for AI responses">
              <select value={language} onChange={e => setLanguage(e.target.value)} style={selectStyle}>
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="es">Spanish</option>
              </select>
            </SettingRow>
          </Section>
        </div>

        {/* Right Column */}
        <div>
          {/* Integrations */}
          <Section title="INTEGRATIONS" icon={Icons.api}>
            {[
              { label: 'WhatsApp Business', sub: 'Message sync & automation', enabled: whatsappSync, set: setWhatsappSync, color: 'var(--green)' },
              { label: 'OpenAI API', sub: 'GPT-4 powered responses', enabled: true, set: () => {}, color: 'var(--purple-light)' },
              { label: 'GitHub', sub: 'Repository sync for Web Builder', enabled: true, set: () => {}, color: 'var(--text)' },
              { label: 'Vercel', sub: 'Deployment automation', enabled: false, set: () => {}, color: 'var(--text-muted)' },
            ].map((item, i) => (
              <SettingRow key={i} title={item.label} sub={item.sub}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    fontSize: 10, padding: '3px 8px', borderRadius: 4, fontWeight: 600, letterSpacing: '0.5px',
                    background: item.enabled ? 'rgba(34,197,94,0.1)' : 'rgba(100,116,139,0.1)',
                    color: item.enabled ? 'var(--green)' : 'var(--text-muted)',
                    border: `1px solid ${item.enabled ? 'rgba(34,197,94,0.2)' : 'rgba(100,116,139,0.15)'}`,
                  }}>
                    {item.enabled ? 'CONNECTED' : 'DISCONNECTED'}
                  </span>
                </div>
              </SettingRow>
            ))}
          </Section>

          {/* Notifications */}
          <Section title="NOTIFICATIONS" icon={Icons.bell}>
            <SettingRow title="System Notifications" sub="Alerts for system events">
              <Toggle enabled={notifications} onChange={setNotifications} />
            </SettingRow>
            <SettingRow title="WhatsApp Alerts" sub="New message notifications">
              <Toggle enabled={true} onChange={() => {}} />
            </SettingRow>
            <SettingRow title="Approval Reminders" sub="Pending approval notifications">
              <Toggle enabled={true} onChange={() => {}} />
            </SettingRow>
          </Section>

          {/* Appearance */}
          <Section title="APPEARANCE" icon={Icons.moon}>
            <SettingRow title="Dark Mode" sub="Toggle between light and dark theme">
              <Toggle enabled={darkMode} onChange={setDarkMode} />
            </SettingRow>
            <SettingRow title="Sidebar Default" sub="Expanded or collapsed on load">
              <select style={selectStyle}>
                <option>Expanded</option>
                <option>Collapsed</option>
              </select>
            </SettingRow>
          </Section>

          {/* Danger Zone */}
          <div style={{
            background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.15)',
            borderRadius: 'var(--radius)', padding: 24,
          }}>
            <div style={{ fontFamily: 'var(--font-hero)', fontSize: 11, letterSpacing: '1.5px', color: 'var(--red)', marginBottom: 16 }}>DANGER ZONE</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 500, fontSize: 14 }}>Reset All Settings</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>This will reset all configuration to defaults</div>
              </div>
              <button style={{
                padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                background: 'rgba(239,68,68,0.1)', color: 'var(--red)',
                border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer',
              }}>
                Reset Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

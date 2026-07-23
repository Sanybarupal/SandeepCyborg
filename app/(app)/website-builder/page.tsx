import React from 'react'

export default function WebsiteBuilderPage() {
  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Website Builder</h1>
          <p className="page-subtitle">Automatically generate websites using AI</p>
        </div>
      </div>
      
      <div className="empty-state">
        <div className="empty-state-icon">🌐</div>
        <h3 className="empty-state-title">Coming Soon</h3>
        <p className="empty-state-sub">Phase 4 feature: Website generation module is currently under development.</p>
      </div>
    </div>
  )
}

'use client'

import { Icons } from '@/components/Icons'

export default function AnalyticsPage() {
  const metrics = [
    { label: 'Total Revenue', value: '₹4.8L', trend: '+22%', color: 'green' },
    { label: 'Active Clients', value: '1,102', trend: '+12.5%', color: 'blue' },
    { label: 'AI Conversations', value: '3,562', trend: '+18.6%', color: 'purple' },
    { label: 'Avg Response Time', value: '1.2s', trend: '-0.3s', color: 'cyan' },
  ]

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Insights and performance metrics</p>
        </div>
        <div className="page-header-actions">
          <button className="btn-outline">{Icons.download} Export Report</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {metrics.map((m, i) => (
          <div key={i} className="glass-card-static" style={{ padding: 20 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>{m.label}</div>
            <div style={{ fontFamily: 'var(--font-head)', fontSize: 26, fontWeight: 700, marginBottom: 4 }}>{m.value}</div>
            <div style={{ fontSize: 12, color: 'var(--green)', background: 'rgba(34,197,94,0.1)', padding: '2px 8px', borderRadius: 4, width: 'fit-content' }}>{m.trend}</div>
          </div>
        ))}
      </div>

      <div className="glass-card-static" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400, flexDirection: 'column', gap: 16 }}>
        <div style={{ color: 'var(--primary)', opacity: 0.4 }}>{Icons.chart}</div>
        <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-muted)' }}>Analytics Dashboard</div>
        <div style={{ fontSize: 14, color: 'var(--text-muted)', textAlign: 'center', maxWidth: 400 }}>
          Detailed charts and visualizations are being loaded. Connect your data source to see live analytics.
        </div>
      </div>
    </div>
  )
}

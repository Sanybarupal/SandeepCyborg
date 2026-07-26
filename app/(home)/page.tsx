'use client'

import { useEffect, useRef, useState } from 'react'

// ── Inline SVG Icons ────────────────────────────────────────────────────────
const Icons = {
  whatsapp: <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>,
  github: <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>,
  openai: <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0L4.001 14.5a4.5 4.5 0 0 1-1.661-6.603zm16.597 3.855l-5.843-3.369 2.019-1.168a.076.076 0 0 1 .071 0l4.816 2.801a4.5 4.5 0 0 1-.676 8.105v-5.677a.79.79 0 0 0-.387-.692zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.814-2.772a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/></svg>,
  react: <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38a2.167 2.167 0 0 0-1.092-.278zm-.005 1.09v.006c.316 0 .57.053.769.165.847.489 1.218 2.367.872 4.9-.102.694-.272 1.435-.478 2.188a19.619 19.619 0 0 0-3.013-.048 19.292 19.292 0 0 0-2.505-2.318c-.663-.891-1.177-1.76-1.476-2.548-.302-.795-.316-1.437-.1-1.897.218-.46.666-.728 1.326-.728zm-9.441 1.09h.005c.323 0 .79.344 1.327.974-.5.638-.975 1.335-1.476 2.547-.9.663-1.76 1.376-2.504 2.318a19.618 19.618 0 0 0-2.013.048c-.206-.753-.376-1.494-.478-2.188-.346-2.532.026-4.41.873-4.9.198-.11.452-.164.766-.164h.5zm4.714 2.21a14.8 14.8 0 0 1 .756.061 13.61 13.61 0 0 1 .747.094 14.01 14.01 0 0 1-.747.094 14.8 14.8 0 0 1-.756.061zm0 1.454a30.19 30.19 0 0 1 1.74.162c.58.78 1.157 1.627 1.71 2.53.554.9 1.056 1.817 1.5 2.725-.444.91-.946 1.82-1.5 2.72-.553.902-1.13 1.75-1.71 2.53a30.19 30.19 0 0 1-1.74.163 30.19 30.19 0 0 1-1.74-.163c-.58-.78-1.157-1.628-1.71-2.53-.554-.9-1.056-1.81-1.5-2.72.444-.908.946-1.825 1.5-2.724.553-.903 1.13-1.75 1.71-2.53a30.19 30.19 0 0 1 1.74-.163zm4.5.61a19.28 19.28 0 0 1 1.476 2.547c.9.663 1.76 1.376 2.504 2.318.672.9 1.198 1.79 1.476 2.548.302.795.316 1.437.1 1.897-.218.46-.666.728-1.326.728-.316 0-.57-.052-.77-.165-.847-.489-1.217-2.367-.872-4.9.102-.694.272-1.434.478-2.187a19.619 19.619 0 0 0-3.013-.048 19.29 19.29 0 0 0-2.505-2.318zm-9.002 0a19.29 19.29 0 0 0-2.504 2.318 19.619 19.619 0 0 0-3.013.048c.206-.753.376-1.493.478-2.187.346-2.533-.026-4.411-.873-4.9-.198-.113-.453-.165-.766-.165-.66 0-1.108.268-1.327.728-.218.46-.201 1.102.101 1.897z"/></svg>,
  node: <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M11.998 24c-.321 0-.641-.084-.922-.247l-2.936-1.737c-.438-.245-.224-.332-.08-.383.585-.203.703-.25 1.328-.604.065-.037.151-.023.218.017l2.256 1.339c.082.045.197.045.272 0l8.795-5.076c.082-.047.134-.141.134-.238V6.921c0-.099-.053-.192-.137-.242l-8.791-5.072c-.081-.047-.189-.047-.271 0L3.075 6.68C2.99 6.729 2.936 6.825 2.936 6.921v10.15c0 .097.054.189.139.235l2.409 1.392c1.307.654 2.108-.116 2.108-.89V7.787c0-.142.114-.253.256-.253h1.115c.139 0 .255.112.255.253v10.021c0 1.745-.95 2.745-2.604 2.745-.508 0-.909 0-2.026-.551L1.677 18.507c-.57-.329-.922-.945-.922-1.604V6.921c0-.659.353-1.275.922-1.603l8.795-5.082c.557-.315 1.296-.315 1.848 0l8.794 5.082c.57.329.924.944.924 1.603v10.15c0 .659-.354 1.273-.924 1.604l-8.794 5.078C12.643 23.916 12.324 24 11.998 24z"/></svg>,
  database: <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><ellipse cx="12" cy="5" rx="9" ry="3" fill="currentColor"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" fill="none" stroke="currentColor" strokeWidth="2"/></svg>,
  mic: <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>,
  globe: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="20" height="20"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  bell: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  dashboard: <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>,
  clients: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  bolt: <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  chat: <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  upload: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>,
  shield: <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  folder: <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
  chart: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="18" height="18"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  settings: <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><circle cx="12" cy="12" r="3"/><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94L14.4 2.81c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41L9.25 5.35C8.66 5.59 8.12 5.92 7.63 6.29L5.24 5.33c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58z"/></svg>,
  check: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="12" height="12"><polyline points="20 6 9 17 4 12"/></svg>,
  arrow: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  play: <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  automation: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>,
  cpu: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>,
  voice: <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>,
}

// ── Counter hook ─────────────────────────────────────────────────────────────
function useCounter(target: number, duration = 2000) {
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting && !started) setStarted(true) }, { threshold: 0.3 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [started])
  useEffect(() => {
    if (!started) return
    let s = 0; const step = target / (duration / 16)
    const iv = setInterval(() => {
      s += step; if (s >= target) { setCount(target); clearInterval(iv) } else setCount(Math.floor(s))
    }, 16)
    return () => clearInterval(iv)
  }, [started, target, duration])
  return { count, ref }
}

// ── StatCard ─────────────────────────────────────────────────────────────────
function StatCard({ icon, value, label, color, sparkColor, sparkPath, trend }: any) {
  const { count, ref } = useCounter(value)
  const display = value >= 1000 ? count.toLocaleString() : count
  return (
    <div ref={ref} className={`sc sc--${color}`}>
      <div className="sc__top">
        <div className={`sc__icon sci--${color}`}>{icon}</div>
        <span className="sc__trend">{trend}</span>
      </div>
      <div className="sc__val">{display}</div>
      <div className="sc__lbl">{label}</div>
      <svg className="sc__spark" viewBox="0 0 100 30" preserveAspectRatio="none">
        <defs><linearGradient id={`g-${color}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={sparkColor} stopOpacity="0.5"/><stop offset="100%" stopColor={sparkColor} stopOpacity="0"/></linearGradient></defs>
        <path d={sparkPath + ' L100,30 L0,30 Z'} fill={`url(#g-${color})`}/>
        <path d={sparkPath} fill="none" stroke={sparkColor} strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    </div>
  )
}

// ── ProgressBar ──────────────────────────────────────────────────────────────
function ProgressBar({ label, value, color }: any) {
  const [w, setW] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setTimeout(() => setW(value), 300) }, { threshold: 0.3 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [value])
  return (
    <div ref={ref} className="pb">
      <div className="pb__head"><span className="pb__lbl">{label}</span><span className={`pb__val pv--${color}`}>{value}%</span></div>
      <div className="pb__track"><div className={`pb__fill pf--${color}`} style={{ width: `${w}%`, transition: 'width 1.4s cubic-bezier(.4,0,.2,1)' }}/></div>
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function MobileHomePage() {
  const [activeNav, setActiveNav] = useState('dashboard')
  const [micActive, setMicActive] = useState(false)
  const [time, setTime] = useState('')

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }))
    tick(); const iv = setInterval(tick, 1000); return () => clearInterval(iv)
  }, [])

  const stats = [
    { icon: Icons.clients, value: 1248, label: 'Active Clients', color: 'blue', sparkColor: '#4F8CFF', sparkPath: 'M0,25 C15,18 25,22 40,10 C55,0 65,8 80,5 C90,3 95,2 100,1', trend: '↑ 12.5%' },
    { icon: Icons.chat, value: 3562, label: 'AI Chats', color: 'purple', sparkColor: '#8B5CF6', sparkPath: 'M0,26 C12,16 22,22 35,12 C50,2 62,9 75,4 C85,1 92,0 100,0', trend: '↑ 18.6%' },
    { icon: Icons.voice, value: 486, label: 'Voice Commands', color: 'cyan', sparkColor: '#00E5FF', sparkPath: 'M0,28 C10,22 20,26 35,14 C50,4 60,10 75,7 C85,4 92,2 100,2', trend: '↑ 15.2%' },
    { icon: Icons.bolt, value: 12458, label: 'AI Requests', color: 'orange', sparkColor: '#F97316', sparkPath: 'M0,26 C10,16 18,12 30,14 C45,5 55,10 70,3 C80,8 88,5 100,1', trend: '↑ 23.1%' },
    { icon: Icons.chart, value: 287, label: 'Projects', color: 'green', sparkColor: '#22C55E', sparkPath: 'M0,28 C12,24 22,20 35,22 C48,12 60,15 72,8 C82,3 90,1 100,0', trend: '↑ 8.3%' },
    { icon: Icons.shield, value: 99, label: 'System Uptime %', color: 'teal', sparkColor: '#06B6D4', sparkPath: 'M0,3 C15,2 30,3 45,2 C60,1 75,2 90,2 C95,2 98,1 100,1', trend: '99.9%' },
  ]

  const features = [
    { icon: Icons.whatsapp, label: 'WhatsApp', sub: 'AI Automation', color: 'green' },
    { icon: Icons.chat, label: 'AI Chat', sub: 'Smart Agents', color: 'purple' },
    { icon: Icons.voice, label: 'Voice AI', sub: 'Commands', color: 'blue' },
    { icon: Icons.shield, label: 'Approvals', sub: 'Workflow', color: 'orange' },
    { icon: Icons.upload, label: 'Upload', sub: 'File Manager', color: 'cyan' },
    { icon: Icons.globe, label: 'Web Builder', sub: 'Deploy Fast', color: 'pink' },
    { icon: Icons.automation, label: 'Automation', sub: 'No-Code', color: 'teal' },
    { icon: Icons.chart, label: 'Reports', sub: 'Analytics', color: 'yellow' },
  ]

  const activity = [
    { icon: Icons.whatsapp, title: 'WhatsApp Connected', sub: '320 messages synced', time: '2m ago', color: 'green', ok: true },
    { icon: Icons.clients, title: 'New Client Added', sub: 'Rahul Sharma — Enterprise', time: '8m ago', color: 'blue', ok: true },
    { icon: Icons.folder, title: 'Proposal Sent', sub: 'AI Dashboard Package ₹45K', time: '25m ago', color: 'purple', ok: true },
    { icon: Icons.voice, title: 'Voice Command', sub: '"Show me today\'s stats"', time: '1h ago', color: 'cyan', ok: true },
    { icon: Icons.bolt, title: 'Payment Received', sub: '₹1,20,000 — Zepto Corp', time: '2h ago', color: 'green', ok: true },
    { icon: Icons.shield, title: 'Approval Pending', sub: 'Contract #2847 awaiting', time: '3h ago', color: 'orange', ok: false },
  ]

  const systemStatus = [
    { label: 'AI Engine', value: 100, color: 'blue' },
    { label: 'WhatsApp', value: 100, color: 'green' },
    { label: 'Voice System', value: 100, color: 'purple' },
    { label: 'API Services', value: 100, color: 'cyan' },
    { label: 'Database', value: 98, color: 'orange' },
    { label: 'CPU Usage', value: 34, color: 'teal' },
    { label: 'Memory', value: 67, color: 'pink' },
  ]

  const orbitIcons = [
    { icon: Icons.whatsapp, label: 'WhatsApp', color: 'orbit-green', angle: 0 },
    { icon: Icons.github, label: 'GitHub', color: 'orbit-white', angle: 45 },
    { icon: Icons.openai, label: 'OpenAI', color: 'orbit-purple', angle: 90 },
    { icon: Icons.react, label: 'React', color: 'orbit-cyan', angle: 135 },
    { icon: Icons.node, label: 'Node.js', color: 'orbit-green', angle: 180 },
    { icon: Icons.database, label: 'Database', color: 'orbit-orange', angle: 225 },
    { icon: Icons.mic, label: 'Voice AI', color: 'orbit-blue', angle: 270 },
    { icon: Icons.globe, label: 'Web Builder', color: 'orbit-pink', angle: 315 },
  ]

  return (
    <div className="mob">

      {/* ── Background ──────────────────────────────────────── */}
      <div className="mob-bg">
        <div className="mob-bg-grid" />
        <div className="mob-bg-grad" />
        <div className="mob-bg-wave1" />
        <div className="mob-bg-wave2" />
        {Array.from({ length: 50 }).map((_, i) => (
          <div key={i} className="mob-star" style={{
            left: `${(i * 7.3 + 13) % 100}%`,
            top: `${(i * 11.7 + 5) % 100}%`,
            width: `${(i % 3) + 1}px`,
            height: `${(i % 3) + 1}px`,
            animationDelay: `${(i * 0.3) % 5}s`,
            animationDuration: `${2 + (i % 3)}s`,
          }} />
        ))}
        {Array.from({ length: 15 }).map((_, i) => (
          <div key={i} className="mob-particle" style={{
            left: `${(i * 13.7 + 7) % 100}%`,
            top: `${(i * 19.3 + 11) % 100}%`,
            animationDelay: `${(i * 0.7) % 6}s`,
          }} />
        ))}
      </div>

      {/* ── Scrollable ──────────────────────────────────────── */}
      <div className="mob-content">

        {/* Status Bar */}
        <div className="mob-sbar">
          <span className="mob-sbar-time">{time || '09:41'}</span>
          <div className="mob-sbar-icons">
            <div className="mob-signal">
              {[4,7,10,13].map((h,i)=><div key={i} className="mob-signal-bar" style={{height:h}}/>)}
            </div>
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="14"><rect x="1" y="6" width="18" height="12" rx="2" fill="none" stroke="white" strokeWidth="2"/><line x1="23" y1="13" x2="23" y2="11" stroke="white" strokeWidth="2" strokeLinecap="round"/><rect x="3" y="8" width="14" height="8" rx="1" fill="white"/></svg>
          </div>
        </div>

        {/* Dynamic Island */}
        <div className="mob-island">
          <div className="mob-island-dot" />
          <span>AI OS Active</span>
          <div className="mob-island-pulse" />
        </div>

        {/* Header */}
        <header className="mob-header">
          <div className="mob-logo">
            <div className="mob-logo-icon">{Icons.cpu}</div>
            <div>
              <div className="mob-logo-name">Sandeep Clone</div>
              <div className="mob-logo-tag">AI OS</div>
            </div>
          </div>
          <div className="mob-header-right">
            <div className="mob-online-pill">
              <span className="mob-online-dot" />
              Online
            </div>
            <button className="mob-icon-btn" aria-label="Notifications">
              {Icons.bell}
              <span className="mob-notif-badge">3</span>
            </button>
            <div className="mob-avatar">
              <img src="https://ui-avatars.com/api/?name=Sandeep+Kumar&background=4F8CFF&color=fff&bold=true&size=40" alt="Sandeep Kumar" />
              <div className="mob-avatar-ring" />
            </div>
          </div>
        </header>

        {/* Greeting */}
        <section className="mob-greeting">
          <div>
            <div className="mob-greeting-sub">Good Evening, Sandeep 👋</div>
            <h1 className="mob-greeting-title">Your AI is <span className="mob-grad-text">Ready</span></h1>
          </div>
          <div className="mob-wa-pill">
            <span className="mob-wa-icon">{Icons.whatsapp}</span>
            <span>WhatsApp</span>
            <span className="mob-wa-conn">Connected</span>
          </div>
        </section>

        {/* ── AI Globe ───────────────────────────────────────── */}
        <section className="mob-globe-wrap">
          <div className="mob-globe">
            {/* Rings */}
            <div className="mob-ring r1" /><div className="mob-ring r2" /><div className="mob-ring r3" /><div className="mob-ring r4" />

            {/* Orbit Icons */}
            {orbitIcons.map((item, i) => {
              const rad = (item.angle * Math.PI) / 180
              const r = 115
              const x = r * Math.cos(rad - Math.PI / 2)
              const y = r * Math.sin(rad - Math.PI / 2)
              return (
                <div key={i} className={`mob-orb-icon ${item.color}`}
                  style={{ transform: `translate(calc(50% + ${x}px - 20px), calc(50% + ${y}px - 20px))`, animationDelay: `${i*0.15}s` }}
                  title={item.label}>
                  {item.icon}
                </div>
              )
            })}

            {/* Core */}
            <div className="mob-globe-core">
              <div className="mob-core-glow" />
              <div className="mob-core-sphere">
                <div className="mob-core-lat" />
                <div className="mob-core-lon" />
              </div>
              <div className="mob-core-label">
                <div className="mob-core-ai">AI</div>
                <div className="mob-core-sub">CORE</div>
              </div>
            </div>

            {/* Floating particles */}
            {Array.from({length:12}).map((_,i)=>(
              <div key={i} className="mob-gp" style={{ left:`${30+(i*5.3)%40}%`, top:`${30+(i*7.1)%40}%`, animationDelay:`${(i*0.4)%3}s` }} />
            ))}
          </div>

          <div className="mob-globe-status">
            <span className="mob-gstatus-dot" />
            <span>System Online · All AI Services Running Smoothly</span>
          </div>
        </section>

        {/* ── Headline ───────────────────────────────────────── */}
        <section className="mob-headline">
          <div className="mob-headline-kicker">AI POWERED. AUTOMATION DRIVEN.</div>
          <h2 className="mob-headline-h2">
            YOUR PERSONAL<br/>
            <span className="mob-grad-text mob-grad-lg">AI OPERATING SYSTEM</span>
          </h2>
          <p className="mob-headline-p">
            Control WhatsApp, Clients, AI Agents, Voice Commands and Business Automation from one intelligent dashboard.
          </p>
        </section>

        {/* ── CTA ────────────────────────────────────────────── */}
        <section className="mob-cta">
          <button className="mob-btn-primary">
            <div className="mob-btn-glow" />
            <span>Launch AI Clone</span>
            {Icons.arrow}
          </button>
          <button className="mob-btn-sec">
            {Icons.play}
            <span>Watch Demo</span>
          </button>
        </section>

        {/* ── Stats ──────────────────────────────────────────── */}
        <section className="mob-sec">
          <div className="mob-sec-head">
            <h3 className="mob-sec-title">Quick Stats</h3>
            <button className="mob-sec-link">View All →</button>
          </div>
          <div className="mob-stats-row">
            {stats.map((s, i) => <StatCard key={i} {...s} />)}
          </div>
        </section>

        {/* ── Features ───────────────────────────────────────── */}
        <section className="mob-sec">
          <div className="mob-sec-head">
            <h3 className="mob-sec-title">Features</h3>
            <button className="mob-sec-link">All →</button>
          </div>
          <div className="mob-feat-row">
            {features.map((f, i) => (
              <div key={i} className={`mob-feat fc--${f.color}`}>
                <div className={`mob-feat-icon fi--${f.color}`}>{f.icon}</div>
                <div className="mob-feat-lbl">{f.label}</div>
                <div className="mob-feat-sub">{f.sub}</div>
                <div className="mob-feat-glow" />
              </div>
            ))}
          </div>
        </section>

        {/* ── AI Assistant ───────────────────────────────────── */}
        <section className="mob-sec mob-pad">
          <div className="mob-ai-card">
            <div className="mob-ai-head">
              <div className="mob-ai-title">{Icons.bolt}<span>AI ASSISTANT</span></div>
              <div className="mob-ai-active"><span className="mob-ai-pulse" />Active</div>
            </div>
            <div className="mob-waveform">
              {Array.from({length:28}).map((_,i)=>(
                <div key={i} className="mob-wave-bar" style={{animationDelay:`${i*0.07}s`}} />
              ))}
            </div>
            <div className="mob-ai-text">
              <div className="mob-ai-listening">Listening...</div>
              <div className="mob-ai-prompt">How can I assist you today?</div>
            </div>
            <button className={`mob-speak ${micActive?'mob-speak--on':''}`} onClick={()=>setMicActive(!micActive)}>
              <div className="mob-speak-r1" /><div className="mob-speak-r2" />
              {Icons.mic}
              <span>{micActive ? 'Listening...' : 'Speak Now'}</span>
            </button>
          </div>
        </section>

        {/* ── Activity ───────────────────────────────────────── */}
        <section className="mob-sec mob-pad">
          <div className="mob-sec-head">
            <h3 className="mob-sec-title">Recent Activity</h3>
            <button className="mob-sec-link">View All →</button>
          </div>
          <div className="mob-timeline">
            {activity.map((a, i) => (
              <div key={i} className="mob-tl-item">
                <div className="mob-tl-left">
                  <div className={`mob-tl-dot tld--${a.color}`}>{a.ok ? Icons.check : '!'}</div>
                  {i < activity.length - 1 && <div className="mob-tl-line" />}
                </div>
                <div className="mob-tl-card">
                  <div className={`mob-tl-icon tli--${a.color}`}>{a.icon}</div>
                  <div className="mob-tl-body">
                    <div className="mob-tl-title">{a.title}</div>
                    <div className="mob-tl-sub">{a.sub}</div>
                  </div>
                  <div className="mob-tl-time">{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── System Status ──────────────────────────────────── */}
        <section className="mob-sec mob-pad">
          <div className="mob-sec-head">
            <h3 className="mob-sec-title">System Status</h3>
            <div className="mob-all-good"><span className="mob-ag-dot" />All Good</div>
          </div>
          <div className="mob-sys">
            <div className="mob-sys-top">
              <div className="mob-sys-overall-dot" />
              <div>
                <div className="mob-sys-main">All Systems Operational</div>
                <div className="mob-sys-sub">99.9% Uptime · Last checked: now</div>
              </div>
            </div>
            {systemStatus.map((s,i) => <ProgressBar key={i} {...s} />)}
          </div>
        </section>

        {/* ── Quick Actions ──────────────────────────────────── */}
        <section className="mob-sec mob-pad">
          <div className="mob-sec-head">
            <h3 className="mob-sec-title">Quick Actions</h3>
          </div>
          <div className="mob-actions">
            {[
              { icon: Icons.clients, label: 'New Client', sub: 'Add to system', color: 'blue' },
              { icon: Icons.whatsapp, label: 'Send Message', sub: 'WhatsApp AI', color: 'green' },
              { icon: Icons.chat, label: 'AI Chat', sub: 'Start session', color: 'purple' },
              { icon: Icons.upload, label: 'Upload File', sub: 'Documents', color: 'cyan' },
              { icon: Icons.chart, label: 'Reports', sub: 'View insights', color: 'orange' },
              { icon: Icons.settings, label: 'Settings', sub: 'Configure', color: 'teal' },
            ].map((a,i)=>(
              <button key={i} className={`mob-act mob-act--${a.color}`}>
                <div className={`mob-act-icon mai--${a.color}`}>{a.icon}</div>
                <div className="mob-act-lbl">{a.label}</div>
                <div className="mob-act-sub">{a.sub}</div>
              </button>
            ))}
          </div>
        </section>

        <div style={{height:'120px'}} />
      </div>

      {/* ── FAB Mic ─────────────────────────────────────────── */}
      <button className={`mob-fab ${micActive?'mob-fab--on':''}`} onClick={()=>setMicActive(!micActive)} aria-label="Voice">
        <div className="mob-fab-r1" /><div className="mob-fab-r2" /><div className="mob-fab-r3" />
        <div className="mob-fab-inner">{Icons.mic}</div>
      </button>

      {/* ── Bottom Nav ──────────────────────────────────────── */}
      <nav className="mob-nav">
        <div className="mob-nav-glass" />
        {[
          { id:'dashboard', icon:Icons.dashboard, lbl:'Dashboard' },
          { id:'clients', icon:Icons.clients, lbl:'Clients' },
          { id:'ai', icon:null, lbl:'AI', center:true },
          { id:'voice', icon:Icons.voice, lbl:'Voice' },
          { id:'settings', icon:Icons.settings, lbl:'Settings' },
        ].map(item => item.center ? (
          <div key={item.id} className="mob-nav-center" />
        ) : (
          <button key={item.id} className={`mob-nav-item ${activeNav===item.id?'mob-nav--active':''}`} onClick={()=>setActiveNav(item.id)}>
            <div className="mob-nav-icon">{item.icon}</div>
            <span className="mob-nav-lbl">{item.lbl}</span>
            {activeNav===item.id && <div className="mob-nav-ind" />}
          </button>
        ))}
      </nav>

    </div>
  )
}

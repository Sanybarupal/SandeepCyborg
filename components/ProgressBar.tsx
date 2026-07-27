'use client'

import { useEffect, useRef, useState } from 'react'
import { Icons } from './Icons'

export function ProgressBar({ label, value, color }: any) {
  const [w, setW] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setTimeout(() => setW(value), 300) }, { threshold: 0.3 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [value])
  return (
    <div ref={ref} className="pb">
      <div className="pb__head">
        <span className="pb__lbl">
          <span className={`pb__chk pb__chk--${color}`}>{Icons.check}</span> {label}
        </span>
        <span className={`pb__val pv--${color}`}>{value}%</span>
      </div>
      <div className="pb__track"><div className={`pb__fill pf--${color}`} style={{ width: `${w}%`, transition: 'width 1.4s cubic-bezier(.4,0,.2,1)' }}/></div>
    </div>
  )
}

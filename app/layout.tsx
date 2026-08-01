import type { Metadata, Viewport } from 'next'
import './globals.css'
import { DesktopShell } from '../components/DesktopShell'
import { MobileShell } from '../components/MobileShell'
import VoiceAssistant from '../components/VoiceAssistant'

export const metadata: Metadata = {
  title: 'Sandeep Clone — AI Operating System',
  description: 'Personal AI OS — Control WhatsApp, Clients, AI Agents, Voice Commands and Business Automation from one intelligent dashboard.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#050816',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#050816" />
      </head>
      <body>
        <VoiceAssistant />
        <DesktopShell>
          {children}
        </DesktopShell>
        <MobileShell>
          {children}
        </MobileShell>
      </body>
    </html>
  )
}

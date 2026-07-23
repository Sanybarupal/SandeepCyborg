import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import VoiceAssistant from '@/components/VoiceAssistant'

export const metadata: Metadata = {
  title: 'Sandeep Clone — AI Operating System',
  description: 'Personal AI OS — Clients, Projects, Approvals, aur bahut kuch',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="hi" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
          <VoiceAssistant />
        </ThemeProvider>
      </body>
    </html>
  )
}

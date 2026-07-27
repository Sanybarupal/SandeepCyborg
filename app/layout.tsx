import type { Metadata } from 'next'
import './globals.css'
import { DesktopShell } from '../components/DesktopShell'

export const metadata: Metadata = {
  title: 'Sandeep Clone — AI Operating System',
  description: 'Personal AI OS — Control WhatsApp, Clients, AI Agents, Voice Commands and Business Automation from one intelligent dashboard.',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
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
        <DesktopShell>
          {children}
        </DesktopShell>
      </body>
    </html>
  )
}

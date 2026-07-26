import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Sandeep Clone — AI Operating System',
  description: 'Personal AI OS — Control WhatsApp, Clients, AI Agents, Voice Commands and Business Automation from one intelligent dashboard.',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
  },
  themeColor: '#050816',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Sandeep AI OS',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#050816" />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}

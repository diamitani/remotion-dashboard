import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Remotion Dashboard',
  description: 'AI-powered video creation with Remotion',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

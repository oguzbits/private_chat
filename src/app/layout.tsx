import { Providers } from '@/components/providers'
import type { Metadata } from 'next'
import { JetBrains_Mono } from 'next/font/google'
import './globals.css'

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'private_chat - Secure Self-Destructing Chat Rooms',
  description:
    'Create private, encrypted chat rooms that self-destruct after 10 minutes. No trace, no history. Perfect for secure one-on-one conversations.',
  keywords: [
    'private chat',
    'secure messaging',
    'self-destructing messages',
    'encrypted chat',
    'temporary chat room',
    'anonymous chat',
    'secure communication',
  ],
  authors: [{ name: 'private_chat' }],
  creator: 'private_chat',
  publisher: 'private_chat',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url:
      process.env.NEXT_PUBLIC_APP_URL || 'https://private-chat-red.vercel.app',
    title: 'private_chat - Secure Self-Destructing Chat Rooms',
    description:
      'Create private, encrypted chat rooms that self-destruct after 10 minutes. No trace, no history.',
    siteName: 'private_chat',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'private_chat - Secure Self-Destructing Chat Rooms',
    description:
      'Create private, encrypted chat rooms that self-destruct after 10 minutes. No trace, no history.',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  themeColor: '#000000',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${jetbrainsMono.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

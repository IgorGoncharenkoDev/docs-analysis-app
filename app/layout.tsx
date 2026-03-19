import { ClerkProvider } from '@clerk/nextjs'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import { LayoutFooter } from '@/components/layout/footer'
import { LayoutHeader } from '@/components/layout/header/header'

import './globals.css'

const inter = Inter({
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Documents Analysis App',
  description: 'AI Powered Document Analysis',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`antialiased ${inter.className}`}>
        <ClerkProvider>
          <div className="min-h-screen flex flex-col">
            <LayoutHeader />
            <main className="flex-1">{children}</main>
            <LayoutFooter />
          </div>
        </ClerkProvider>
      </body>
    </html>
  )
}

import { ClerkProvider } from '@clerk/nextjs'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'

import { LayoutFooter } from '@/components/layout/footer'
import { LayoutHeader } from '@/components/layout/header/header'
import { ClerkOrgInitializer } from '@/lib/auth/ClerkOrgInitializer'
import { syncUser } from '@/lib/sync-user'

import './globals.css'

const inter = Inter({
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Documents Analysis App',
  description: 'AI Powered Document Analysis',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  try {
    await syncUser()
  } catch (error) {}

  return (
    <html lang="en">
      <body className={`antialiased ${inter.className}`}>
        <ClerkProvider>
          <ClerkOrgInitializer />

          <div className="min-h-screen flex flex-col">
            <LayoutHeader />
            <main className="flex-1">{children}</main>
            <LayoutFooter />
            <Toaster richColors position="top-right" />
          </div>
        </ClerkProvider>
      </body>
    </html>
  )
}

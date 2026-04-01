import { redirect } from 'next/navigation'

import { getClerkAuth } from '@/lib/auth/getClerkAuth'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    await getClerkAuth()
  } catch {
    redirect('/sign-in')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="py-8">
        <div className="container mx-auto px-4">{children}</div>
      </main>
    </div>
  )
}

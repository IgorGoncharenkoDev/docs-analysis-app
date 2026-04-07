import { redirect } from 'next/navigation'

import { getClerkAuth } from '@/lib/auth/getClerkAuth'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const authResult = await getClerkAuth()
  if (!authResult.ok) {
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

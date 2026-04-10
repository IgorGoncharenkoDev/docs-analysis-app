import { redirect } from 'next/navigation'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { getClerkAuth } from '@/lib/auth/getClerkAuth'
import { SyncOrgClient } from '@/lib/clerk/SyncOrgClient'
import { getOrganizationMembers } from '@/lib/db/queries/organizationMembers/getOrganizationMembers'
import { getOrganizationBySlug } from '@/lib/db/queries/organizations/getOrganization'

type OrgLayoutProps = {
  children: React.ReactNode
  params: Promise<{ orgSlug: string }>
}

export default async function OrgLayout({ children, params }: OrgLayoutProps) {
  const authResult = await getClerkAuth()
  if (!authResult.ok) {
    redirect('/sign-in')
  }

  const { orgSlug } = await params

  const organization = await getOrganizationBySlug({ slug: orgSlug })
  if (!organization) redirect('/select-org')

  const membership = await getOrganizationMembers({
    organizationId: organization.id,
    userId: authResult.userId,
  })

  if (!membership) redirect('/select-org')

  return (
    <>
      <SyncOrgClient orgSlug={orgSlug} />
      <div className="min-h-screen bg-gray-50">
        <Card className="w-full shadow-sm border">
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h1 className="text-2xl font-semibold tracking-tight">
                  {organization.name}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Organization workspace
                </p>
              </div>
              <Badge className="px-4 py-1.5 font-medium" variant="outline">
                {membership.role}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <main className="py-8">
          <div className="container mx-auto px-4">{children}</div>
        </main>
      </div>
    </>
  )
}

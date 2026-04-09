import { redirect } from 'next/navigation'

import { getClerkAuth } from '@/lib/auth/getClerkAuth'
import { SyncOrgClient } from '@/lib/clerk/SyncOrgClient'
import { getOrganizationBySlug } from '@/lib/db/queries/organizations/getOrganization'

type OrgLayoutProps = {
  children: React.ReactNode
  params: { orgSlug: string }
}

export default async function OrgLayout({ children, params }: OrgLayoutProps) {
  const authResult = await getClerkAuth()
  if (!authResult.ok) {
    redirect('/sign-in')
  }

  const { orgSlug } = params

  const organization = await getOrganizationBySlug(orgSlug)
  if (!organization) redirect('/select-org')

  return (
    <>
      <SyncOrgClient orgSlug={orgSlug} />
      {children}
    </>
  )
}

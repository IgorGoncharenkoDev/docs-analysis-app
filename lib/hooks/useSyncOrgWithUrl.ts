import { useOrganization, useOrganizationList } from '@clerk/nextjs'
import { useEffect } from 'react'

export function useSyncOrgWithUrl(orgSlug: string) {
  const { organization } = useOrganization()

  const { isLoaded, userMemberships, setActive } = useOrganizationList({
    userMemberships: {
      infinite: true,
    },
  })

  useEffect(() => {
    if (!isLoaded || !orgSlug) return

    const match = userMemberships.data?.find(
      membership => membership.organization.slug === orgSlug,
    )

    if (!match) return

    if (organization?.id === match.organization.id) return
    
    setActive({ organization: match.organization.id })
  }, [isLoaded, userMemberships.data, setActive, orgSlug, organization])
}
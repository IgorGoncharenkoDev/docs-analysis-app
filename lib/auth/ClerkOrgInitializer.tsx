'use client'

import { useOrganization, useOrganizationList } from '@clerk/nextjs'
import { useEffect } from 'react'

export function ClerkOrgInitializer() {
  const { organization } = useOrganization()
  const { userMemberships, setActive, isLoaded } = useOrganizationList({
    userMemberships: {
      infinite: true, // refreshes orgs list when an org is created
    },
  })

  useEffect(() => {
    if (!isLoaded) return

    // if active org exists, do nothing
    if (organization) return

    // we need at least one org to set something
    if (!userMemberships.data?.length) return

    // as a fallback we set the first org
    setActive({ organization: userMemberships.data[0].organization.id })
  }, [organization, isLoaded, userMemberships, setActive])

  return null
}
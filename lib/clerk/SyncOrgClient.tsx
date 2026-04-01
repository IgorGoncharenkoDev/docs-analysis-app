'use client'

import { useSyncOrgWithUrl } from '@/lib/hooks/useSyncOrgWithUrl'

type SyncOrgClientProps = {
  orgSlug: string
}

/* logic is wrapped inside a component (not a hook) in order to be able to apply it
inside an async component (such as a layout) */
export function SyncOrgClient({ orgSlug }: SyncOrgClientProps) {
  useSyncOrgWithUrl(orgSlug)

  return null
}

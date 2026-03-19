import { useOrganization } from '@clerk/nextjs'
import { Building, FileText, Home, Users } from 'lucide-react'
import { FC, SVGProps } from 'react'

type NavLinkType = {
  href: string
  label: string
  icon: FC<SVGProps<SVGSVGElement>>
}

export function useNavItems(): NavLinkType[] {
  const { organization } = useOrganization()

  const baseItems = [
    { href: '/', label: 'Home', icon: Home },
    {
      href: '/select-org',
      label: 'Switch Organization',
      icon: Users,
    },
  ]

  // the user belongs to an organization
  if (organization) {
    return [
      ...baseItems.slice(0, 1),
      {
        href: `/${organization.slug}`,
        label: 'Organization Dashboard',
        icon: Building,
      },
      {
        href: `/${organization.slug}/documents`,
        label: 'Org Documents',
        icon: FileText,
      },
      ...baseItems.slice(1),
    ]
  }

  // the user is new
  return [...baseItems]
}
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { useNavItems } from '@/lib/useNavItems'

export function Navbar() {
  const pathName = usePathname()
  const navItems = useNavItems()

  return (
    <nav className="hidden md:flex items-center gap-1">
      {navItems.map((item) => {
        const isActive =
          pathName === item.href ||
          (item.href !== '/' && pathName.startsWith(item.href))

        const Icon = item.icon

        return (
          <Link href={item.href} key={item.href}>
            <Button
              className="gap-2"
              size="sm"
              variant={isActive ? 'secondary' : 'ghost'}
            >
              <Icon />
              {item.label}
            </Button>
          </Link>
        )
      })}
    </nav>
  )
}

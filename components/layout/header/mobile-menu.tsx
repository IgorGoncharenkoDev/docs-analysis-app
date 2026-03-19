'use client'

import { useOrganization, UserButton, useUser } from '@clerk/nextjs'
import { LogIn, Menu, UserPlus } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useNavItems } from '@/lib/useNavItems'

export function MobileMenu() {
  const pathName = usePathname()
  const { organization } = useOrganization()
  const { isLoaded, isSignedIn, user} = useUser()
  const navItems = useNavItems()

  const [isOpen, setIsOpen] = useState(false)

  if (!isLoaded) return null

  return (
    <div className="md:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button size="icon" variant="ghost">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent className="w-75 sm:w-100" side="right">
          <div className="flex flex-col gap-4 pt-12">
            {navItems.map((item) => {
              const Icon = item.icon

              return (
                <Link
                  href={item.href}
                  key={item.href}
                  onClick={() => setIsOpen(false)}
                >
                  <Button
                    className="w-full justify-start gap-2 rounded-none"
                    variant={pathName === item.href ? 'secondary' : 'ghost'}
                  >
                    <Icon />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
          </div>
          <div className="border-t">
            <div className="px-2 pt-6">
              {isSignedIn ? (
                <div className="flex flex-col gap-2">
                  <div className="px-2 text-sm text-gray-600 mb-2">
                    { organization ? `In: ${organization.name}` : `Signed in as ${user.firstName || user.username}`}
                  </div>
                  <div className="flex justify-center">
                    <UserButton />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <Link href="/sign-in" onClick={() => setIsOpen(false)}>
                    <Button className="w-full" variant="outline">
                      <LogIn className="h-4 w-4 mr-2" />
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/sign-up" onClick={() => setIsOpen(false)}>
                    <Button className="w-full">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

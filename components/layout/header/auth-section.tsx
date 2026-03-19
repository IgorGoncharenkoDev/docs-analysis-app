'use client'

import { useOrganization, UserButton, useUser } from '@clerk/nextjs'
import { LogIn, UserPlus } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'

export function AuthSection() {
  const { organization } = useOrganization()
  const { isSignedIn, isLoaded, user } = useUser()

  if (!isLoaded) return null

  return (
    <>
      {isSignedIn ? (
        <div className="hidden md:flex items-center gap-2">
          <span className="text-sm text-gray-600">
            {organization
              ? `In: ${organization.name}`
              : user?.firstName || user?.username}
          </span>
          <UserButton />
        </div>
      ) : (
        <div className="hidden md:flex items-center gap-2">
          <Link href="/sign-in">
            <Button size="sm" variant="ghost">
              <LogIn className="h-4 w-4 mr-2" />
              Sign In
            </Button>
          </Link>
          <Link href="/sign-up">
            <Button size="sm">
              <UserPlus className="h-4 w-4 mr-2" />
              Sign Up
            </Button>
          </Link>
        </div>
      )}
    </>
  )
}

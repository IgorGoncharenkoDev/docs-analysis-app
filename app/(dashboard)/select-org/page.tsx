'use client'

import { useOrganizationList, useUser } from '@clerk/nextjs'
import { ArrowRight, Building, Copy, Loader2, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useCopyToClipboard } from '@/lib/useCopyToClipboard'

export default function SelectOrgPage() {
  const router = useRouter()
  const {
    isLoaded: isOrganizationListLoaded,
    userMemberships,
    setActive,
    createOrganization,
  } = useOrganizationList({
    userMemberships: {
      infinite: true,
    },
  })

  const { user } = useUser()
  const { copy } = useCopyToClipboard()

  const [orgName, setOrgName] = useState('')
  const [isSwitching, setIsSwitching] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleSelectOrganization = async (organization: {
    id: string
    slug: string | null
  }) => {
    console.log('org |>', organization.id);

    if (isSwitching) return
    setIsSwitching(true)

    try {
      if (setActive) {
        await setActive({ organization: organization.id })
      }

      if (!organization.slug) {
        toast.error('Organization slug missing')
        return
      }

      router.push(`/${organization.slug}`)
    } catch (error) {
      console.error('Error switching organization:', error)
      toast.error('Failed to switch organization')
    }
    finally {
      setIsSwitching(false)
    }
  }

  const refreshOrganization = async () => {
    setIsRefreshing(true)
    try {
      if (userMemberships?.revalidate) {
        await userMemberships.revalidate()
      }
      toast.success('Organizations refreshed successfully')
    } catch (error) {
      console.error('Error refreshing organizations:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleCreateOrganization = async () => {
    if (!orgName.trim()) {
      toast.error('Organization name is required')
      return
    }
    setIsCreating(true)

    try {
      // create a new organization in clerk
      if (!createOrganization) {
        throw new Error('Cannot create organization, please try again later')
      }

      const newOrganization = await createOrganization({
        name: orgName.trim(),
      })

      if (!newOrganization) {
        throw new Error('Failed to create organization')
      }

      toast.success(`Organization ${orgName.trim()} created successfully`)
      setOrgName('')

      // save new organization to db
      try {
        // TODO i |> create client api
        const response = await fetch('/api/organizations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: orgName.trim(),
            clerkOrganizationId: newOrganization.id,
            slug: newOrganization.slug || orgName.trim().toLowerCase().replace(/\s+/g, '-')
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to save organization to database')
        }
      } catch (error) {
        console.warn('Error saving organization to database:', error)
      }

      // set as active org
      if (setActive) {
        await setActive({ organization: newOrganization.id })
      }

      // creating a delay to refresh the list
      await new Promise((resolve) => setTimeout(resolve, 500))
      refreshOrganization()
      router.refresh()
    } catch (error) {
      console.error('Error creating organization:', error)
      toast.error('Failed to create organization')
    } finally {
      setIsCreating(false)
    }
  }

  const handleCopy = async (
    e: React.MouseEvent<HTMLSpanElement>,
    value: string,
  ) => {
    e.stopPropagation()
    await copy(value)
  }

  return (
    <div className="container max-w-4xl mx-auto p-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Welcome, {user?.firstName}!</h1>
        <p className="text-gray-600">Select or create an organization</p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create New Organization
              </CardTitle>
              <CardDescription>
                Start a new workspace for your team
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                className="flex-1"
                disabled={isCreating}
                placeholder="Enter organization name"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                onKeyDown={(e) =>
                  e.key === 'Enter' && handleCreateOrganization()
                }
              />
              <Button
                className="min-w-25"
                disabled={isCreating || !orgName.trim()}
                onClick={handleCreateOrganization}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create'
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Your Organizations ({userMemberships?.count || 0})
          </CardTitle>
          <CardDescription>
            {!userMemberships.count
              ? 'Create your first organization above'
              : 'Click an organization to enter'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!userMemberships.count ? (
            <div className="text-center py-12">
              <Building className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">No organizations yet</p>
              <p className="text-sm text-gray-500">
                Create your first organization to get started
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {userMemberships.data.map((m) => (
                <div
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  key={m.organization.id}
                  onClick={() => handleSelectOrganization(m.organization)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Building className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">
                          {m.organization.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span className="bg-gray-100 px-2 py-1 rounded text-xs capitalize">
                            {m.role}
                          </span>
                          <span>•</span>
                          <span
                            className="flex items-center gap-2"
                            onClick={(e) => handleCopy(e, m.organization.id)}
                          >
                            ID: {m.organization.id.substring(0, 8)}...
                            <Copy className="h-4 w-4" />
                          </span>
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

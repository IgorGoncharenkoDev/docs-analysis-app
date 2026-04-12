import { ArrowRight, Brain, FileText, Upload } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { OrganizationInclude } from '@/generated/prisma/models/Organization'
import { getClerkAuth } from '@/lib/auth/getClerkAuth'
import { prisma } from '@/lib/db/prisma'
import { getOrganizationMembers } from '@/lib/db/queries/organizationMembers/getOrganizationMembers'
import { getOrganizationBySlug } from '@/lib/db/queries/organizations/getOrganization'

type OrgPageProps = {
  params: Promise<{ orgSlug: string }>
}

export default async function OrgPage({ params }: OrgPageProps) {
  const { orgSlug } = await params

  const authResult = await getClerkAuth()

  if (!authResult.ok) {
    redirect('/sign-in')
  }

  const { userId } = authResult

  // organization with stats
  const include = {
    _count: {
      select: {
        documents: true,
        members: true,
      },
    },
    documents: {
      take: 5,
      orderBy: { createdAt: 'desc' },
    },
  } as const satisfies OrganizationInclude

  const organization = await getOrganizationBySlug({ slug: orgSlug, include })
  if (!organization) redirect('/select-org')

  const membership = await getOrganizationMembers({
    organizationId: organization.id,
    userId: authResult.userId,
  })

  if (!membership) redirect('/select-org')

  const analyzedDocs = await prisma.document.count({
    where: {
      organizationId: organization.id,
      aiSummary: { not: null },
    },
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{organization.name} Dashboard</h1>
        <p className="text-gray-600">Welcome to your organization workspace</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Documents</CardTitle>
            <CardDescription>In this organization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {organization._count.documents}
            </div>
            <Link href={`/${orgSlug}/documents`}>
              <Button className="mt-2" size="sm" variant="ghost">
                View Documents
                <ArrowRight className="ml-2 h-3 w-3" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Team Members</CardTitle>
            <CardDescription>Organization members</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {organization._count.members}
            </div>
            <Button className="mt-2" size="sm" variant="ghost">
              View Team
              <ArrowRight className="ml-2 h-3 w-3" />
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Analyzed</CardTitle>
            <CardDescription>Documents with AI insights</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analyzedDocs}</div>
            <p className="text-sm text-gray-500 mt-1">
              {(
                (analyzedDocs / organization._count.documents) * 100 || 0
              ).toFixed(0)}
              % analyzed
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Documents</CardTitle>
          <CardDescription>Latest uploads in your organization</CardDescription>
        </CardHeader>
        <CardContent>
          {!organization.documents.length ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No documents uploaded yet</p>
              <Link href={`/${orgSlug}/documents`}>
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload First Document
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {organization.documents.map((doc) => (
                <div
                  className="flex items-center justify-between p-4 border rounded-lg"
                  key={doc.id}
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">{doc.name}</p>
                      <p className="text-sm text-gray-500">
                        Uploaded {new Date(doc.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {doc.aiSummary ? (
                    <Brain className="h-5 w-5 text-green-500" />
                  ) : (
                    <Link href={`/${ orgSlug }/documents`}>
                      <Button size="sm" variant="outline">
                        Analyze
                      </Button>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

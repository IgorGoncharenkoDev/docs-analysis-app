import { clerkClient } from '@clerk/nextjs/server'

import { prisma } from '@/lib/db/prisma'

// this handler is outdated, it stays here for demo purposes
export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const pendingOrganizations = await prisma.organization.findMany({
    where: { status: 'PENDING' },
  })

  for (const org of pendingOrganizations) {
    try {
      const cc = await clerkClient()
      const clerkOrg = await cc.organizations.createOrganization({
        name: org.name,
        slug: org.slug,
      })

      await prisma.organization.update({
        where: { id: org.id },
        data: {
          clerkOrgId: clerkOrg.id,
          status: 'ACTIVE',
        },
      })
    } catch (error) {
      console.error('Retry failed for organization:', org.id)
    }
  }

  return Response.json({ ok: true })
}
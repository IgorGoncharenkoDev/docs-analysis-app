import { clerkClient } from '@clerk/nextjs/server'
import { PrismaClientKnownRequestError } from '@prisma/client-runtime-utils'
import { NextResponse } from 'next/server'
import slugify from 'slugify'

import { registerOrganizationSchema } from '@/app/api/schemas/organization.schema'
import { requireAuth } from '@/lib/auth/requireAuth'
import { prisma } from '@/lib/db/prisma'
import { partialOrganizationSelect } from '@/lib/db/selects/organization.select'
import { AppError } from '@/lib/errors/AppError'
import { handleRouteError } from '@/lib/errors/handleRouteError'
import { validateRequest } from '@/lib/validation/validateRequest'
import { ApiResponse } from '@/types/api'
import { RegisterOrganizationDTO } from '@/types/dto'

export async function POST(
  req: Request,
): Promise<NextResponse<ApiResponse<RegisterOrganizationDTO | null>>> {
  // outer 'try-catch' handles unexpected errors
  try {
    const userId = await requireAuth()

    let body: unknown
    try {
      body = await req.json()
    } catch {
      throw new AppError({
        type: 'bad_request',
        message: 'Invalid JSON body',
      })
    }

    const validation = validateRequest({
      data: body,
      schema: registerOrganizationSchema,
    })

    if (!validation.success) return validation.response

    const { name, slug } = validation.data

    const slugified = slugify(slug, {
      lower: true,
      replacement: '-',
      strict: true,
      trim: true,
    })

    // find or create a user
    const user = await prisma.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    })

    if (!user) {
      throw new AppError({
        type: 'unauthorized',
        message: 'User not found in DB',
      })
    }

    // reserving a new organization in DB (before creating one in Clerk)
    let organization: { id: string, clerkOrgId: string | null }

    try {
      organization = await prisma.$transaction(async (tx) => {
        // creating a new organization
        const org = await tx.organization.create({
          data: { name, slug: slugified, status: 'PENDING' },
          select: partialOrganizationSelect,
        })

        // creating a new organization member
        await tx.organizationMember.create({
          data: {
            userId: user.id,
            organizationId: org.id,
            role: 'owner',
          },
        })

        return org
      })
    } catch (error) {
      // expected failure: unique constraint
      const isUniqueError =
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'

      if (isUniqueError) {
        const target = (error.meta?.target ?? []) as string[]

        if (target.includes('name')) {
          throw new AppError({
            type: 'conflict',
            message: 'Organization name is already taken',
          })
        }

        if (target.includes('slug')) {
          throw new AppError({
            type: 'conflict',
            message: 'Slug is already taken',
          })
        }
      }

      throw error
    }

    let clerkOrg

    if (!organization.clerkOrgId) {
      // creating a new organization in Clerk
      const cc = await clerkClient()

      try {
        clerkOrg = await cc.organizations.createOrganization({
          name,
          slug: slugified,
        })
      } catch (error) {
        // marking as FAILED (for retry later)
        await prisma.organization.update({
          where: { id: organization.id },
          data: { status: 'FAILED' },
        })

        console.error('Clerk org creation failed', {
          orgId: organization.id,
          error,
        })

        throw new AppError({
          type: 'external_error',
          message: 'Failed to create organization in Clerk',
        })
      }
    }

    if (!clerkOrg?.id) {
      throw new AppError({
        type: 'external_error',
        message: 'Invalid Clerk response',
      })
    }

    // finalizing in db
    const finalized = await prisma.organization.update({
      where: { id: organization.id },
      data: {
        clerkOrgId: clerkOrg.id,
        status: 'ACTIVE',
      },
      select: partialOrganizationSelect,
    })

    return NextResponse.json({
      status: 'success',
      data: finalized,
      message: 'Organization created successfully',
    })
  } catch (error) {
    return handleRouteError(error)
  }
}

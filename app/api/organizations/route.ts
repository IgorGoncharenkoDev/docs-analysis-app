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

    const { clerkOrgId, name, slug } = validation.data

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

    let organization!: RegisterOrganizationDTO

    // inner 'try-catch' handles expected failure(s)
    try {
      organization = await prisma.$transaction(async (tx) => {
        // creating a new organization
        const org = await tx.organization.create({
          data: { clerkOrgId, name, slug: slugified },
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
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2002' // P2002 can be caused by slug OR clerkOrgId
      ) {
        const existing = await prisma.organization.findUnique({
          where: { clerkOrgId },
        })

        if (existing) {
          organization = {
            id: existing.id,
            clerkOrgId: existing.clerkOrgId,
            name: existing.name,
            slug: existing.slug,
          }
        } else {
          throw new AppError({
            type: 'conflict',
            message: 'Slug is already taken',
          })
        }
      } else {
        throw error // handles error to the outer 'catch' block
      }
    }

    return NextResponse.json({
      status: 'success',
      data: organization,
      message: 'Organization created successfully',
    } satisfies ApiResponse<RegisterOrganizationDTO>)
  } catch (error) {
    return handleRouteError(error)
  }
}

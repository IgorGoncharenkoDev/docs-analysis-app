import { PrismaClientKnownRequestError } from '@prisma/client-runtime-utils'
import { NextResponse } from 'next/server'
import slugify from 'slugify'

import {
  deleteOrganizationSchema,
  registerOrganizationSchema,
} from '@/app/api/schemas/organization.schema'
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

    const { clerkOrgId, name } = validation.data

    const slugified = slugify(name, {
      lower: true,
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

    let organization: {
      id: string
      clerkOrgId: string
      name: string
      slug: string
    }

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
      const isUniqueError =
        error instanceof PrismaClientKnownRequestError && error.code === 'P2002'

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

        if (target.includes('clerkOrgId')) {
          throw new AppError({
            type: 'conflict',
            message: 'Organization already exists (Clerk mismatch)',
          })
        }
      }

      throw error
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

export async function DELETE(
  req: Request,
): Promise<NextResponse<ApiResponse<null>>> {
  const userId = await requireAuth()

  const body = await req.json().catch(() => {
    throw new AppError({
      type: 'bad_request',
      message: 'Invalid JSON body',
    })
  })

  const validation = validateRequest({
    data: body,
    schema: deleteOrganizationSchema,
  })

  if (!validation.success) return validation.response

  const { clerkOrgId } = validation.data

  // does org exist in db?
  const org = await prisma.organization.findUnique({
    where: { clerkOrgId },
    include: {
      members: {
        include: {
          user: true,
        },
      },
    }
  })

  if (!org) {
    throw new AppError({
      type: 'not_found',
      message: 'Organization not found',
    })
  }

  // does the user have permission to delete the org?
  const isOwner = org.members.some(
    (member) => member.role === 'owner' && member.user.clerkUserId === userId,
  )

  if (!isOwner) {
    throw new AppError({
      type: 'forbidden',
      message: 'Only organization owner can delete it',
    })
  }

  // deleting from DB
  await prisma.$transaction([
    prisma.organizationMember.deleteMany({ where: { organizationId: org.id } }),
    prisma.organization.delete({ where: { id: org.id } }),
  ])

  return NextResponse.json({
    status: 'success',
    data: null,
    message: 'Organization deleted successfully',
  })
}

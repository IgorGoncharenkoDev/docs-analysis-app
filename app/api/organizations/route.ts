import { NextResponse } from 'next/server'
import slugify from 'slugify'

import { registerOrganizationSchema } from '@/app/api/schemas/organization.schema'
import { chalkError } from '@/lib/chalk'
import { prisma } from '@/lib/db/prisma'
import { partialOrganizationSelect } from '@/lib/db/selects/organization.select'
import { getClerkAuth } from '@/lib/getClerkAuth'
import { validateRequest } from '@/lib/validation/validateRequest'
import { ApiResponse } from '@/types/api'
import { RegisterOrganizationDTO } from '@/types/dto'

export async function POST(
  req: Request,
): Promise<NextResponse<ApiResponse<RegisterOrganizationDTO>>> {
  // outer 'try-catch' handles unexpected errors
  try {
    const authResult = await getClerkAuth()
    if (!authResult.ok) {
      return NextResponse.json(
        { status: 'error', message: 'Unauthorized' },
        { status: 401 }
      )
    }
    const userId = authResult.userId

    const body = await req.json()

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
      return NextResponse.json(
        { status: 'error', message: 'Unauthorized' },
        { status: 401 },
      )
    }

    let organization: RegisterOrganizationDTO

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
        typeof (error as any)?.code === 'string' && // eslint-disable-line @typescript-eslint/no-explicit-any
        (error as any).code === 'P2002' // eslint-disable-line @typescript-eslint/no-explicit-any
      ) {
        // P2002 can be caused by slug OR clerkOrgId

        const existing = await prisma.organization.findUnique({
          where: { clerkOrgId },
        })

        if (existing) {
          return NextResponse.json({
            status: 'success',
            data: {
              id: existing.id,
              clerkOrgId: existing.clerkOrgId,
              name: existing.name,
              slug: existing.slug,
            },
            message: 'Organization already exists'
          } satisfies ApiResponse<RegisterOrganizationDTO>)
        }

        // ...likely slug conflict
        return NextResponse.json({
          status: 'error',
          message: 'Slug is already taken. Please choose a different slug.',
        }, { status: 400 })
      }

      throw error // handles error to the outer 'catch' block
    }

    return NextResponse.json({
      status: 'success',
      data: {
        id: organization.id,
        clerkOrgId: organization.clerkOrgId,
        name: organization.name,
        slug: organization.slug,
      },
      message: 'Organization created successfully',
    } satisfies ApiResponse<RegisterOrganizationDTO>)
  } catch (error) {
    console.log(chalkError('Error creating organization:', error))

    return NextResponse.json(
      {
        status: 'error',
        message: 'Unknown error occurred while creating organization. Please try again later.',
      },
      { status: 500 },
    )
  }
}

import { NextResponse } from 'next/server'

import { validateOrganizationNameSchema } from '@/app/api/schemas/organization.schema'
import { prisma } from '@/lib/db/prisma'
import { AppError } from '@/lib/errors/AppError'
import { handleRouteError } from '@/lib/errors/handleRouteError'
import { validateRequest } from '@/lib/validation/validateRequest'
import { ApiResponse } from '@/types/api'
import { ValidateOrganizationNameDTO } from '@/types/dto'

export async function POST(
  req: Request,
): Promise<NextResponse<ApiResponse<ValidateOrganizationNameDTO | null>>> {
  try {
    const body = await req.json().catch(() => {
      throw new AppError({
        type: 'bad_request',
        message: 'Invalid JSON body',
      })
    })

    const validation = validateRequest({
      data: body,
      schema: validateOrganizationNameSchema,
    })

    if (!validation.success) return validation.response
    const { name, slug, excludeId }  = validation.data

    const existing = await prisma.organization.findMany({
      where: {
        OR: [
          { name },
          { slug },
        ],
        ...(excludeId && {
          NOT: { id: excludeId },
        }),
      },
      select: {
        name: true,
        slug: true,
      }
    })

    const nameTaken = existing.some(org => org.name === name)
    const slugTaken = existing.some(org => org.slug === slug)

    return NextResponse.json({
      status: 'success',
      data: {
        nameAvailable: !nameTaken,
        slugAvailable: !slugTaken,
      },
    })
  } catch (error) {
    return handleRouteError(error)
  }
}

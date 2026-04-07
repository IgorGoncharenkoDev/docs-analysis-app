import { NextRequest, NextResponse } from 'next/server'

import { getOrganizationByNameSchema } from '@/app/api/schemas/organization.schema'
import { getOrganizationByName } from '@/lib/db/queries/organizations/getOrganization'
import { handleRouteError } from '@/lib/errors/handleRouteError'
import { validateRequest } from '@/lib/validation/validateRequest'
import { ApiResponse } from '@/types/api'
import { GetOrganizationDTO } from '@/types/dto'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ name: string }> }
): Promise<NextResponse<ApiResponse<GetOrganizationDTO | null>>> {
  try {
    const { name: orgName } = await params

    const validation = validateRequest({
      data: { name: orgName },
      schema: getOrganizationByNameSchema,
    })

    if (!validation.success) return validation.response

    const organization = await getOrganizationByName(orgName)

    return NextResponse.json({
      status: 'success',
      data: organization
    })

  } catch (error) {
    return handleRouteError(error)
  }
}
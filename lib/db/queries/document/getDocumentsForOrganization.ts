import { prisma } from '@/lib/db/prisma'
import { documentForOrganizationSelect } from '@/lib/db/selects/document.select'
import { GetDocumentDTO } from '@/types/dto'

type Params = {
  userId: string
  organizationId: string
  filters?: {
    page: number
    limit: number
  }
}

export async function getDocumentsForOrganization({
  userId,
  organizationId,
  filters,
}: Params): Promise<GetDocumentDTO[]> {
  // const defaultFilters = { limit: 20, page: 1 }

  return prisma.document.findMany({
    where: { organizationId, userId },
    ...documentForOrganizationSelect,
    ...(filters && {
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
    }),
    orderBy: {
      createdAt: 'desc',
    },
  })
}

/* Filters from search params example:
    const page = Number(searchParams.get('page') || 1)
    const limit = Number(searchParams.get('limit') || 20)
* */
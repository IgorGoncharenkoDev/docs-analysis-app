import { NextResponse } from 'next/server'

import { deleteDocumentSchema } from '@/app/api/schemas/document.schema'
import { requireAuth } from '@/lib/auth/requireAuth'
import { deleteFromBlob } from '@/lib/blob/blob'
import { chalkError } from '@/lib/chalk'
import { prisma } from '@/lib/db/prisma'
import { getDocumentToDelete } from '@/lib/db/queries/document/getDocumentToDelete'
import { AppError } from '@/lib/errors/AppError'
import { handleRouteError } from '@/lib/errors/handleRouteError'
import { validateRequest } from '@/lib/validation/validateRequest'
import { ApiResponse } from '@/types/api'

type RouteParams = {
  params: {
    documentId: string
  }
}

export async function DELETE(
  req: Request,
  { params }: RouteParams,
): Promise<NextResponse<ApiResponse<null>>> {
  try {
    const userId = await requireAuth()
    
    const { documentId } = await params

    const validation = validateRequest({
      data: { documentId },
      schema: deleteDocumentSchema,
    })

    if (!validation.success) return validation.response

    const { documentId: validatedDocumentId } = validation.data

    // get the document only if the user is authorized to access it
    const document = await getDocumentToDelete({
      documentId: validatedDocumentId,
      userId,
    })

    if (!document) {
      throw new AppError({
        type: 'not_found',
        message: 'Document not found',
      })
    }

    // delete the file from db (before deleting the file from blob to avoid race conditions)
    await prisma.document.delete({
      where: { id: document.id }, // using trusted 'id' from DB, not '[documentId]' from the request
    })

    // delete the file from Vercel blob if it exists
    if (document.fileUrl) {
      try {
        await deleteFromBlob({ url: document.fileUrl })
      } catch (error) {
        console.error(chalkError('Blob deletion failed:'), error)
      }
    }

    return NextResponse.json({
      status: 'success',
      data: null,
      message: 'Document deleted successfully',
    })
  } catch (error) {
    return handleRouteError(error)
  }
}

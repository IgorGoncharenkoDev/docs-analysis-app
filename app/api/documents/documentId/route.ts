import { NextResponse } from 'next/server'

import { deleteFromBlob } from '@/lib/blob'
import { chalkError } from '@/lib/chalk'
import { prisma } from '@/lib/db/prisma'
import { getDocumentToDelete } from '@/lib/db/queries/document/getDocumentToDelete'
import { getClerkAuth } from '@/lib/getClerkAuth'
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
    const authResult = await getClerkAuth()
    if (!authResult.ok) {
      return NextResponse.json(
        { status: 'error', message: 'Unauthorized' },
        { status: 401 },
      )
    }
    const userId = authResult.userId
    const { documentId } = params

    // get the document only if the user is authorized to access it
    const document = await getDocumentToDelete({
      documentId,
      userId,
    })

    if (!document) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Document not found',
        },
        { status: 404 },
      )
    }

    // delete the file from Vercel blob if it exists
    if (document.fileUrl) {
      try {
        await deleteFromBlob({ url: document.fileUrl })
      } catch (error) {
        console.log(chalkError('Error deleting file from blob:', error))
      }
    }

    // delete the file from db
    await prisma.document.delete({
      where: { id: document.id }, // using trusted 'id' from DB, not 'documentId' from the request
    })

    return NextResponse.json({
      status: 'success',
      data: null,
    })
  } catch (error) {
    console.log(chalkError('Error deleting document:', error))
    return NextResponse.json(
      {
        status: 'error',
        message:
          'Unknown error occurred while deleting document. Please try again later.',
      },
      { status: 500 },
    )
  }
}

import { NextResponse } from 'next/server'

import { createDocumentSchema } from '@/app/api/schemas/document.schema'
import { requireAuth } from '@/lib/auth/requireAuth'
import { deleteFromBlob } from '@/lib/blob/blob'
import { processFileUpload } from '@/lib/blob/uploadFile'
import { createDocument } from '@/lib/db/queries/document/createDocument'
import { getAuthorizedUserForOrg } from '@/lib/db/queries/document/getAuthorizedUserForOrg'
import { AppError } from '@/lib/errors/AppError'
import { handleRouteError } from '@/lib/errors/handleRouteError'
import { parseFormData } from '@/lib/validation/parseFormData'
import { ApiResponse } from '@/types/api'
import { DocumentFileData } from '@/types/document'
import { CreateDocumentDTO } from '@/types/dto'

export async function POST(
  req: Request,
): Promise<NextResponse<ApiResponse<CreateDocumentDTO | null>>> {
  try {
    const userId = await requireAuth()

    const formData = await req.formData()

    const validatedData = parseFormData({
      formData,
      schema: createDocumentSchema,
    })

    const { user, organization } = await getAuthorizedUserForOrg({
      clerkOrgId: validatedData.clerkOrgId,
      clerkUserId: userId,
    })

    // uploading the file to Vercel blob (with manual rollback if db fails)
    let uploadFileData: DocumentFileData | null = null
    let document: Awaited<ReturnType<typeof createDocument>> | null = null

    try {
      uploadFileData = validatedData.file
        ? await processFileUpload({
            file: validatedData.file,
            orgId: organization.id,
            userId,
          })
        : null

      // creating the document in the db
      document = await createDocument({
        name: validatedData.name,
        userId: user.id,
        organizationId: organization.id,
        content: validatedData.content?.trim() || null,
        fileData: uploadFileData,
      })
    } catch (error) {
      if (uploadFileData?.url) {
        try {
          await deleteFromBlob({ url: uploadFileData?.url })
        } catch (cleanupError) {
          console.error('Rollback failed:', cleanupError)
        }
      }

      throw error
    }

    if (!document) {
      throw new AppError({
        type: 'bad_request',
        message: 'Document creation failed unexpectedly',
      })
    }

    return NextResponse.json({
      status: 'success',
      data: {
        document: {
          id: document.id,
          name: document.name,
          fileUrl: document.fileUrl,
        },
        organization: {
          clerkOrgId: document.organization.clerkOrgId,
          name: document.organization.name,
        },
        uploadedBy: { name: document.user.name },
      },
      message: 'Document uploaded successfully',
    })
  } catch (error) {
    return handleRouteError(error)
  }
}

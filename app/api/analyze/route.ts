import { NextResponse } from 'next/server'

import { analyzeSchema } from '@/app/api/schemas/analyze.schema'
import { requireAuth } from '@/lib/auth/requireAuth'
import { updateDocumentAnalysis } from '@/lib/db/mutations/document/updateDocumentAnalysis'
import { getAuthorizedDocument } from '@/lib/db/queries/document/getAuthorizedDocument'
import { AppError } from '@/lib/errors/AppError'
import { handleRouteError } from '@/lib/errors/handleRouteError'
import { analyzeWithGemini } from '@/lib/gemini'
import { validateRequest } from '@/lib/validation/validateRequest'
import { ApiResponse } from '@/types/api'
import { AnalysisReturnDTO } from '@/types/dto'

export async function POST(
  req: Request,
): Promise<NextResponse<ApiResponse<AnalysisReturnDTO | null>>> {
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
      schema: analyzeSchema,
    })
    if (!validation.success) return validation.response
    const { analysisType, documentId, organizationClerkId } = validation.data

    // finding the doc from db
    const document = await getAuthorizedDocument({
      documentId,
      organizationClerkId,
      userId,
    })

    if (!document) {
      throw new AppError({
        type: 'not_found',
        message: 'Document not found',
      })
    }

    // getting the content of the doc
    if (!document.content) {
      throw new AppError({
        type: 'bad_request',
        message: 'Document content is empty',
      })
    }

    if (document.content.length > 20000) {
      throw new AppError({
        type: 'bad_request',
        message: 'Document too large to analyze',
      })
    }

    // analysis using Gemini
    const geminiResult = await analyzeWithGemini({
      text: document.content,
      analysisType,
    })

    if (!geminiResult.ok) {
      throw new AppError({
        type: 'external_error',
        message: geminiResult.message,
      })
    }

    const summary = geminiResult.data

    // save the result into db
    const updatedDocument = await updateDocumentAnalysis({
      documentId: document.id,
      summary,
      analysisType,
    })

    return NextResponse.json({
      status: 'success',
      data: {
        summary,
        document: updatedDocument,
      },
    } satisfies ApiResponse<AnalysisReturnDTO>)
  } catch (error) {
    return handleRouteError(error)
  }
}

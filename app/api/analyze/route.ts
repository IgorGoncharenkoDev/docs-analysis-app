import { NextResponse } from 'next/server'

import { analyzeSchema } from '@/app/api/schemas/analyze.schema'
import { chalkError } from '@/lib/chalk'
import { updateDocumentAnalysis } from '@/lib/db/mutations/document/updateDocumentAnalysis'
import { getAuthorizedDocument } from '@/lib/db/queries/document/getAuthorizedDocument'
import { analyzeWithGemini } from '@/lib/gemini'
import { getClerkAuth } from '@/lib/getClerkAuth'
import { validateRequest } from '@/lib/validation/validateRequest'
import { AnalysisReturnDTO } from '@/types/dto'
import { ApiResponse } from '@/types/api'

export async function POST(
  req: Request,
): Promise<NextResponse<ApiResponse<AnalysisReturnDTO>>> {
  try {
    const authResult = await getClerkAuth()
    if (!authResult.ok) {
      return NextResponse.json(
        { status: 'error', message: 'Unauthorized' },
        { status: 401 },
      )
    }
    const userId = authResult.userId

    const body = await req.json()
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
      return NextResponse.json(
        {
          status: 'error',
          message: 'Document not found',
        },
        { status: 404 },
      )
    }

    // getting the content of the doc
    if (!document.content) {
      return NextResponse.json(
        { status: 'error', message: 'Document content is empty' },
        { status: 400 }
      )
    }

    const content = document.content

    // analysis using Gemini
    const geminiResult = await analyzeWithGemini({
      text: content,
      analysisType,
    })

    if (!geminiResult.ok) {
      return NextResponse.json(
        { status: 'error', message: geminiResult.message },
        { status: 500 }
      )
    }

    const summary = geminiResult.data

    // save the result into db
    const updatedDocument = await updateDocumentAnalysis({
      documentId,
      summary,
      analysisType,
    })

    return NextResponse.json({
      status: 'success',
      data: {
        summary,
        document: updatedDocument,
      }
    } satisfies ApiResponse<AnalysisReturnDTO>)
  } catch (error) {
    console.log(chalkError('Error analyzing document:', error))

    return NextResponse.json(
      {
        status: 'error',
        message: 'Unknown error occurred while analyzing document. Please try again later.',
      },
      { status: 500 },
    )
  }
}

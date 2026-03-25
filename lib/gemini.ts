import { GoogleGenAI } from '@google/genai'

import { chalkError } from '@/lib/chalk'
import { AnalysisType } from '@/types'

const API_KEY = process.env.GEMINI_API_KEY

if (!API_KEY) {
  throw new Error('GEMINI_API_KEY is not set')
}

const ai = new GoogleGenAI({
  apiKey: API_KEY,
})

type AnalyzeWithGeminiParams = {
  analysisType: AnalysisType,
  text?: string
}

type GeminiResult =
  | { ok: true; data: string }
  | { ok: false; message: string }

export async function analyzeWithGemini({
  text,
  analysisType,
}: AnalyzeWithGeminiParams): Promise<GeminiResult> {
  try {
    const prompts: Record<AnalysisType, string> = {
      test: 'What is the result of 10 multiplied by 5?',
      summary: `Please provide a comprehensive summary of the following document. Include main points, key findings, and conclusions:\n\n${text}`,
      qa: `Based on the following document, generate 5 important questions and their answers:\n\n${text}`,
      sentiment: `Analyze the sentiment and tone of the following document. Provide overall sentiment (positive/negative/neutral) and key emotional tones detected:\n\n${text}`,
      entities: `Extract all named entities (people, organizations, locations, dates, etc.) from the following document:\n\n${text}`,
      extract: `Extract key information from the following document in structured format:\n\n${text}`,
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompts[analysisType],
    })

    if (!response.text) {
      return {
        ok: false,
        message: 'Empty response from Gemini',
      }
    }

    return {
      ok: true,
      data: response.text,
    }
  } catch (error) {
    console.error(chalkError('Error analyzing with Gemini:'), error)
    return {
      ok: false,
      message: 'Failed to analyze with Gemini',
    }
  }
}

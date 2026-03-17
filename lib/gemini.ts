import { GoogleGenAI } from '@google/genai'

import { chalkError } from '@/lib/chalk'

const API_KEY = process.env.GEMINI_API_KEY

if (!API_KEY) {
  throw new Error('GEMINI_API_KEY is not set')
}

const ai = new GoogleGenAI({
  apiKey: API_KEY,
})

type AnalyzeWithGeminiParams = {
  analysisType: 'test' | 'summary' | 'qa' | 'sentiment' | 'entities' | 'extract',
  text?: string
}

export async function analyzeWithGemini({
  text,
  analysisType,
}: AnalyzeWithGeminiParams) {
  try {
    const prompts: Record<AnalyzeWithGeminiParams['analysisType'], string> = {
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
    return response.text
  } catch (error) {
    console.log(chalkError('Error analyzing with Gemini:', error))
    return 'Could not analyze text. Please try again later.'
  }
}

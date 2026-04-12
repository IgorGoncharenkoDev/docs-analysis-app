import { z } from 'zod';

export const analyzeSchema = z.object({
  documentId: z.cuid(),
  organizationClerkId: z.string(),
  analysisType: z.enum(
    ['test', 'summary', 'qa', 'sentiment', 'entities', 'extract']
  )
})
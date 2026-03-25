import { uploadToBlob } from '@/lib/blob/blob'
import { DocumentFileData } from '@/types/document'

type ProcessFileUploadParams = {
  file: File
  orgId: string
  userId: string
}

type ProcessFileUploadReturn = DocumentFileData

export async function processFileUpload({
  file,
  orgId,
  userId,
}: ProcessFileUploadParams): Promise<ProcessFileUploadReturn> {
  const blob = await uploadToBlob({ file, userId, organizationId: orgId });
  const isText = file.type.startsWith('text/')
  // prevents loading the entire file into memory
  const content =
    isText && file.size < 1_000_000 // 1MB
      ? await file.text()
      : null

  return {
    url: blob.url,
    size: file.size,
    type: file.type,
    extractedContent: content,
  };
}
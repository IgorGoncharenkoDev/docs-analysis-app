import { del, put } from '@vercel/blob'

import { AppError } from '@/lib/errors/AppError'

type UploadToBlobParams = {
  file: File
  organizationId: string
  userId: string
}

type UploadToBlobReturn = Promise<{ pathName: string; url: string }>

export async function uploadToBlob({
  file,
  organizationId,
  userId,
}: UploadToBlobParams): UploadToBlobReturn {
  try {
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`
    const pathName = `org-${organizationId}/user-${userId}/${fileName}`
    const blob = await put(pathName, file, {
      access: 'private',
      token: process.env.BLOB_READ_WRITE_TOKEN!,
    })

    return {
      pathName: blob.pathname,
      url: blob.url,
    }
  } catch (error) {
    throw new AppError({
      type: 'bad_request',
      message: 'Failed to upload file',
    })
  }
}

type DeleteFromBlobParams = {
  url: string
}

type DeleteFromBlobReturn = Promise<void>

export async function deleteFromBlob({
  url,
}: DeleteFromBlobParams): DeleteFromBlobReturn {
  try {
    await del(url, {
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })
  } catch (error) {
    throw new AppError({
      type: 'bad_request',
      message: 'Failed to delete file from blob',
    })
  }
}

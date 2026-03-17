import { del, put } from '@vercel/blob'

import { chalkError } from '@/lib/chalk'

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
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })

    return {
      pathName: blob.pathname,
      url: blob.url,
    }
  } catch (error) {
    console.log(chalkError('Error uploading to blob:', error))
    throw Error('Error uploading to blob')
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
    console.log(chalkError('Error deleting from blob:', error))
    throw Error('Error deleting from blob')
  }
}

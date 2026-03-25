import { getClerkAuth } from '@/lib/auth/getClerkAuth'
import { AppError } from '@/lib/errors/AppError'

export async function requireAuth() {
  const authResult = await getClerkAuth()

  if (!authResult.ok) {
    throw new AppError({ type: 'unauthorized', message: 'Unauthorized' })
  }

  return authResult.userId
}
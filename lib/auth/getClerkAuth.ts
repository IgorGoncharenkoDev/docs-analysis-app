import { auth } from '@clerk/nextjs/server'

type AuthResult =
  | { ok: true; userId: string }
  | { ok: false }

// This is just a helper function. It should only return data, not a 'NextResponse' (leaving it for routes)
export async function getClerkAuth(): Promise<AuthResult> {
  try {
    const { userId } = await auth()

    if (!userId) {
      return { ok: false }
    }

    return {
      ok: true,
      userId,
    }
  } catch (error) {
    console.error('Clerk auth error:', error)
    return { ok: false }
  }
}

/* How to use:

    const authResult = await getClerkAuthUser()

    if (!authResult.ok) {
      return NextResponse.json(
        { status: 'error', message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = authResult.userId

* */
import { currentUser } from '@clerk/nextjs/server'

import { prisma } from '@/lib/db/prisma'
import { DbUser } from '@/types/user'

export async function syncUser(): Promise<DbUser> {
  try {
    const clerkUser = await currentUser()
    if (!clerkUser) throw new Error('Unauthorized')

    const email = clerkUser.emailAddresses[0]?.emailAddress
    if (!email) throw new Error('No user email found')

    const userName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim()

    // finding the user in db by the clerk user id
    let dbUser = await prisma.user.findUnique({
      where: {
        clerkUserId: clerkUser.id,
      },
    })

    // updating the existing user in db
    if (dbUser) {
      dbUser = await prisma.user.update({
        where: {
          id: dbUser.id,
        },
        data: {
          email,
          name: userName || dbUser.name,
        },
      } )
    }
    // creating a new user in db
    else {
      dbUser = await prisma.user.create({
        data: {
          clerkUserId: clerkUser.id,
          email,
          name: userName.length ? userName : 'User',
        },
      } )
    }

    return dbUser
  } catch (error) {
    console.error('Error syncing user from Clerk: ', error || 'Unknown error')
    throw error
  }
}

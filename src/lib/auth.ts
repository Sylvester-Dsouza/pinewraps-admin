import { cookies } from 'next/headers'
import { prisma } from './prisma'
import { auth } from '@/lib/firebase'

interface JWTPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

export async function getUser() {
  const token = cookies().get('token')?.value

  if (!token) {
    return null
  }

  try {
    const decodedToken = await auth.verifyIdToken(token)
    const user = await prisma.user.findUnique({
      where: {
        id: decodedToken.uid,
      },
    })
    return user
  } catch (error) {
    console.error('Error verifying token:', error)
    return null
  }
}

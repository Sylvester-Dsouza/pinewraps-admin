import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase-admin';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'No token provided' },
        { status: 401 }
      );
    }

    // Verify the Firebase token
    const decodedToken = await auth.verifyIdToken(token);

    // Call the API to verify admin access
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const response = await fetch(`${apiUrl}/api/admin-auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { success: false, message: error.message || 'Authentication failed' },
        { status: response.status }
      );
    }

    const userData = await response.json();

    // Create session cookie
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    const sessionCookie = await auth.createSessionCookie(token, { expiresIn });

    const responseWithCookie = NextResponse.json({
      success: true,
      user: userData
    });

    // Set the session cookie
    responseWithCookie.cookies.set('session', sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });

    return responseWithCookie;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Login failed' },
      { status: 500 }
    );
  }
}

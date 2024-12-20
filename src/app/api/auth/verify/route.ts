import { NextRequest, NextResponse } from 'next/server';
import api from '@/lib/api';

// Use Node.js runtime instead of Edge
export const runtime = 'nodejs';

async function verifyFirebaseToken(token: string) {
  try {
    const decodedToken = await auth.verifyIdToken(token);
    console.log('Decoded token:', {
      uid: decodedToken.uid,
      email: decodedToken.email,
      admin: decodedToken.admin
    });
    
    // Check if user has admin claim
    if (!decodedToken.admin) {
      console.log('Admin claim not found in token');
      throw new Error('Not authorized as admin');
    }

    return decodedToken;
  } catch (error) {
    console.error('Error verifying Firebase token:', error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: { message: 'No token provided' } },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];

    // Forward the token to our backend
    try {
      const response = await api.post('/api/admin-auth/verify', {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return NextResponse.json(response.data);
    } catch (error: any) {
      console.error('Backend verification error:', error.response?.data || error);
      
      // If we have a specific error message from the backend, use it
      if (error.response?.data?.error?.message) {
        return NextResponse.json(
          error.response.data,
          { status: error.response.status }
        );
      }

      // Otherwise return a generic error
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Failed to verify token'
          }
        },
        { status: error.response?.status || 500 }
      );
    }
  } catch (error) {
    console.error('Error in verify endpoint:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Internal server error'
        }
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check current authentication status
export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.split('Bearer ')[1];

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      return NextResponse.json(
        { error: 'API URL not configured' },
        { status: 500 }
      );
    }

    // Forward the request to the backend
    const response = await fetch(`${apiUrl}/api/admin-auth/verify`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GET /api/auth/verify:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

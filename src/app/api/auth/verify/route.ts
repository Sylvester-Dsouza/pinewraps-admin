import { NextRequest, NextResponse } from 'next/server';
import api from '@/lib/api';
import { auth } from '@/lib/firebase';

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
      console.log('No token provided in request');
      return NextResponse.json(
        { success: false, error: { message: 'No token provided' } },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    console.log('Verifying token with API...');

    try {
      // Get the current Firebase user
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.log('No Firebase user found');
        return NextResponse.json(
          { success: false, error: { message: 'No user found' } },
          { status: 401 }
        );
      }

      // Forward the token to our backend for verification
      const response = await api.post('/api/admin-auth/verify', {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('API verification successful');
      return NextResponse.json(response.data);
    } catch (error: any) {
      console.error('Backend verification error:', error.response?.data || error);
      
      // Handle specific error cases
      if (error.response?.status === 404) {
        return NextResponse.json(
          { 
            success: false, 
            error: { message: 'Admin verification endpoint not found' }
          },
          { status: 404 }
        );
      }
      
      if (error.response?.status === 401) {
        return NextResponse.json(
          { 
            success: false, 
            error: { message: 'Invalid or expired token' }
          },
          { status: 401 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: {
            message: error.response?.data?.error?.message || 'Failed to verify token'
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

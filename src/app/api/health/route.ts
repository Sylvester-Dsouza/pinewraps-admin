import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      return NextResponse.json(
        { success: false, error: 'API URL not configured' },
        { status: 500 }
      );
    }

    // Check API health
    const response = await axios.get(`${apiUrl}/api/health`);
    
    return NextResponse.json({
      success: true,
      status: 'healthy',
      api: response.data,
      adminPanel: {
        status: 'healthy',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error('Health check error:', error);
    return NextResponse.json(
      {
        success: false,
        status: 'unhealthy',
        error: error.message || 'Failed to check API health',
        adminPanel: {
          status: 'healthy',
          timestamp: new Date().toISOString()
        }
      },
      { status: error.response?.status || 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}

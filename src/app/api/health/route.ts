import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://pinewraps-api.onrender.com';

    // Check API health
    const apiResponse = await fetch(`${apiUrl}/health`);
    if (!apiResponse.ok) {
      throw new Error('API health check failed');
    }

    return NextResponse.json({
      status: 'healthy',
      api: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Health check error:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error.message || 'Failed to check health'
      },
      { status: 500 }
    );
  }
}

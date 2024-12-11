import { NextResponse } from 'next/server';
import { apiClient } from '@/lib/api/client';

export async function GET() {
  try {
    // Use the API client which already has the correct base URL and CORS headers
    const response = await apiClient.get('/health');
    
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

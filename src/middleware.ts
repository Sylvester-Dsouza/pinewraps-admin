import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Middleware to handle authentication
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  
  // Public paths that don't require authentication
  const isPublicPath = path === '/login'
  const isApiPath = path.startsWith('/api/')
  const isStaticPath = path.startsWith('/_next') || 
                      path.startsWith('/static') || 
                      path === '/favicon.ico'

  // Get session token from cookie
  const token = request.cookies.get('session')?.value

  // For static files and API routes, proceed normally
  if (isStaticPath || isApiPath) {
    return NextResponse.next()
  }

  // Remove /protected from the path if it exists
  const cleanPath = path.replace(/^\/protected/, '')

  // Redirect to login if no token and trying to access protected route
  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Only redirect to dashboard if has token and trying to access login page
  if (token && isPublicPath) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // If path starts with /protected, redirect to the clean path
  if (path.startsWith('/protected')) {
    return NextResponse.redirect(new URL(cleanPath, request.url))
  }

  return NextResponse.next()
}

// Configure the paths that should be handled by the middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}

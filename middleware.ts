import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const secret = new TextEncoder().encode(JWT_SECRET);

export async function middleware(request: NextRequest) {
  // Only run on admin routes
  if (!request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // Skip the login page
  if (request.nextUrl.pathname === '/admin/login') {
    // If user is already logged in, redirect to dashboard
    const token = request.cookies.get('admin_token')?.value;
    if (token) {
      try {
        await jose.jwtVerify(token, secret);
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      } catch (error) {
        // Invalid token, let them proceed to login
        console.error('Invalid token:', error);
      }
    }
    return NextResponse.next();
  }

  const token = request.cookies.get('admin_token')?.value;
  console.log('Token:', token); // Debug log

  if (!token) {
    console.log('No token found, redirecting to login'); // Debug log
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  try {
    const { payload } = await jose.jwtVerify(token, secret);
    console.log('Token verified:', payload); // Debug log
    
    // Clone the request headers and add user info
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-admin-email', payload.email as string);
    requestHeaders.set('x-admin-role', payload.role as string);

    // Return response with modified headers
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error('Token verification failed:', error); // Debug log
    // Delete the invalid cookie
    const response = NextResponse.redirect(new URL('/admin/login', request.url));
    response.cookies.delete('admin_token');
    return response;
  }
}

// Add runtime configuration
export const runtime = 'nodejs';

export const config = {
  matcher: '/admin/:path*',
}

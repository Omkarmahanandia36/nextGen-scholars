import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_12345';
const secret = new TextEncoder().encode(JWT_SECRET);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Admin Routes
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') {
      const token = request.cookies.get('admin_token')?.value;
      if (token) {
        try {
          await jose.jwtVerify(token, secret);
          return NextResponse.redirect(new URL('/admin/dashboard', request.url));
        } catch (error) {}
      }
      return NextResponse.next();
    }

    const token = request.cookies.get('admin_token')?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    try {
      await jose.jwtVerify(token, secret);
      return NextResponse.next();
    } catch (error) {
      const response = NextResponse.redirect(new URL('/admin/login', request.url));
      response.cookies.delete('admin_token');
      return response;
    }
  }

  // 2. Student & Dashboard Routes
  if (pathname.startsWith('/student') || pathname === '/dashboard') {
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const { payload } = await jose.jwtVerify(token, secret);
      
      // If onboarding is not complete and not already on onboarding page, redirect
      if (!payload.onboardingComplete && pathname !== '/onboarding') {
        return NextResponse.redirect(new URL('/onboarding', request.url));
      }

      // If already completed onboarding and trying to access it, redirect to dashboard
      if (payload.onboardingComplete && pathname === '/onboarding') {
        return NextResponse.redirect(new URL('/student/dashboard', request.url));
      }

      // Handle generic /dashboard redirect to student dashboard
      if (pathname === '/dashboard') {
        return NextResponse.redirect(new URL('/student/dashboard', request.url));
      }

      return NextResponse.next();
    } catch (error) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('auth_token');
      return response;
    }
  }

  // 3. Auth Routes (Login/Signup/Home) - Redirect to dashboard if already logged in
  if (pathname === '/login' || pathname === '/signup' || pathname === '/') {
    const token = request.cookies.get('auth_token')?.value;
    if (token) {
      try {
        const { payload } = await jose.jwtVerify(token, secret);
        if (payload.onboardingComplete) {
          return NextResponse.redirect(new URL('/student/dashboard', request.url));
        } else {
          // If onboarding is not complete, redirect to onboarding
          return NextResponse.redirect(new URL('/onboarding', request.url));
        }
      } catch (error) {}
    }
  }

  return NextResponse.next();
}

export const runtime = 'nodejs';

export const config = {
  matcher: ['/', '/admin/:path*', '/student/:path*', '/dashboard', '/onboarding', '/login', '/signup'],
};

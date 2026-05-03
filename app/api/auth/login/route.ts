import { NextResponse } from 'next/server';
import { authService } from '@/backend/services/auth.service';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const result = await authService.login(email, password);

    const response = NextResponse.json(
      { 
        success: true, 
        message: 'Login successful',
        user: result.user
      },
      { status: 200 }
    );

    // Set HTTP-only cookie
    response.cookies.set({
      name: 'auth_token',
      value: result.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Login Error:', error);
    
    if (error.message === 'Invalid email or password' || error.message.includes('required fields')) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}


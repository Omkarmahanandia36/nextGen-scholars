import { NextResponse } from 'next/server';
import { authService } from '@/backend/services/auth.service';
import { StudentService } from '@/backend/services/student.service';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await authService.verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }

    const { className, subjects } = await request.json();

    if (!className || !subjects || !Array.isArray(subjects) || subjects.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Please provide class and subjects' },
        { status: 400 }
      );
    }

    await StudentService.completeOnboarding(decoded.userId, { className, subjects });

    // Generate new token with onboardingComplete: true
    const newPayload = {
      ...decoded,
      onboardingComplete: true
    };
    // Remove iat and exp if they exist in decoded token to avoid issues
    delete newPayload.iat;
    delete newPayload.exp;

    const newToken = authService.generateToken(newPayload);

    const response = NextResponse.json({ 
      success: true, 
      message: 'Onboarding completed successfully' 
    });

    // Set the new token in the cookie
    response.cookies.set('auth_token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    return response;
  } catch (error: unknown) {
    console.error('Onboarding API Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

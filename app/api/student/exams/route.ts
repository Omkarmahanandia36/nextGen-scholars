import { NextResponse } from 'next/server';
import { authService } from '@/backend/services/auth.service';
import { StudentService } from '@/backend/services/student.service';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
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

    const profile = await StudentService.getProfile(decoded.userId);
    if (!profile) {
      return NextResponse.json({ success: false, message: 'Profile not found' }, { status: 404 });
    }

    const exams = await StudentService.getDailyExams(profile.className);

    return NextResponse.json({
      success: true,
      exams,
      subjects: profile.subjects
    });
  } catch {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

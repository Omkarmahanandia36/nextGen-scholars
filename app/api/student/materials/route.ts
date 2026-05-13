import { NextResponse } from 'next/server';
import { authService } from '@/backend/services/auth.service';
import { StudentService } from '@/backend/services/student.service';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject') || undefined;

    const materials = await StudentService.getMaterials(profile.className, profile.board, subject);
    
    // Only return materials for subjects the student is enrolled in
    const allowedMaterials = materials.filter(m => profile.subjects.includes(m.subject));

    return NextResponse.json({
      success: true,
      materials: allowedMaterials,
      enrolledSubjects: profile.subjects
    });
  } catch (error: unknown) {
    console.error('Materials API Error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { authService } from '@/backend/services/auth.service';
import { StudentService } from '@/backend/services/student.service';
import { ExamService } from '@/backend/services/content.service';
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

    const [materials, exams, results] = await Promise.all([
      StudentService.getMaterials(profile.className),
      StudentService.getDailyExams(profile.className),
      ExamService.getStudentResults(decoded.userId)
    ]);

    return NextResponse.json({
      success: true,
      data: {
        user: {
          name: decoded.name || 'Student', // Assuming name might be in token or we fetch it
          className: profile.className,
          subjects: profile.subjects
        },
        recentMaterials: materials.slice(0, 5),
        upcomingExams: exams,
        stats: {
          materialsCount: materials.length,
          examsCount: exams.length,
          completedExams: results.length
        }
      }
    });
  } catch (error: unknown) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

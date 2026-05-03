import { NextResponse } from 'next/server';
import { authService } from '@/backend/services/auth.service';
import { StudentService } from '@/backend/services/student.service';
import { AIService } from '@/backend/services/ai.service';
import { AdminContentService } from '@/backend/services/content.service';
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

    const { subject } = await request.json();
    if (!subject) {
      return NextResponse.json({ success: false, message: 'Subject is required' }, { status: 400 });
    }

    const profile = await StudentService.getProfile(decoded.userId);
    if (!profile) {
      return NextResponse.json({ success: false, message: 'Profile not found' }, { status: 404 });
    }

    // Generate via AI on every request to ensure a new set of questions as requested
    const quizData = await AIService.generateQuiz(profile.className, subject);
    
    // Save to database
    const result = await AdminContentService.addExam(quizData);

    return NextResponse.json({
      success: true,
      message: 'Exam generated successfully',
      examId: result.insertedId
    });
  } catch (error: unknown) {
    console.error('Exam Generation API Error:', error);
    return NextResponse.json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 });
  }
}

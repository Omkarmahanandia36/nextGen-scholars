import { NextResponse } from 'next/server';
import { authService } from '@/backend/services/auth.service';
import { StudentService } from '@/backend/services/student.service';
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

    const { title, subject, questions, duration, folderName } = await request.json();
    
    if (!title || !subject || !questions || questions.length === 0) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    const profile = await StudentService.getProfile(decoded.userId);
    if (!profile) {
      return NextResponse.json({ success: false, message: 'Profile not found' }, { status: 404 });
    }

    // Format questions for the database schema
    const formattedQuestions = questions.map((q: any) => ({
      questionText: q.question,
      options: q.options,
      correctOptionIndex: q.correctOption,
      explanation: q.explanation || ''
    }));

    // Save as a temporary/most-probable exam for this student's class
    const result = await AdminContentService.addExam({
      title: title || `Practice: ${subject}`,
      description: `Imported practice session for ${subject}`,
      subject,
      className: profile.className,
      board: profile.board,
      folderName: folderName || 'Imported',
      examType: 'most-probable',
      duration: duration || 30,
      questions: formattedQuestions
    });

    return NextResponse.json({
      success: true,
      message: 'Exam imported successfully',
      examId: result.insertedId
    });
  } catch (error: unknown) {
    console.error('Exam Import API Error:', error);
    return NextResponse.json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 });
  }
}

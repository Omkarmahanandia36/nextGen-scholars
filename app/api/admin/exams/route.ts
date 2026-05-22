import { NextResponse } from 'next/server';
import { AdminContentService } from '@/backend/services/content.service';
import { authService } from '@/backend/services/auth.service';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await authService.verifyToken(token);
    
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const exams = await AdminContentService.getAllExams();
    return NextResponse.json(exams);
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await authService.verifyToken(token);
    
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    
    if (body) {
      if (typeof body.durationMinutes !== 'number' && typeof body.duration === 'number') {
        body.durationMinutes = body.duration;
      } else if (typeof body.durationMinutes !== 'number') {
        body.durationMinutes = 30;
      }
    }
    
    // Format questions to standard database schema (questionText, correctOptionIndex)
    if (body && body.questions && Array.isArray(body.questions)) {
      body.questions = body.questions.map((q: any) => ({
        questionText: q.questionText || q.question || '',
        options: q.options || [],
        correctOptionIndex: typeof q.correctOptionIndex === 'number' 
          ? q.correctOptionIndex 
          : (typeof q.correctOption === 'number' ? q.correctOption : 0),
        explanation: q.explanation || ''
      }));
    }

    const result = await AdminContentService.addExam(body);
    return NextResponse.json(result);
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 });
  }
}

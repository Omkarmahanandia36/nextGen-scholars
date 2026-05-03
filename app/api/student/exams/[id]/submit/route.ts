import { NextResponse } from 'next/server';
import { authService } from '@/backend/services/auth.service';
import { ExamService } from '@/backend/services/content.service';
import clientPromise from '@/backend/config/mongodb';
import { ObjectId } from 'mongodb';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const { answers } = await request.json();
    
    const client = await clientPromise;
    const db = client.db();
    
    const exam = await db.collection('practice_exams').findOne({ _id: new ObjectId(params.id) });
    if (!exam) {
      return NextResponse.json({ success: false, message: 'Exam not found' }, { status: 404 });
    }

    // Calculate score
    let score = 0;
    const processedAnswers = exam.questions.map((q: any, index: number) => {
      const isCorrect = answers[index] === q.correctOptionIndex;
      if (isCorrect) score++;
      return {
        questionIndex: index,
        selectedOptionIndex: answers[index],
        isCorrect
      };
    });

    const result = {
      examId: params.id,
      studentId: decoded.userId,
      score,
      totalQuestions: exam.questions.length,
      answers: processedAnswers,
    };

    await ExamService.submitResult(result as any);

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('Submit Exam Error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

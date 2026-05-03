import { NextResponse } from 'next/server';
import { authService } from '@/backend/services/auth.service';
import clientPromise from '@/backend/config/mongodb';
import { ObjectId } from 'mongodb';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await authService.verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();
    
    const exam = await db.collection('practice_exams').findOne({ _id: new ObjectId(id) });
    
    if (!exam) {

      return NextResponse.json({ success: false, message: 'Exam not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, exam });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

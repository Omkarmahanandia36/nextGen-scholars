import { NextResponse } from 'next/server';
import clientPromise from '@/backend/config/mongodb';
import { ObjectId } from 'mongodb';
import { authService } from '@/backend/services/auth.service';
import { cookies } from 'next/headers';

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await authService.verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const client = await clientPromise;
    const db = client.db("nextgenscholar");

    // 1. Delete from users collection
    const result = await db.collection('users').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 2. Cascade delete from student_profiles collection
    await db.collection('student_profiles').deleteMany({
      $or: [
        { userId: new ObjectId(id) },
        { userId: id }
      ]
    });

    // 3. Cascade delete from exam_results collection
    await db.collection('exam_results').deleteMany({
      $or: [
        { studentId: new ObjectId(id) },
        { studentId: id }
      ]
    });

    return NextResponse.json({ success: true, message: 'User and all associated data deleted successfully' });
  } catch (error: unknown) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}

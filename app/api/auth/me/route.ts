import { NextResponse } from 'next/server';
import { authService } from '@/backend/services/auth.service';
import { cookies } from 'next/headers';
import clientPromise from '@/backend/config/mongodb';
import { ObjectId } from 'mongodb';

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

    const client = await clientPromise;
    const db = client.db();
    
    const user = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const profile = await db.collection('student_profiles').findOne({ userId: user._id });
    
    let tutors = [];
    if (user.role === 'student' && profile?.tutorIds) {
      const tutorObjectIds = profile.tutorIds.map((id: string) => new ObjectId(id));
      tutors = await db.collection('tutors').find({ _id: { $in: tutorObjectIds } }).toArray();
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        onboardingComplete: profile?.onboardingComplete || false,
        tutors: tutors.map(t => ({
          name: t.name,
          specialization: t.specialization,
          imageUrl: t.imageUrl
        }))
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

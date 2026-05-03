import { NextResponse } from 'next/server';
import clientPromise from '@/backend/config/mongodb';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const user = await db.collection('users').findOne({ email });

    if (!user) {
      // For security, don't reveal if user exists or not
      return NextResponse.json({ 
        success: true, 
        message: 'If an account exists with this email, you will receive reset instructions shortly.' 
      });
    }

    // In a real app, generate a reset token, save it to DB, and send an email.
    // For now, we simulate success.
    console.log(`Password reset requested for: ${email}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Password reset link has been sent to your email.' 
    });
  } catch (error: any) {
    console.error('Forgot Password API Error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import * as jose from 'jose';
import clientPromise from '@/backend/config/mongodb';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const secret = new TextEncoder().encode(JWT_SECRET);

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const client = await clientPromise;
    const db = client.db("academy");

    const admin = await db.collection('admins').findOne({ email });
    if (!admin) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = await new jose.SignJWT({
      id: admin._id.toString(),
      email: admin.email,
      role: admin.role
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(secret);

    const response = NextResponse.json({ success: true });
    
    // Set cookie
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 24 hours
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('admin_token');
  return response;
}

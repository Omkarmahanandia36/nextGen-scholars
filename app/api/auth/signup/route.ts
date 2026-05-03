import { NextResponse } from 'next/server';
import { authService } from '@/backend/services/auth.service';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    const result = await authService.signup(name, email, password);

    return NextResponse.json(result, { status: 201 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Signup Error:', error);
    
    if (error.message.includes('already exists') || error.message.includes('required fields')) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { authService } from '@/backend/services/auth.service';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    const result = await authService.signup(name, email, password);

    return NextResponse.json(result, { status: 201 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    console.error('Signup Error:', error);
    
    if (errorMessage.includes('already exists') || errorMessage.includes('required fields')) {
      return NextResponse.json(
        { success: false, message: errorMessage },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

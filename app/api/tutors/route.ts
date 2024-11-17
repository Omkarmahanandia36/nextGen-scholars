import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import type { Tutor } from '@/models/Tutor';

async function verifyRecaptcha(token: string) {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  
  try {
    console.log('Verifying reCAPTCHA token:', token.substring(0, 20) + '...');
    console.log('Using secret key:', secretKey?.substring(0, 10) + '...');
    
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${token}`,
    });

    const data = await response.json();
    console.log('reCAPTCHA verification response:', data);
    return data.success;
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Received tutor registration data:', { ...body, recaptchaToken: 'HIDDEN' });
    
    const { recaptchaToken, ...formData } = body;

    // Verify reCAPTCHA token first
    const isValidCaptcha = await verifyRecaptcha(recaptchaToken);
    if (!isValidCaptcha) {
      console.log('reCAPTCHA verification failed');
      return NextResponse.json(
        { success: false, error: 'Invalid reCAPTCHA verification' },
        { status: 400 }
      );
    }

    console.log('reCAPTCHA verification successful');

    const client = await clientPromise;
    const db = client.db("academy");

    const tutor: Tutor = {
      ...formData,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Basic validation
    if (!tutor.email || !tutor.fullName || !tutor.phone) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingTutor = await db.collection('tutors').findOne({ email: tutor.email });
    if (existingTutor) {
      return NextResponse.json(
        { success: false, error: 'Email already registered' },
        { status: 400 }
      );
    }

    const result = await db.collection('tutors').insertOne(tutor);
    console.log('Saved tutor to database with ID:', result.insertedId);

    return NextResponse.json({ 
      success: true, 
      tutorId: result.insertedId 
    });
  } catch (error) {
    console.error('Error registering tutor:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to register tutor' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("academy");
    
    const tutors = await db.collection('tutors')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    return NextResponse.json({ 
      success: true, 
      tutors 
    });
  } catch (error) {
    console.error('Error fetching tutors:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tutors' },
      { status: 500 }
    );
  }
}

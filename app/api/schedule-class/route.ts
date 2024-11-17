import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import type { ClassSchedule } from '@/models/ClassSchedule';

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
    console.log('Received form data:', { ...body, recaptchaToken: 'HIDDEN' });
    
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

    // Proceed with database operation after verification
    const client = await clientPromise;
    const db = client.db("academy");

    const classSchedule: ClassSchedule = {
      ...formData,
      status: 'pending',
      createdAt: new Date(),
    };

    const result = await db.collection('class-schedules').insertOne(classSchedule);
    console.log('Saved to database with ID:', result.insertedId);

    return NextResponse.json({ 
      success: true, 
      scheduleId: result.insertedId 
    });
  } catch (error) {
    console.error('Error scheduling class:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to schedule class' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("academy");
    
    const schedules = await db.collection('class-schedules').find({}).toArray();
    
    return NextResponse.json({ 
      success: true, 
      schedules 
    });
  } catch (error) {
    console.error('Error fetching class schedules:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch class schedules' },
      { status: 500 }
    );
  }
}

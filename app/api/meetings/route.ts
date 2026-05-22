import { NextResponse } from 'next/server';
import clientPromise from '@/backend/config/mongodb';
import type { Meeting } from '@/backend/models/Meeting';
import { sendMeetingEmail } from '@/backend/services/email.service';

export const dynamic = 'force-dynamic';

async function verifyRecaptcha(token: string) {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  
  if (!secretKey || token === 'dummy-token') {
    console.log('reCAPTCHA verification bypassed (key missing or dummy token)');
    return true;
  }
  
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
    console.log('Received meeting request data:', { ...body, recaptchaToken: 'HIDDEN' });
    
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
    const db = client.db("nextgenscholar");

    const meeting: Meeting = {
      ...formData,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Validate type first
    if (!meeting.type || !['call', 'video', 'message'].includes(meeting.type)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid meeting type. Must be call, video, or message.' 
        },
        { status: 400 }
      );
    }

    // Validate common required fields
    if (
      !meeting.name || typeof meeting.name !== 'string' ||
      !meeting.email || typeof meeting.email !== 'string' ||
      !meeting.phone || typeof meeting.phone !== 'string'
    ) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing or invalid required fields. Please ensure name, email, and phone are provided.' 
        },
        { status: 400 }
      );
    }

    // Ensure message is a string (even if empty) or default to empty string
    if (meeting.message === undefined || meeting.message === null) {
      meeting.message = '';
    } else if (typeof meeting.message !== 'string') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Message must be a string.' 
        },
        { status: 400 }
      );
    }

    // Validate message only if it is of type 'message'
    if (meeting.type === 'message') {
      if (!meeting.message || meeting.message.trim() === '') {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Message text is required when sending a message.' 
          },
          { status: 400 }
        );
      }
    }

    // Validate date and time only for call and video meetings
    if (meeting.type !== 'message') {
      if (!meeting.preferredDate || typeof meeting.preferredDate !== 'string' ||
          !meeting.preferredTime || typeof meeting.preferredTime !== 'string') {
        return NextResponse.json(
          { 
            success: false, 
            error: 'For call or video meetings, preferred date and time are required.' 
          },
          { status: 400 }
        );
      }
    }

    const result = await db.collection('meetings').insertOne(meeting);
    console.log('Saved meeting to database with ID:', result.insertedId);

    // Send email notification
    try {
      const emailResult = await sendMeetingEmail(formData);
      if (!emailResult.success) {
        console.error('Failed to send meeting email notification:', emailResult.error);
      } else {
        console.log('Meeting email notification sent successfully');
      }
    } catch (emailError) {
      console.error('Unexpected error sending meeting email notification:', emailError);
    }

    return NextResponse.json({ 
      success: true, 
      meetingId: result.insertedId 
    });
  } catch (error) {
    console.error('Error scheduling meeting:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to schedule meeting' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("nextgenscholar");
    
    const meetings = await db.collection('meetings')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    return NextResponse.json({ 
      success: true, 
      meetings 
    });
  } catch (error) {
    console.error('Error fetching meetings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch meetings' },
      { status: 500 }
    );
  }
}

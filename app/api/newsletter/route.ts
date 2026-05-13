import { NextResponse } from 'next/server';
import clientPromise from '@/backend/config/mongodb';
import type { Newsletter } from '@/backend/models/Newsletter';
import { sendNewsletterEmail } from '@/backend/services/email.service';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("nextgenscholar");

    // Check if email already exists
    const existingSubscriber = await db.collection('newsletter').findOne({ email });
    if (existingSubscriber) {
      if (existingSubscriber.subscribed) {
        return NextResponse.json(
          { success: false, error: 'Email already subscribed' },
          { status: 400 }
        );
      } else {
        // Re-subscribe if previously unsubscribed
        await db.collection('newsletter').updateOne(
          { email },
          {
            $set: {
              subscribed: true,
              updatedAt: new Date(),
            },
          }
        );
        return NextResponse.json({ 
          success: true, 
          message: 'Successfully re-subscribed to newsletter' 
        });
      }
    }

    // Create new subscriber
    const subscriber: Newsletter = {
      email,
      subscribed: true,
      subscribedAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection('newsletter').insertOne(subscriber);

    // Send email notification
    try {
      await sendNewsletterEmail(email);
    } catch (emailError) {
      console.error('Failed to send newsletter notification email:', emailError);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Successfully subscribed to newsletter' 
    });

  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to subscribe to newsletter' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("nextgenscholar");

    const subscribers = await db.collection('newsletter')
      .find({})
      .sort({ subscribedAt: -1 })
      .toArray();

    return NextResponse.json({ 
      success: true, 
      subscribers 
    });

  } catch (error) {
    console.error('Error fetching newsletter subscribers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch newsletter subscribers' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { email } = await request.json();

    const client = await clientPromise;
    const db = client.db("nextgenscholar");

    const result = await db.collection('newsletter').updateOne(
      { email },
      {
        $set: {
          subscribed: false,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Email not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Successfully unsubscribed from newsletter' 
    });

  } catch (error) {
    console.error('Error unsubscribing from newsletter:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to unsubscribe from newsletter' },
      { status: 500 }
    );
  }
}

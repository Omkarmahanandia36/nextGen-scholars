import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

async function seed() {
  const client = await MongoClient.connect(MONGODB_URI!);
  const db = client.db();

  console.log('Seeding materials...');
  const materials = [
    {
      title: 'Introduction to Calculus',
      description: 'Basics of derivatives and integrals.',
      type: 'pdf',
      url: 'https://example.com/calculus.pdf',
      className: 'Class 12',
      subject: 'Mathematics',
      createdAt: new Date(),
    },
    {
      title: 'Organic Chemistry Basics',
      description: 'Understanding hydrocarbons.',
      type: 'video',
      url: 'https://example.com/organic.mp4',
      className: 'Class 12',
      subject: 'Chemistry',
      createdAt: new Date(),
    }
  ];
  await db.collection('materials').insertMany(materials);

  console.log('Seeding practice exams...');
  const exams = [
    {
      title: 'Mathematics Daily Quiz',
      date: new Date().toISOString().split('T')[0],
      className: 'Class 12',
      subject: 'Mathematics',
      questions: [
        {
          questionText: 'What is the derivative of x^2?',
          options: ['x', '2x', 'x^2', '2'],
          correctOptionIndex: 1,
          explanation: 'Using power rule, d/dx(x^n) = nx^(n-1).'
        },
        {
          questionText: 'What is the integral of sin(x)?',
          options: ['cos(x)', '-cos(x)', 'sin(x)', 'tan(x)'],
          correctOptionIndex: 1,
          explanation: 'The derivative of -cos(x) is sin(x).'
        }
      ],
      durationMinutes: 10,
      createdAt: new Date(),
    }
  ];
  await db.collection('practice_exams').insertMany(exams);

  console.log('Seeding complete!');
  await client.close();
}

seed().catch(console.error);

import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = 'mongodb://localhost:27017/nextgen_scholar';

async function seed() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db();

    console.log('Clearing existing data...');
    await db.collection('materials').deleteMany({});
    await db.collection('practice_exams').deleteMany({});

    console.log('Seeding materials...');
    await db.collection('materials').insertMany([
      {
        title: 'Introduction to Quantum Physics',
        description: 'Basic concepts of quantum mechanics for beginners.',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=Qw9tXU3Xo7Q',
        className: 'Class 10',
        subject: 'Physics',
        createdBy: new ObjectId(),
        createdAt: new Date()
      },
      {
        title: 'Algebra Fundamentals PDF',
        description: 'Essential algebra formulas and examples.',
        type: 'pdf',
        url: 'https://www.google.com',
        className: 'Class 10',
        subject: 'Mathematics',
        createdBy: new ObjectId(),
        createdAt: new Date()
      }
    ]);

    console.log('Seeding practice exams...');
    await db.collection('practice_exams').insertMany([
      {
        title: 'Physics Daily Challenge',
        date: new Date().toISOString().split('T')[0],
        className: 'Class 10',
        subject: 'Physics',
        durationMinutes: 10,
        questions: [
          {
            questionText: 'What is the SI unit of Force?',
            options: ['Newton', 'Joule', 'Watt', 'Pascal'],
            correctOptionIndex: 0,
            explanation: 'Force is measured in Newtons (N).'
          },
          {
            questionText: 'Light travels fastest in:',
            options: ['Water', 'Glass', 'Vacuum', 'Air'],
            correctOptionIndex: 2,
            explanation: 'Light travels at its maximum speed in a vacuum.'
          }
        ],
        createdAt: new Date()
      },
      {
        title: 'Math Morning Quiz',
        date: new Date().toISOString().split('T')[0],
        className: 'Class 10',
        subject: 'Mathematics',
        durationMinutes: 15,
        questions: [
          {
            questionText: 'What is the square root of 144?',
            options: ['10', '12', '14', '16'],
            correctOptionIndex: 1
          }
        ],
        createdAt: new Date()
      }
    ]);

    console.log('Seed completed successfully!');
  } catch (error) {
    console.error('Seed error:', error);
  } finally {
    await client.close();
  }
}

seed();

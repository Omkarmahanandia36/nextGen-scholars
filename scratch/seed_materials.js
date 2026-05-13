const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function seed() {
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');
    const db = client.db('nextgenscholar');

    const materials = [
      {
        title: 'Introduction to Calculus',
        description: 'Comprehensive guide to basic calculus concepts.',
        type: 'PDF',
        url: 'https://example.com/calculus.pdf',
        subject: 'Mathematics',
        className: 'Class 11',
        board: 'CBSE',
        folderName: 'Calculus',
        createdAt: new Date()
      },
      {
        title: 'Quantum Mechanics Basics',
        description: 'Video lecture on quantum mechanics for beginners.',
        type: 'Video',
        url: 'https://example.com/quantum.mp4',
        subject: 'Physics',
        className: 'Class 12',
        board: 'ICSE',
        folderName: 'Modern Physics',
        createdAt: new Date()
      },
      {
        title: 'Organic Chemistry Notes',
        description: 'Detailed notes on organic reactions.',
        type: 'PDF',
        url: 'https://example.com/organic.pdf',
        subject: 'Chemistry',
        className: 'Class 12',
        board: 'CBSE',
        folderName: 'Organic Chemistry',
        createdAt: new Date()
      }
    ];

    const result = await db.collection('materials').insertMany(materials);
    console.log(`${result.insertedCount} materials inserted`);

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await client.close();
  }
}

seed();

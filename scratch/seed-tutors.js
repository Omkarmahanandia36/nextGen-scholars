const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function seedTutor() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is not defined');
    return;
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db();

    // 1. Create a sample tutor if none exists
    const tutorCount = await db.collection('tutors').countDocuments();
    let tutorId;

    if (tutorCount === 0) {
      console.log('No tutors found. Creating a sample tutor...');
      const result = await db.collection('tutors').insertOne({
        name: 'Dr. Sarah Wilson',
        email: 'sarah.wilson@nextgen.com',
        specialization: ['Advanced Mathematics', 'Physics'],
        bio: 'Expert in competitive exam preparation with 10+ years of experience.',
        imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150',
        createdAt: new Date()
      });
      tutorId = result.insertedId;
      console.log('Sample tutor created:', tutorId);
    } else {
      const existingTutor = await db.collection('tutors').findOne();
      tutorId = existingTutor._id;
      console.log('Using existing tutor:', tutorId);
    }

    // 2. Find all students and assign this tutor to them
    console.log('Assigning tutor to all student profiles...');
    const result = await db.collection('student_profiles').updateMany(
      {},
      { $addToSet: { tutorIds: tutorId } }
    );

    console.log(`Updated ${result.modifiedCount} student profiles.`);

  } catch (error) {
    console.error('Error seeding tutor data:', error);
  } finally {
    await client.close();
  }
}

seedTutor();

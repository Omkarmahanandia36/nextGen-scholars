const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function run() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(); 
    const materials = db.collection('materials');

    const result = await materials.insertOne({
      title: 'modals',
      description: 'Comprehensive guide to English Modals.',
      type: 'pdf',
      url: 'https://bufr1aofgt.ufs.sh/f/ibCoBd9HWAqxAFpdWBTRX7VeCIxBsaGPYrnZ61L3USym2Ei4',
      className: '8', // Assuming class 8
      board: 'CBSE', // Assuming CBSE
      subject: 'English',
      folderName: '1. Grammar',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log(`Successfully inserted document with _id: ${result.insertedId}`);
  } finally {
    await client.close();
  }
}

run().catch(console.dir);

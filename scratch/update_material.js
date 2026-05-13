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

    const result = await materials.updateOne(
      { title: 'modals' },
      { $set: { className: 'Class 8' } }
    );

    console.log(`Successfully updated document: ${result.modifiedCount}`);
  } finally {
    await client.close();
  }
}

run().catch(console.dir);

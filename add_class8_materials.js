const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function addMaterials() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI not found");
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to DB');

    const db = client.db(); 

    const dummyMaterials = [
      {
        title: "Tenses Rules",
        description: "Comprehensive guide to English tenses.",
        url: "https://example.com/tenses.pdf",
        type: "pdf",
        className: "Class 8",
        board: "CBSE",
        subject: "English",
        folderName: "Grammar",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "The Best Christmas Present in the World - Summary",
        description: "Chapter 1 summary and analysis.",
        url: "https://example.com/christmas_present.pdf",
        type: "pdf",
        className: "Class 8",
        board: "CBSE",
        subject: "English",
        folderName: "Literature",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const result = await db.collection('materials').insertMany(dummyMaterials);
    console.log(`Successfully inserted ${result.insertedCount} materials.`);

  } finally {
    await client.close();
  }
}

addMaterials().catch(console.error);

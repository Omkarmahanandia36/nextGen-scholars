const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function updateMaterials() {
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

    // Delete the materials that are falling into the "General" folder
    const deleteResult = await db.collection('materials').deleteMany({ 
      $or: [
        { folderName: "" },
        { folderName: "General" },
        { folderName: null },
        { folderName: { $exists: false } }
      ]
    });
    console.log(`Deleted ${deleteResult.deletedCount} materials causing the 'General' folder.`);

    // Rename Grammar folder
    const updateResult1 = await db.collection('materials').updateMany(
      { folderName: "Grammar" },
      { $set: { folderName: "1. Grammar" } }
    );
    console.log(`Updated ${updateResult1.modifiedCount} materials to '1. Grammar'.`);

    // Rename Literature folder
    const updateResult2 = await db.collection('materials').updateMany(
      { folderName: "Literature" },
      { $set: { folderName: "2. Literature" } }
    );
    console.log(`Updated ${updateResult2.modifiedCount} materials to '2. Literature'.`);

  } finally {
    await client.close();
  }
}

updateMaterials().catch(console.error);

const { MongoClient, ObjectId } = require('mongodb');
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

    // nextgenscholar database
    const db = client.db(); 

    const adminId = new ObjectId("6a001ddf4e1971bd3ea7b31c");

    const dummyMaterials = [
      {
        title: "Cell Structure Notes",
        description: "Detailed notes on cell structure and functions.",
        fileUrl: "https://example.com/cell_structure.pdf",
        fileType: "pdf",
        className: "Class 10",
        board: "CBSE",
        subject: "Biology",
        folderName: "Chapter 1: The Fundamental Unit of Life",
        uploadedBy: adminId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "Cell Division PPT",
        description: "Presentation on Mitosis and Meiosis.",
        fileUrl: "https://example.com/cell_division.ppt",
        fileType: "ppt",
        className: "Class 10",
        board: "CBSE",
        subject: "Biology",
        folderName: "Chapter 1: The Fundamental Unit of Life",
        uploadedBy: adminId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "Tissue Types Handout",
        description: "Summary of plant and animal tissues.",
        fileUrl: "https://example.com/tissues.pdf",
        fileType: "pdf",
        className: "Class 10",
        board: "CBSE",
        subject: "Biology",
        folderName: "Chapter 2: Tissues",
        uploadedBy: adminId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "Letter Writing Format",
        description: "Formal and informal letter formats.",
        fileUrl: "https://example.com/letter_writing.pdf",
        fileType: "pdf",
        className: "Class 10",
        board: "CBSE",
        subject: "English",
        folderName: "Grammar & Writing",
        uploadedBy: adminId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "First Flight Poems Summary",
        description: "Summary and analysis of all poems.",
        fileUrl: "https://example.com/poems_summary.pdf",
        fileType: "pdf",
        className: "Class 10",
        board: "CBSE",
        subject: "English",
        folderName: "Literature Reader",
        uploadedBy: adminId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "General Syllabus Outline",
        description: "Complete syllabus for the year.",
        fileUrl: "https://example.com/syllabus.pdf",
        fileType: "pdf",
        className: "Class 10",
        board: "CBSE",
        subject: "English",
        folderName: "", // General
        uploadedBy: adminId,
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

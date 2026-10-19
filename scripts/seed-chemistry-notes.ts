import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { MongoClient, ObjectId } from 'mongodb';
import fs from 'fs';
import path from 'path';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI not found");
  process.exit(1);
}

async function seedChemistryMaterialsAndExams() {
  const client = new MongoClient(MONGODB_URI!);

  try {
    await client.connect();
    console.log('Connected to MongoDB');
    const db = client.db();

    // 1. Read the JSON note
    const jsonPath = path.join(process.cwd(), 'data', 'notes', 'icse', 'class-10', 'chemistry', 'chemical-bonding.json');
    const rawData = fs.readFileSync(jsonPath, 'utf-8');
    const noteData = JSON.parse(rawData);

    // 2. Prepare Materials documents
    const materialsCollection = db.collection('materials');
    
    // Clean up any existing Chemical Bonding note materials
    await materialsCollection.deleteMany({
      subject: 'Chemistry',
      folderName: 'Chemical Bonding'
    });

    const materialsToInsert = [
      {
        title: "ICSE Class 10 Chemistry: Chemical Bonding - Complete Study Guide",
        description: "Electrovalent, Covalent & Co-ordinate Bonding - Complete Chapter Notes, Electron Dot Structures, Formulas, Glossary, Practice Questions and 30-Mark Unit Test.",
        type: "note",
        url: "/notes/chemical-bonding.json",
        subject: "Chemistry",
        className: "Class 10",
        board: "ICSE",
        folderName: "Chemical Bonding",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "Chemical Bonding - Chapter 2 Comprehensive Notes & Board Qs",
        description: "Official ICSE Class 10 Chemistry notes including full theory (Sections A-M), comparison tables, formulas, and 2020-2025 board exam questions.",
        type: "note",
        url: "/notes/chemical-bonding.json",
        subject: "Chemistry",
        className: "Class 10",
        board: "CBSE",
        folderName: "Chemical Bonding",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const matResult = await materialsCollection.insertMany(materialsToInsert);
    console.log(`✅ Inserted ${matResult.insertedCount} study guide material(s) into 'materials' collection.`);

    // 3. Prepare Practice Exam from the MCQs in the JSON note
    const practiceExamsCollection = db.collection('practice_exams');
    
    await practiceExamsCollection.deleteMany({
      subject: 'Chemistry',
      folderName: 'Chemical Bonding'
    });

    // Map MCQs from JSON note to PracticeExam questions format
    const mcqs = noteData.practice_questions?.mcqs || [];
    const questions = mcqs.map((q: any) => {
      let optionsList: string[] = [];
      let correctIdx = 0;

      if (q.options) {
        const keys = Object.keys(q.options);
        optionsList = keys.map(k => q.options[k]);
        
        // Find which option matches answer
        const ansStr = (q.answer || '').toString().trim().toUpperCase();
        const firstLetter = ansStr.charAt(0);
        const idx = keys.findIndex(k => k.toUpperCase() === firstLetter);
        if (idx !== -1) {
          correctIdx = idx;
        }
      } else {
        optionsList = ["Option A", "Option B", "Option C", "Option D"];
      }

      return {
        questionText: q.question,
        options: optionsList,
        correctOptionIndex: correctIdx,
        explanation: q.answer ? `Correct answer: ${q.answer}. ${q.note || ''}` : 'Refer to ICSE Chemistry Chemical Bonding Study Guide.'
      };
    });

    const examsToInsert = [
      {
        title: "ICSE Class 10 Chemistry: Chemical Bonding - Board & Practice Questions",
        description: "Official ICSE Class 10 Board exam & workbook multiple choice questions on Chemical Bonding (Electrovalent, Covalent & Coordinate).",
        board: "ICSE",
        className: "Class 10",
        subject: "Chemistry",
        folderName: "Chemical Bonding",
        examType: "previous-year",
        durationMinutes: 30,
        date: new Date().toISOString().split('T')[0],
        questions,
        createdBy: new ObjectId('507f1f77bcf86cd799439011'),
        createdAt: new Date()
      },
      {
        title: "ICSE Class 10 Chemistry: Chemical Bonding - Most Probable Board Questions",
        description: "Most probable exam questions for ICSE Class 10 Chemistry Chapter 2: Chemical Bonding.",
        board: "ICSE",
        className: "Class 10",
        subject: "Chemistry",
        folderName: "Chemical Bonding",
        examType: "most-probable",
        durationMinutes: 30,
        date: new Date().toISOString().split('T')[0],
        questions,
        createdBy: new ObjectId('507f1f77bcf86cd799439011'),
        createdAt: new Date()
      }
    ];

    const examResult = await practiceExamsCollection.insertMany(examsToInsert);
    console.log(`✅ Inserted ${examResult.insertedCount} exam paper(s) into 'practice_exams' collection.`);

    console.log('🎉 Seeding successfully completed!');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
  } finally {
    await client.close();
  }
}

seedChemistryMaterialsAndExams();

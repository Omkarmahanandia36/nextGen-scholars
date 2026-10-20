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

async function seedPeriodicTableMaterialsAndExams() {
  const client = new MongoClient(MONGODB_URI!);

  try {
    await client.connect();
    console.log('Connected to MongoDB');
    const db = client.db();

    // 1. Read the JSON note
    const jsonPath = path.join(process.cwd(), 'data', 'notes', 'icse', 'class-10', 'chemistry', 'periodic-table.json');
    const rawData = fs.readFileSync(jsonPath, 'utf-8');
    const noteData = JSON.parse(rawData);

    // 2. Prepare Materials documents
    const materialsCollection = db.collection('materials');
    
    // Clean up any existing Periodic Table note materials
    await materialsCollection.deleteMany({
      subject: 'Chemistry',
      folderName: 'Periodic Table'
    });

    const materialsToInsert = [
      {
        title: "ICSE Class 10 Chemistry: Periodic Table - Complete Chapter Study Guide",
        description: "Chapter 1 Comprehensive Notes: Modern Periodic Law, Periods & Groups, Atomic Size, Ionisation Potential, Electron Affinity, Electronegativity, Metallic Character, 2017–2025 Board Qs & 30-Mark Unit Test.",
        type: "note",
        url: "/notes/periodic-table.json",
        subject: "Chemistry",
        className: "Class 10",
        board: "ICSE",
        folderName: "Periodic Table",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "Periodic Table - Periodic Properties & Trends Comprehensive Guide",
        description: "Complete study material for Class 10 Chemistry: Atomic size, I.P., E.A., E.N., metallic character across periods and down groups with comparison tables.",
        type: "note",
        url: "/notes/periodic-table.json",
        subject: "Chemistry",
        className: "Class 10",
        board: "CBSE",
        folderName: "Periodic Table",
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
      folderName: 'Periodic Table'
    });

    // Map MCQs from JSON note to PracticeExam questions format
    const mcqs = noteData.practice_questions?.mcqs || [];
    const questions = mcqs.map((q: any) => {
      let optionsList: string[] = [];
      let correctIdx = 0;

      if (Array.isArray(q.options)) {
        optionsList = q.options;
        const ansStr = (q.answer || '').toString().trim().toLowerCase();
        const foundIdx = optionsList.findIndex(o => ansStr.includes(o.toLowerCase()) || o.toLowerCase().includes(ansStr));
        if (foundIdx !== -1) {
          correctIdx = foundIdx;
        }
      } else if (q.options && typeof q.options === 'object') {
        const keys = Object.keys(q.options);
        optionsList = keys.map(k => q.options[k]);
        
        // Find which option matches answer (e.g. "B. Chlorine" -> "B" or "Chlorine")
        const ansStr = (q.answer || '').toString().trim().toUpperCase();
        const firstLetter = ansStr.charAt(0);
        const idx = keys.findIndex(k => k.toUpperCase() === firstLetter);
        if (idx !== -1) {
          correctIdx = idx;
        } else {
          const matchIdx = optionsList.findIndex(val => ansStr.includes(val.toUpperCase()) || val.toUpperCase().includes(ansStr));
          if (matchIdx !== -1) correctIdx = matchIdx;
        }
      } else {
        optionsList = ["Option A", "Option B", "Option C", "Option D"];
      }

      return {
        questionText: q.question,
        options: optionsList,
        correctOptionIndex: correctIdx,
        explanation: q.answer ? `Correct answer: ${q.answer}. ${q.note || ''}` : 'Refer to ICSE Chemistry Periodic Table Study Guide.'
      };
    });

    const examsToInsert = [
      {
        title: "ICSE Class 10 Chemistry: Periodic Table - Board Exam MCQs & PYQs",
        description: "Official ICSE Class 10 Chemistry Board Examination multiple choice questions (2017–2025) on Periodic Properties and Trends.",
        board: "ICSE",
        className: "Class 10",
        subject: "Chemistry",
        folderName: "Periodic Table",
        examType: "previous-year",
        durationMinutes: 30,
        date: new Date().toISOString().split('T')[0],
        questions,
        createdBy: new ObjectId('507f1f77bcf86cd799439011'),
        createdAt: new Date()
      },
      {
        title: "ICSE Class 10 Chemistry: Periodic Table - Most Probable Board Questions",
        description: "Most probable exam questions for ICSE Class 10 Chemistry Chapter 1: Periodic Table & Periodic Properties.",
        board: "ICSE",
        className: "Class 10",
        subject: "Chemistry",
        folderName: "Periodic Table",
        examType: "most-probable",
        durationMinutes: 30,
        date: new Date().toISOString().split('T')[0],
        questions,
        createdBy: new ObjectId('507f1f77bcf86cd799439011'),
        createdAt: new Date()
      }
    ];

    const examResult = await practiceExamsCollection.insertMany(examsToInsert);
    console.log(`✅ Inserted ${examResult.insertedCount} exam paper(s) into 'practice_exams' collection with ${questions.length} questions each.`);

    console.log('🎉 Periodic Table seeding successfully completed!');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
  } finally {
    await client.close();
  }
}

seedPeriodicTableMaterialsAndExams();

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

// Override/ensure process.env has the correct settings
if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI is not set in .env.local");
  process.exit(1);
}

async function runIntegrationTest() {
  console.log("🚀 Starting Practice Exam Filtering & Database Integration Test (Dynamic Imports)...");

  // Dynamically import backend services after environment is loaded
  const { AdminContentService } = await import("../backend/services/content.service");
  const { StudentService } = await import("../backend/services/student.service");
  const { MongoClient } = await import("mongodb");

  const client = new MongoClient(process.env.MONGODB_URI!);
  try {
    await client.connect();
    
    // 1. Create a mock exam object
    const mockExam = {
      title: "Test Integration Exam - Force and Laws of Motion",
      description: "Automated test for Class, Board, Chapter dynamic filters",
      subject: "Physics",
      className: "Class 9",
      board: "CBSE",
      folderName: "Laws of Motion",
      examType: "most-probable" as const,
      durationMinutes: 45,
      date: new Date().toISOString().split('T')[0],
      createdBy: "507f1f77bcf86cd799439011", // Valid MongoDB ObjectId string
      questions: [
        {
          questionText: "What is Newton's first law of motion also known as?",
          options: ["Law of Inertia", "Law of Acceleration", "Law of Action-Reaction", "Law of Gravitation"],
          correctOptionIndex: 0,
          explanation: "Newton's first law states that an object remains at rest or in motion unless acted upon by an external force, which is inertia."
        }
      ]
    };

    console.log("\n1. Adding test exam to nextgenscholar.practice_exams...");
    const insertResult = await AdminContentService.addExam(mockExam);
    const generatedId = insertResult.insertedId;
    console.log(`✅ Exam inserted successfully with ID: ${generatedId}`);

    // 2. Test querying via StudentService.getExams
    console.log("\n2. Testing StudentService.getExams with matching filters...");
    const filteredExams = await StudentService.getExams({
      className: "Class 9",
      board: "CBSE",
      subject: "Physics",
      folderName: "Laws of Motion",
      examType: "most-probable"
    });

    console.log(`Found ${filteredExams.length} matching exam(s).`);
    const foundExam = filteredExams.find(ex => ex._id.toString() === generatedId.toString());

    if (foundExam) {
      console.log("🎉 SUCCESS: Exam was retrieved successfully with all matching filters!");
      console.log(`   Title: "${foundExam.title}"`);
      console.log(`   Class: "${foundExam.className}"`);
      console.log(`   Board: "${foundExam.board}"`);
      console.log(`   Subject: "${foundExam.subject}"`);
      console.log(`   Chapter/Folder: "${foundExam.folderName}"`);
      console.log(`   Type: "${foundExam.examType}"`);
      console.log(`   Duration: ${foundExam.durationMinutes} minutes`);
      console.log(`   Questions Count: ${foundExam.questions.length}`);
    } else {
      console.error("❌ FAILED: Exam was not found in the filtered exams query.");
      console.log("Filtered results returned:", filteredExams);
    }

    // 3. Clean up database
    console.log("\n3. Cleaning up test exam from nextgenscholar.practice_exams...");
    const deleteResult = await AdminContentService.deleteExam(generatedId.toString());
    if (deleteResult.deletedCount === 1) {
      console.log("✅ Cleanup successful! Test exam removed.");
    } else {
      console.warn("⚠️ Cleanup warning: Test exam was not removed.");
    }

    console.log("\n🏆 Integration Test Finished Successfully!");

  } catch (error) {
    console.error("❌ Test failed with error:", error);
  } finally {
    await client.close();
  }
}

runIntegrationTest();

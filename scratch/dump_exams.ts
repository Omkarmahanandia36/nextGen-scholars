import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { MongoClient } from "mongodb";

async function dumpExams() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI not found");
    return;
  }
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("nextgenscholar");
    const exams = await db.collection("practice_exams").find({}).toArray();
    console.log(`Found ${exams.length} exams in practice_exams:`);
    exams.forEach(ex => {
      console.log({
        id: ex._id,
        title: ex.title,
        subject: ex.subject,
        duration: ex.duration,
        durationMinutes: ex.durationMinutes,
        questionsCount: ex.questions?.length
      });
    });
  } finally {
    await client.close();
  }
}

dumpExams();

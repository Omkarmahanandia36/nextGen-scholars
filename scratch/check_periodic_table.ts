import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const uri = process.env.MONGODB_URI;

async function checkExam() {
  const client = new MongoClient(uri!);
  try {
    await client.connect();
    const db = client.db("nextgenscholar");
    const exam = await db.collection("practice_exams").findOne({ title: /periodic table/i });
    console.log("Exam document in DB:", JSON.stringify(exam, null, 2));
  } finally {
    await client.close();
  }
}

checkExam();

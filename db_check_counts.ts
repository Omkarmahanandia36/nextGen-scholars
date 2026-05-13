import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const uri = process.env.MONGODB_URI;

async function checkDbs() {
  const client = new MongoClient(uri!);
  try {
    await client.connect();
    
    console.log("--- nextgenscholar DB ---");
    const db1 = client.db("nextgenscholar");
    console.log("Materials:", await db1.collection("materials").countDocuments());
    console.log("Meetings:", await db1.collection("meetings").countDocuments());
    console.log("Tutors:", await db1.collection("tutors").countDocuments());
    console.log("Admins:", await db1.collection("admins").countDocuments());
    
    console.log("\n--- academy DB ---");
    const db2 = client.db("academy");
    console.log("Materials:", await db2.collection("materials").countDocuments());
    console.log("Meetings:", await db2.collection("meetings").countDocuments());
    console.log("Tutors:", await db2.collection("tutors").countDocuments());
    console.log("Admins:", await db2.collection("admins").countDocuments());
    
  } finally {
    await client.close();
  }
}

checkDbs();

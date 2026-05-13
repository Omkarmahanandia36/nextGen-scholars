import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const uri = process.env.MONGODB_URI;

async function checkAdmin() {
  if (!uri) {
    console.error("No MONGODB_URI found");
    return;
  }
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    const admins = await db.collection("admins").find({}).toArray();
    
    if (admins.length > 0) {
      console.log("Found admins:");
      admins.forEach(admin => {
        console.log(`- Email: ${admin.email}`);
      });
    } else {
      console.log("No admins found in the database.");
    }
  } finally {
    await client.close();
  }
}

checkAdmin();

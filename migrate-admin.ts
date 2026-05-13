import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const uri = process.env.MONGODB_URI;

async function migrateAdmin() {
  const client = new MongoClient(uri!);
  try {
    await client.connect();
    
    const dbAcademy = client.db("academy");
    const dbNextGen = client.db("nextgenscholar");
    
    const admins = await dbAcademy.collection("admins").find({}).toArray();
    
    if (admins.length > 0) {
      // Avoid Duplicate Key Error
      for (const admin of admins) {
        const existing = await dbNextGen.collection("admins").findOne({ email: admin.email });
        if (!existing) {
          await dbNextGen.collection("admins").insertOne(admin);
          console.log(`Migrated admin: ${admin.email}`);
        } else {
          console.log(`Admin ${admin.email} already exists in nextgenscholar.`);
        }
      }
    } else {
      console.log("No admins found in academy to migrate.");
    }
  } finally {
    await client.close();
  }
}

migrateAdmin();

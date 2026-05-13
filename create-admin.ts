import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config({ path: ".env.local" });

const uri = process.env.MONGODB_URI;

async function createAdmin() {
  if (!uri) {
    console.error("No MONGODB_URI found");
    return;
  }
  const client = new MongoClient(uri);
  try {
    await client.connect();
    // explicitly using "nextgenscholar" database as expected by the login API
    const db = client.db("nextgenscholar");
    
    const email = "admin@nextgenscholar.com";
    const password = "admin";
    
    // Check if it already exists
    const existingAdmin = await db.collection("admins").findOne({ email });
    if (existingAdmin) {
      console.log(`Admin ${email} already exists in academy db.`);
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    await db.collection("admins").insertOne({
      email,
      password: hashedPassword,
      role: "admin",
      createdAt: new Date(),
    });
    
    console.log(`Successfully created admin user in nextgenscholar db:`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
  } finally {
    await client.close();
  }
}

createAdmin();

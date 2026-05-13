const { MongoClient } = require('mongodb');
const uri = "mongodb://omkarmahanandia_db_user:Omkar%40sovan123@ac-lq7cug3-shard-00-00.hkrfdjv.mongodb.net:27017,ac-lq7cug3-shard-00-01.hkrfdjv.mongodb.net:27017,ac-lq7cug3-shard-00-02.hkrfdjv.mongodb.net:27017/?ssl=true&replicaSet=atlas-o167nn-shard-0&authSource=admin&retryWrites=true&w=majority";

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    
    for (const dbName of ['academy', 'nextgenscholar']) {
      console.log(`=== Database: ${dbName} ===`);
      const db = client.db(dbName);
      const collections = await db.listCollections().toArray();
      for (const col of collections) {
        const count = await db.collection(col.name).countDocuments();
        console.log(`  - ${col.name}: ${count}`);
      }
    }
  } finally {
    await client.close();
  }
}
run().catch(console.dir);

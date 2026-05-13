const { MongoClient } = require('mongodb');
const uri = "mongodb://omkarmahanandia_db_user:Omkar%40sovan123@ac-lq7cug3-shard-00-00.hkrfdjv.mongodb.net:27017,ac-lq7cug3-shard-00-01.hkrfdjv.mongodb.net:27017,ac-lq7cug3-shard-00-02.hkrfdjv.mongodb.net:27017/nextgenscholar?ssl=true&replicaSet=atlas-o167nn-shard-0&authSource=admin&retryWrites=true&w=majority&appName=NextGenScholar";

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('nextgenscholar');
    const admins = await db.collection('admins').find().toArray();
    console.log('=== Admins ===');
    console.log(JSON.stringify(admins, null, 2));
    
    const materials = await db.collection('materials').find().toArray();
    console.log('=== Materials ===');
    console.log(JSON.stringify(materials, null, 2));
  } finally {
    await client.close();
  }
}
run().catch(console.dir);

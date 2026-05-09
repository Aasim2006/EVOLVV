const { MongoClient } = require("mongodb");

const uri = "YOUR_MONGODB_URI";

const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    console.log("✅ Connected successfully");
  } catch (err) {
    console.error("❌ Connection failed");
    console.error(err);
  } finally {
    await client.close();
  }
}

run();
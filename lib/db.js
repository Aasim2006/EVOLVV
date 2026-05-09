import mongoose from "mongoose";

const globalForMongoose = global;
const placeholderParts = ["USER:PASSWORD", "cluster.mongodb.net"];

export async function connectDB() {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (mongoose.connection.readyState === 2 && globalForMongoose.mongoosePromise) {
    return globalForMongoose.mongoosePromise;
  }

  const uri = process.env.MONGODB_URI;

  if (!uri || placeholderParts.some((part) => uri.includes(part))) {
    throw new Error("Add a real MongoDB Atlas connection string to MONGODB_URI in .env.local.");
  }

  mongoose.set("bufferCommands", false);

  globalForMongoose.mongoosePromise = mongoose
    .connect(uri, {
      serverSelectionTimeoutMS: 5000
    })
    .then((mongooseInstance) => mongooseInstance.connection)
    .catch((error) => {
      globalForMongoose.mongoosePromise = null;
      throw error;
    });

  return globalForMongoose.mongoosePromise;
}

import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    console.error(`   Server will continue running without database.`);
    console.error(`   Make sure MongoDB is running on: ${process.env.MONGO_URI}`);
    return null;
  }
};

export default connectDB;

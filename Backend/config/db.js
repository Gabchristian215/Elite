import mongoose from "mongoose";

const connectDB = async () => {
  const url = process.env.MONGO_URI;

  if (!url) {
    throw new Error("MONGO_URI is not defined");
  }

  await mongoose.connect(url, { dbName: "elite" });
  console.log("Mongoose connected to MongoDB");
};

export default connectDB;

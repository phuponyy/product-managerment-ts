import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connect Success!");
  } catch (error) {
    console.log("Connect Error!");
  }
};

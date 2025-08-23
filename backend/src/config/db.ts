import mongoose from 'mongoose';
import config from './index.js';

const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(config.MONGO_URI, {
      // These options are no longer needed in mongoose 6+, but included for backwards compatibility if needed
      // retryWrites: true,
      // w: 'majority',
    });
    console.log(`MongoDB Atlas Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
};

export default connectDB;

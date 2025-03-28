// Importing the mongoose library
import mongoose from 'mongoose';

let isConnecting = false;
let retryCount = 0;
const MAX_RETRIES = 5;

const connectDB = async () => {
  if (isConnecting) {
    console.log('Already attempting to connect to MongoDB, waiting...');
    return;
  }
  
  isConnecting = true;
  
  try {
    // Check for MongoDB connection string
    const dbConnectionString = process.env.DB || process.env.DATABASE;
    if (!dbConnectionString) {
      console.error('❌ No MongoDB connection string provided in .env file!');
      console.error('Please add either DB or DATABASE environment variable with your MongoDB connection string.');
      console.error('Example: DATABASE=mongodb://localhost:27017/kiithub');
      process.exit(1);
    }

    console.log(`Attempting to connect to MongoDB (Attempt ${retryCount + 1}/${MAX_RETRIES})...`);
    
    // Set strictQuery to false to prepare for Mongoose 7
    mongoose.set('strictQuery', false);

    // Using only supported options
    await mongoose.connect(dbConnectionString, {
      serverSelectionTimeoutMS: 30000, // Timeout after 30 seconds
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      maxPoolSize: 10,
      minPoolSize: 5
    });

    console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
    retryCount = 0; // Reset retry count on success

    // Add connection event listeners
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
      if (!isConnecting) {
        console.log('Attempting to reconnect in 5 seconds...');
        setTimeout(connectDB, 5000); // Wait 5 seconds before reconnecting
      }
    });

    // Handle process termination
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
      } catch (err) {
        console.error('Error during MongoDB connection closure:', err);
        process.exit(1);
      }
    });

  } catch (error) {
    console.error('❌ Error connecting to MongoDB:');
    console.error(error);
    
    // Implement retry logic
    retryCount++;
    if (retryCount < MAX_RETRIES) {
      const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
      console.log(`Retrying in ${delay/1000} seconds...`);
      setTimeout(connectDB, delay);
    } else {
      console.error(`Failed to connect after ${MAX_RETRIES} attempts.`);
      console.error('\nTroubleshooting tips:');
      console.error('1. Make sure MongoDB is installed and running on your system');
      console.error('2. Check if the MongoDB connection string is correct');
      console.error('3. Verify that the MongoDB server is accessible from your computer');
      console.error('4. Try using MongoDB Compass to test the connection');
      console.error('5. If using MongoDB Atlas, check your IP whitelist settings\n');

      // Allow the server to continue running with limited functionality
      console.error('Starting server with limited functionality (no database connection)');
    }
  } finally {
    isConnecting = false;
  }
};

export default connectDB;

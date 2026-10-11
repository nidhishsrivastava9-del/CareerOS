import mongoose from 'mongoose';

/**
 * Connect to MongoDB database via Mongoose
 */
export const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.error('===============================================================');
    console.error('[CareerOS DB Error]: MONGO_URI is not defined in environment variables.');
    console.error('Please configure MONGO_URI in your backend/.env file.');
    console.error('===============================================================');
    return null;
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 15000 // 15 seconds allows reliable SSL handshake to cloud Atlas replica set
    });

    console.log(`[MongoDB Connected]: Host -> ${conn.connection.host}, Database -> ${conn.connection.name}`);
    return conn;
  } catch (error) {
    // Sanitize any potential sensitive text from the error message
    const sanitizedMsg = String(error.message || '').replace(/\/\/([^:]+):([^@]+)@/g, '//$1:***@');
    console.error('===============================================================');
    console.error('[CareerOS DB Connection Error]: Could not connect to MongoDB.');
    console.error(`Reason: ${sanitizedMsg}`);
    console.error('Troubleshooting:');
    console.error('1. Check if your current IP is whitelisted in MongoDB Atlas:');
    console.error('   Atlas Dashboard -> Security -> Network Access -> Add IP Address (or 0.0.0.0/0)');
    console.error('2. Or check if local MongoDB server (mongod) is running: "net start MongoDB"');
    console.error('CareerOS is running with in-memory auth and storage fallback.');
    console.error('===============================================================');
    return null;
  }
};

export default connectDB;

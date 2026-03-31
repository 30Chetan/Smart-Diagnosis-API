import mongoose from 'mongoose';

const connectDB = async () => {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
    });
    console.log(`[db] MongoDB connected: ${conn.connection.host}`);
};

export default connectDB;

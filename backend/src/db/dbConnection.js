import mongoose from "mongoose";

// To connect with MongoDB Atlas cluster
const connectDB = async () => {
    try {
        const connectionTarget = await mongoose.connect(`${process.env.MONGODB_URI}`);
        console.log(`\n MongoDB Connected successfully, at Host:${connectionTarget.connection.host}`);
    } catch (connectionError) {
        console.error("MongoDB connection failed error details:", connectionError);
        process.exit(1);
    }
};

export default connectDB;
import mongoose from "mongoose";

const connectDB = async () => {
    try {
        
        mongoose.connection.on('connected', () => {
            console.log('Database connected successfully');
        });

        mongoose.connection.on('error', (err) => {
            console.error('Database connection error:', err);
        });

        let dbURI = process.env.MONGODB_URI;
        const projectName = process.env.PROJECT_NAME;

        if (!dbURI) {
            console.error('Database URI is not defined');
            process.exit(1);
        }

        if (dbURI.endsWith('/')) {
            dbURI = dbURI.slice(0, -1);
        }

        await mongoose.connect(`${dbURI}/${projectName}`);
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
}

export default connectDB;
const mongoose = require("mongoose")

async function connectDB() {
    try {
        const conn = await mongoose.connect(process.env.DATABASE_STRING, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected successfully');
        return conn;
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        process.exit(1);
    }
}

module.exports = connectDB;


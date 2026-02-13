const mongoose = require("mongoose")

async function connectDB(){
    await mongoose.connect(process.env.DATABASE_STRING)
}

module.exports = connectDB;


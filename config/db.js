require('dotenv').config();
const mongoose = require('mongoose');

const mongoConnection = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error('MONGO_URI not found in environment variables');

    await mongoose.connect(uri); // No need for options in Mongoose 7+

    console.log('✅ Connected to RaiZenDB DataBase');
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB Atlas:', error);
  }
};

module.exports = mongoConnection;

const mongoose = require('mongoose');
const config = require('./config');

mongoose.set('strictQuery', true);

async function connectDB() {
  await mongoose.connect(config.mongoUri, {
    autoIndex: true,
  });
  return mongoose.connection;
}

module.exports = { connectDB, mongoose };

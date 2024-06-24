const mongoose = require("mongoose");

module.exports.connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    }
    );
    console.log("Connect Database Success!");
  } catch (error) {
    console.log("Connect Database Error!");
  }
}
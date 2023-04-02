const mongoose = require("mongoose");

const connectDB = async () => {
  console.log("Connecting to MongoDB...");

  const MONGO_USER = process.env.MONGO_USER;
  const MONGO_PASSWORD = process.env.MONGO_PASSWORD;
  const MONGO_HOST = process.env.MONGO_HOST;
  const MONGO_PORT = process.env.MONGO_PORT;
  const URI = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_HOST}:${MONGO_PORT}/?authMechanism=DEFAULT`;

  mongoose.set("strictQuery", false);
  await mongoose
    .connect(URI)
    .then((res) => {
      console.log(`MongoDB Connected: ${res.connection.host}`);
    })
    .catch((err) => {
      console.log(`Error: ${err?.message}`);
    });
};

module.exports = connectDB;

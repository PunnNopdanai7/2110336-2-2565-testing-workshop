const mongoose = require("mongoose");
const fs = require("fs");
const User = require("./models/user.model");

const data = fs.readFileSync("./data/users.json");
const jsonData = JSON.parse(data);

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
    .then(async (res) => {
      console.log(`MongoDB Connected: ${res.connection.host}`);
      console.log("Seeding data...");
      const result = await User.collection.bulkWrite(
        jsonData.map((user) => ({
          updateOne: {
            filter: { username: user.username },
            update: {
              $set: {
                username: user.username,
                password: user.password,
                role: user.role,
              },
            },
            upsert: true,
          },
        }))
      );

      console.log("Data seeded successfully");
    })
    .catch((err) => {
      console.log(`Error: ${err?.message}`);
    });
};

module.exports = connectDB;

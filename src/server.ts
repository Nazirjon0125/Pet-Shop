import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";

mongoose
  .connect(process.env.MONGO_URL as string, {})
  .then((data) => {
    console.log("MongoDB connection succeed");
    const PORT = process.env.PORT ?? 3005;
  })
  .catch((err) => console.log("Error on connection MongoDB", err));

console.log("PORT:", process.env.PORT);
console.log("MONGO_URL:", process.env.MONGO_URL);

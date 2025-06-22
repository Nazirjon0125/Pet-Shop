import dotenv from "dotenv";
dotenv.config();

// console.log("PORT:", process.env.PORT);
// console.log("MONGO:", process.env.MONGO_URL);

import mongoose from "mongoose";
import app from "./app";

//TSP1
mongoose
  .connect(process.env.MONGO_URL as string, {})
  .then((data) => {
    console.log("MongoDB connection succeed");
    const PORT = process.env.PORT ?? 3005;
    app.listen(PORT, function () {
      console.info(`The server is running successfuly on port, ${PORT}`);
      console.info(`Admin project on http://localhost:${PORT}/admin \n`);
    });
  })
  .catch((err) => {
    console.log("ERROR on connection MongoDB", err);
  });

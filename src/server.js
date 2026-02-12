import "dotenv/config";
import { connectDB } from "./config/db.js";
import express from "express";

// Import routes
import movieRoutes from "./routes/movieRoutes.js";
import { config } from "dotenv";
config();
connectDB();

// Create Express app
const app = express();
app.use("/movies", movieRoutes);

const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, () => {
  console.log(`Server Running on ${PORT}`);
});

process.on("unhandledRejection", (err) => {
  console.log("unhandled Rejection", err);
  server.close(async () => {
    await disconnectDB();
    process.exit(1);
  });
});

process.on("uncaughtRejection", (err) => {
  console.log("uncaught Rejection", err);
  server.close(async () => {
    await disconnectDB();
    process.exit(1);
  });
});

process.on("SIGTERM", (err) => {
  console.log("SIGTERM", err);
  server.close(async () => {
    await disconnectDB();
    process.exit(1);
  });
});

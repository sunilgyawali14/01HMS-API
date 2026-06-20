import dotenv from "dotenv";
dotenv.config();
import { connectionDB } from "../src/config/index.js";
import express from "express";
import authRouter from "../src/features/auth/auth.routes.js";

const app = express(); // creating the instance of the express
app.use(express.json()); // this convert the json in to the object
await connectionDB();

app.use("/api/auth",authRouter) // this is the route for the auth

const PORT = process.env.PORT || 9090;

app.listen(PORT, () => {  // now server is created from this line 
  console.log(`The server is Running in the PORT :${PORT}`);
});

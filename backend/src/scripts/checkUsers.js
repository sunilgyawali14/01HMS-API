import dotenv from "dotenv";
dotenv.config();
import sequelize from "../config/connection.js";
import User from "../features/user/user.model.js";

const run = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connected to DB successfully");
    const users = await User.findAll();
    console.log("Users in DB:");
    users.forEach((u) => {
      console.log(`ID: ${u.id}, Name: ${u.name}, Email: ${u.email}, Roles: ${u.roles}`);
    });
    await sequelize.close();
  } catch (error) {
    console.error("Error checking users:", error);
  }
};

run();

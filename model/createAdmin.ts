import { createConnection } from "typeorm";
import * as bcrypt from "bcryptjs";
import { User } from "./src/entity/User";

require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` });

createConnection().then(async (connection) => {
  const firstAdmin = new User();
  firstAdmin.email = "admin@example.com";
  firstAdmin.firstName = "Admin";
  firstAdmin.lastName = "Example";
  firstAdmin.password = await bcrypt.hash("Admin123", 10);
  firstAdmin.isAdmin = true;

  await connection.manager.save(firstAdmin);
});

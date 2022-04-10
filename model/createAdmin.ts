import { createConnection, getRepository } from "typeorm";
import * as bcrypt from "bcryptjs";
import { User } from "./src/entity/User";

require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` });

createConnection().then(async (connection) => {
  const firstAdmin = new User();
  firstAdmin.email = "admin@example.com";
  firstAdmin.fullName = "admin";
  firstAdmin.password = await bcrypt.hash("Omg458!!", 10);
  firstAdmin.address = "1 Fake Street";
  firstAdmin.longitude = 0;
  firstAdmin.latitude = 0;
  firstAdmin.role = "Admin";
  firstAdmin.phoneNumber = "5555555555";

  await connection.manager.save(firstAdmin);
});

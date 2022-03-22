import { createConnection, getRepository } from "typeorm";
import * as bcrypt from "bcryptjs";
import { User } from "./src/entity/User";

require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` });

createConnection().then(async (connection) => {
  const firstAdmin = new User();
  firstAdmin.email = "admin@example.com";
<<<<<<< HEAD
  firstAdmin.fullName = "admin";
  firstAdmin.password = await bcrypt.hash("Omg458!!", 10);
=======
  firstAdmin.fullName = "Admin";
  firstAdmin.password = await bcrypt.hash("Potato458!", 10);
>>>>>>> 7daff10ce07a846de2b6ab3ee6e2a2bc086b68cb
  firstAdmin.address = "1 Fake Street";
  firstAdmin.longitude = 0;
  firstAdmin.latitude = 0;
  firstAdmin.role = "Admin";
<<<<<<< HEAD
=======
  firstAdmin.phoneNumber = "5555555555";

>>>>>>> 7daff10ce07a846de2b6ab3ee6e2a2bc086b68cb
  await connection.manager.save(firstAdmin);
});

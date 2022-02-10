import { createConnection, getRepository } from "typeorm";
import { Route } from "../entity/Route";
import { User } from "../entity/User";
import { publishMessage } from "./emailWorker";
require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` });

const FROM = "noreply@potato.com";

export const sendEmailToAll = async (message: object) => {
  await createConnection();
  const routeRepository = getRepository(User);

  const allEmails = await routeRepository
    .createQueryBuilder("users")
    .select("users.email")
    .getMany();

  allEmails.forEach(async (user) => {
    console.log(user.email);
    await publishMessage({ ...message, from: FROM, to: user.email });
  });
};

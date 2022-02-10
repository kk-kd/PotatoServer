import { createConnection, getRepository } from "typeorm";
import { School } from "../entity/School";
import { User } from "../entity/User";
import { publishMessage } from "./emailWorker";
require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` });

const FROM = "noreply@potato.com";

export class EmailController {
  static sendEmailToAll = async (message: object) => {
    // await createConnection();

    const userRepository = getRepository(User);
    const allEmails = await userRepository
      .createQueryBuilder("users")
      .select("users.email")
      .getMany();

    allEmails.forEach(async (user) => {
      console.log(user.email);
      await publishMessage({ ...message, from: FROM, to: user.email });
    });
  };

  static sendEmailToUsersFromSchool = async (
    message: object,
    school: string
  ) => {
    await createConnection();

    const schoolRepository = getRepository(School);
    const schoolSelect = await schoolRepository
      .createQueryBuilder("schools")
      .where("schools.name = :name", { name: school }) // TODO: change to unique name
      .leftJoinAndSelect("schools.students", "students")
      .leftJoinAndSelect("students.parentUser", "parent")
      .getOne();

    const emailSet: Set<string> = new Set();

    schoolSelect.students.forEach(async (s) => {
      emailSet.add(s.parentUser.email);
    });

    emailSet.forEach(async (userEmail) => {
      await publishMessage({ ...message, from: FROM, to: userEmail });
    });
  };
}

export default EmailController;

import { createConnection, getConnection, getRepository } from "typeorm";
import { Route } from "../entity/Route";
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
      await publishMessage({ ...message, from: FROM, to: user.email });
    });
  };

  static sendEmailToUsersFromSchool = async (
    message: object,
    school: string
  ) => {
    // await createConnection();

    const schoolRepository = getRepository(School);
    const schoolSelect = await schoolRepository
      .createQueryBuilder("schools")
      .where("schools.name = :name", { name: school }) // TODO: change to unique name
      .leftJoinAndSelect("schools.students", "students")
      .leftJoinAndSelect("students.parentUser", "parent")
      .getOne();

    if (schoolSelect == undefined) {
      console.log("School doesn't exist");
      return;
    }

    const emailSet: Set<string> = new Set();
    schoolSelect.students.forEach(async (s) => {
      if ("parentUser" in s) {
        emailSet.add(s.parentUser.email);
      }
    });

    emailSet.forEach(async (userEmail) => {
      await publishMessage({ ...message, from: FROM, to: userEmail });
    });
  };

  static sendEmailToUsersOnRoute = async (message: object, route: string) => {
    await createConnection();

    const routeRepository = getRepository(Route);
    const routeSelect = await routeRepository
      .createQueryBuilder("routes")
      .where("routes.name = :name", { name: route })
      .leftJoinAndSelect("routes.students", "students")
      .leftJoinAndSelect("students.parentUser", "parent")
      .getOne();

    if (routeSelect == undefined) {
      console.log("Route doesn't exist");
      return;
    }

    const emailSet: Set<string> = new Set();
    routeSelect.students.forEach(async (s) => {
      if ("parentUser" in s) {
        emailSet.add(s.parentUser.email);
      }
    });

    emailSet.forEach(async (userEmail) => {
      await publishMessage({ ...message, from: FROM, to: userEmail });
    });
  };
}

export default EmailController;

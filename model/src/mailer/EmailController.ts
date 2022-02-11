import { createConnection, getRepository } from "typeorm";
import { Route } from "../entity/Route";
import { School } from "../entity/School";
import { User } from "../entity/User";
import { publishMessage } from "./emailWorker";
import { Request, Response } from "express";
require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` });

const FROM = "noreply@potato.com";

class EmailController {
  static sendEmailToAll = async (request: Request, response: Response) => {
    let { message } = request.body;
    const userRepository = getRepository(User);
    const allEmails = await userRepository
      .createQueryBuilder("users")
      .select("users.email")
      .getMany();

    allEmails.forEach(async (user) => {
      await publishMessage({ ...message, from: FROM, to: user.email });
    });

    response.status(201).send();
    return;
  };

  static sendEmailToUsersFromSchool = async (
    request: Request,
    response: Response
  ) => {
    let { message, school } = request.body;
    const schoolRepository = getRepository(School);
    const schoolSelect = await schoolRepository
      .createQueryBuilder("schools")
      .where("schools.name = :name", { name: school }) // TODO: change to unique name
      .leftJoinAndSelect("schools.students", "students")
      .leftJoinAndSelect("students.parentUser", "parent")
      .getOne();

    if (schoolSelect == undefined) {
      response.status(401).send("School doesn't exist");
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

    response.status(201).send();
    return;
  };

  static sendEmailToUsersOnRoute = async (
    request: Request,
    response: Response
  ) => {
    let { message, route } = request.body;

    const routeRepository = getRepository(Route);
    const routeSelect = await routeRepository
      .createQueryBuilder("routes")
      .where("routes.name = :name", { name: route })
      .leftJoinAndSelect("routes.students", "students")
      .leftJoinAndSelect("students.parentUser", "parent")
      .getOne();

    if (routeSelect == undefined) {
      response.status(401).send("Route doesn't exist");
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

    response.status(201).send();
    return;
  };
}

export default EmailController;

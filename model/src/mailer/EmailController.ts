import { createConnection, getConnection, getRepository } from "typeorm";
import { Route } from "../entity/Route";
import { School } from "../entity/School";
import { User } from "../entity/User";
import { Student } from "../entity/Student";
import { publishMessage } from "./emailWorker";
import { Request, Response } from "express";
require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` });

const FROM = "noreply@potato.com";

export class EmailController {
  private getParentPage = async (parentId: number) => {
    const userDetail: User = await getRepository(User)
      .createQueryBuilder("users")
      .where("users.uid = :uid", { uid: parentId })
      .leftJoinAndSelect("users.students", "children")
      .leftJoinAndSelect("children.school", "school")
      .leftJoinAndSelect("children.route", "route")
      .getOne();

    // TODO: possiblly resolve this 100% script injection risk
    var info = "<h3>" + this.extractName(userDetail) + "</h3>";
    console.log(userDetail);
    if (!("students" in userDetail) || userDetail.students.length == 0) {
      info =
        "<div>" +
        info +
        "<p>" +
        "You don't have any registerd child in the system." +
        "</p>" +
        "</div>";

      return info;
    }

    for (const child of userDetail.students) {
      info += "<p>" + (await this.getChildDetail(child)) + "</p>";
    }

    return "<div>" + info + "</div>";
  };

  private getChildDetail = async (child: Student) => {
    var studentInfo =
      this.extractName(child) +
      "<br>" +
      ("id" in child && child.id != null ? "Student ID: " + child.id : "") +
      "<br>" +
      "School: " +
      child.school.name +
      "<h5>Bus Route Information</h5>";

    if (child.route == null) {
      studentInfo += "The student does not have a route yet.";
    } else {
      studentInfo +=
        "Route Name: " +
        child.route.name +
        "<br>" +
        "Description: " +
        child.route.desciption;
    }

    return studentInfo;
  };

  private extractName = (user) => {
    return (
      user.firstName +
      ("middlename" in user ? user.middleName : "") +
      " " +
      user.lastName
    );
  };

  sendGeneralAnnouncementToAll = async (
    request: Request,
    response: Response
  ) => {
    let { message } = request.body;
    const userRepository = getRepository(User);
    const allUserEmails = await userRepository
      .createQueryBuilder("users")
      .select("users.email")
      .getMany();

    const allEmails = allUserEmails
      .map((user) => {
        if (/^.*@example\.com$/i.test(user.email)) {
          console.log(`Skipped ${user.email}`);
          return null;
        }
        return user.email;
      })
      .filter(Boolean)
      .join(", ");

    await publishMessage({ ...message, from: FROM, to: FROM, bcc: allEmails });

    response.status(201).send();
    return;
  };

  sendRouteAnnouncementToAll = async (request: Request, response: Response) => {
    let { message } = request.body;
    const userRepository = getRepository(User);
    const allEmails = await userRepository
      .createQueryBuilder("users")
      .select(["users.email", "users.uid"])
      .getMany();

    allEmails.forEach(async (user) => {
      if (!/^.*@example\.com$/i.test(user.email)) {
        const parentDetails = await this.getParentPage(user.uid);
        var myMessage = { ...message };
        myMessage.html += parentDetails;
        await publishMessage({ ...myMessage, from: FROM, to: user.email });
      } else {
        console.log(`Skipped ${user.email}`);
      }
    });

    response.status(201).send();
    return;
  };

  sendGeneralAnnouncementToUsersFromSchool = async (
    request: Request,
    response: Response
  ) => {
    let { message, schoolId } = request.body;
    const schoolRepository = getRepository(School);
    const schoolSelect = await schoolRepository
      .createQueryBuilder("schools")
      .where("schools.uid = :uid", { uid: schoolId })
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
        if (!/^.*@example\.com$/i.test(s.parentUser.email)) {
          emailSet.add(s.parentUser.email);
        } else {
          console.log(`Skipped ${s.parentUser.email}`);
        }
      }
    });
    const allEmails = Array.from(emailSet).join(", ");
    await publishMessage({ ...message, from: FROM, to: FROM, bcc: allEmails });

    response.status(201).send();
    return;
  };

  sendRouteAnnouncementToUsersFromSchool = async (
    request: Request,
    response: Response
  ) => {
    let { message, schoolId } = request.body;
    const schoolRepository = getRepository(School);
    const schoolSelect = await schoolRepository
      .createQueryBuilder("schools")
      .where("schools.uid = :uid", { uid: schoolId })
      .leftJoinAndSelect("schools.students", "students")
      .leftJoinAndSelect("students.parentUser", "parent")
      .getOne();

    if (schoolSelect == undefined) {
      response.status(401).send("School doesn't exist");
      return;
    }

    const userSet: Set<User> = new Set();
    schoolSelect.students.forEach(async (s) => {
      if ("parentUser" in s) {
        if (!/^.*@example\.com$/i.test(s.parentUser.email)) {
          userSet.add(s.parentUser);
        } else {
          console.log(`Skipped ${s.parentUser.email}`);
        }
      }
    });

    userSet.forEach(async (user) => {
      const parentDetails = await this.getParentPage(user.uid);
      var myMessage = { ...message };
      myMessage.html += parentDetails;
      await publishMessage({ ...myMessage, from: FROM, to: user.email });
    });

    response.status(201).send();
    return;
  };

  sendGeneralAnnouncementToUsersOnRoute = async (
    request: Request,
    response: Response
  ) => {
    let { message, routeId } = request.body;

    const routeRepository = getRepository(Route);
    const routeSelect = await routeRepository
      .createQueryBuilder("routes")
      .where("routes.uid = :uid", { uid: routeId })
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
        if (!/^.*@example\.com$/i.test(s.parentUser.email)) {
          emailSet.add(s.parentUser.email);
        } else {
          console.log(`Skipped ${s.parentUser.email}`);
        }
      }
    });

    const allEmails = Array.from(emailSet).join(", ");
    await publishMessage({ ...message, from: FROM, to: FROM, bcc: allEmails });

    response.status(201).send();
    return;
  };

  sendRouteAnnouncementToUsersOnRoute = async (
    request: Request,
    response: Response
  ) => {
    let { message, routeId } = request.body;

    const routeRepository = getRepository(Route);
    const routeSelect = await routeRepository
      .createQueryBuilder("routes")
      .where("routes.uid = :uid", { uid: routeId })
      .leftJoinAndSelect("routes.students", "students")
      .leftJoinAndSelect("students.parentUser", "parent")
      .getOne();

    if (routeSelect == undefined) {
      response.status(401).send("Route doesn't exist");
      return;
    }

    const userSet: Set<User> = new Set();
    routeSelect.students.forEach(async (s) => {
      if ("parentUser" in s) {
        if (/^.*@example\.com$/i.test(s.parentUser.email)) {
          userSet.add(s.parentUser);
          console.log(`Skipped ${s.parentUser.email}`);
        }
      }
    });

    userSet.forEach(async (user) => {
      const parentDetails = await this.getParentPage(user.uid);
      var myMessage = { ...message };
      myMessage.html += parentDetails;
      await publishMessage({ ...myMessage, from: FROM, to: user.email });
    });

    response.status(201).send();
    return;
  };
}

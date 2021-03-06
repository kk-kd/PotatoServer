import { createConnection, getConnection, getRepository } from "typeorm";
import { Route } from "../entity/Route";
import { School } from "../entity/School";
import { User } from "../entity/User";
import { Student } from "../entity/Student";
import { publishMessage } from "./emailWorker";
import { Request, Response } from "express";
import { AccountRole } from "../Role";
require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` });

const FROM = "noreply@potato.com";

export class EmailController {
  private getParentPage = async (parentEmail: string) => {
    const userDetail: User = await getRepository(User)
      .createQueryBuilder("users")
      .where("users.email = :email", { email: parentEmail })
      .leftJoinAndSelect("users.students", "children")
      .leftJoinAndSelect("children.school", "school")
      .leftJoinAndSelect("children.route", "route")
      .leftJoinAndSelect("children.inRangeStops", "inRangeStops")
      .getOne();

    // TODO: possiblly resolve this 100% script injection risk
    var info = `${this.extractName(
      userDetail
    )}, here is your child information:`;
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
      info += `<p>${await this.getChildDetail(child)}</p>`;
    }

    return `<div>${info}</div>`;
  };

  private to12Hours = (timeToConvert) => {
    let hours = timeToConvert.split(":")[0];
    let AmOrPm = hours >= 12 ? "pm" : "am";
    hours = hours % 12 || 12;
    let minutes = timeToConvert.split(":")[1];
    return hours + ":" + minutes + " " + AmOrPm;
  };

  private getChildDetail = async (child: Student) => {
    var studentInfo =
      `<h3>${this.extractName(child)}</h3>` +
      ("id" in child && child.id != null
        ? `<u>Student ID</u>: ${child.id}<br>`
        : "") +
      "<u>School</u>: " +
      child.school.name +
      "<h4>Bus Route Information</h4>";

    if (child.route == null) {
      studentInfo +=
        "The student does not have a route yet. Please contact the school admin if you have any questions.";
      return studentInfo;
    } else {
      studentInfo +=
        `<u>Route Name</u>: ${child.route.name}<br>` +
        `  Description: ${child.route.desciption}`;
    }

    console.log(child);
    studentInfo += "<h4>Stop Information (Pickup/Dropoff Time)</h4>";
    if (child.inRangeStops == null || child.inRangeStops.length == 0) {
      studentInfo +=
        "The student does not have any in-range stops. Please contact the school admin if you have any questions.";
    } else {
      const stops = child.inRangeStops.sort((a, b) => {
        if (a.arrivalIndex < b.arrivalIndex) return -1;
        if (a.arrivalIndex > b.arrivalIndex) return 1;
        return 0;
      });

      for (var stop of stops) {
        if (stop.name == "") {
          studentInfo += `<u>Stop #${stop.arrivalIndex}</u>`;
        } else {
          studentInfo += `<u>${stop.name}</u>`;
        }

        studentInfo += ` (${this.to12Hours(stop.pickupTime)}/${this.to12Hours(
          stop.dropoffTime
        )})<br>`;
      }
    }

    return studentInfo;
  };

  private extractName = (user) => {
    return user.fullName;
  };

  sendGeneralAnnouncementToAll = async (
    request: Request,
    response: Response
  ) => {
    console.log(request.body);
    let { message } = request.body;
    console.log(message);
    const userRepository = getRepository(User);
    const allUserEmails = await userRepository
      .createQueryBuilder("users")
      .select("users.email")
      .where("users.role = :role", { role: AccountRole.PARENT })
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
      .where("users.role = :role", { role: AccountRole.PARENT })

      .getMany();

    allEmails.forEach(async (user) => {
      if (!/^.*@example\.com$/i.test(user.email)) {
        const parentDetails = await this.getParentPage(user.email);
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

    const userSet: Set<string> = new Set();
    schoolSelect.students.forEach(async (s) => {
      if ("parentUser" in s) {
        if (!/^.*@example\.com$/i.test(s.parentUser.email)) {
          userSet.add(s.parentUser.email);
        } else {
          console.log(`Skipped ${s.parentUser.email}`);
        }
      }
    });

    userSet.forEach(async (userEmail) => {
      const parentDetails = await this.getParentPage(userEmail);
      var myMessage = { ...message };
      myMessage.html += parentDetails;
      await publishMessage({ ...myMessage, from: FROM, to: userEmail });
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

    const userSet: Set<string> = new Set();
    routeSelect.students.forEach(async (s) => {
      if ("parentUser" in s) {
        if (!/^.*@example\.com$/i.test(s.parentUser.email)) {
          userSet.add(s.parentUser.email);
        } else {
          console.log(`Skipped ${s.parentUser.email}`);
        }
      }
    });

    userSet.forEach(async (userEmail) => {
      const parentDetails = await this.getParentPage(userEmail);
      var myMessage = { ...message };
      myMessage.html += parentDetails;
      await publishMessage({ ...myMessage, from: FROM, to: userEmail });
    });

    response.status(201).send();
    return;
  };
}

import { Request, Response } from "express";
import * as EmailValidator from "email-validator";
import { getRepository } from "typeorm";
import { User } from "../entity/User";
// import PQueue from "p-queue";
import { getLngLat } from "./GeoHelper";
import { School } from "../entity/School";

/**
 * Validation error codes:
 * GENERAL
 * 99 - Missing index
 * 0 - success
 * 2 - no name
 *
 * PARENT
 * 1 - no email or invalid email
 * 3 - email existed in the database
 * 4 - repetitive emails in request
 * 5 - Missing Address
 * 6 - Error while querying address
 * 7 - Missing Phone Number
 *
 * STUDENT
 * 8 - id not numerical
 * 9 - school entry is empty
 * 10 - parent email is empty
 * 11 - school does not exist
 * 12 - parent email does not exist
 */

// TODO: add phone number valiation once we have the requiremnt
// const q = new PQueue({ intervalCap: 40, interval: 1000 });

export class BulkController {
  private isValidId(id: string) {
    return /^\d+$/.test(id);
  }
  /**
   * request: {students: [
   * {
   * index: ...,
   * id: ...,
   * fullName:  ...,
   * school: ...,
   * parent: ... },
   * {},
   * ...]};
   *
   * return: {students: [
   * {
   * index: ...,
   * id: ...,
   * fullName:  ...,
   * school: ...,
   * parent: ...,
   * error_code: [..., ...],
   * {},
   * ...]};
   */
  async validateStudents(request: Request, response: Response) {
    const { students } = request.body;
    if (students == null || !Array.isArray(students)) {
      response
        .status(401)
        .send("No students sent or students not sent in the accepted format.");
      return;
    }

    let returnedStudents = { students: [] };
    for (const student of students) {
      let studentToReturn = { ...student };
      // 99
      if (student.index == null || student.index == undefined) {
        (
          studentToReturn["error_code"] ?? (studentToReturn["error_code"] = [])
        ).push(99);
        returnedStudents.students.push(studentToReturn);
        continue;
      }

      // 2
      if (
        student.fullName == null ||
        student.fullName == undefined ||
        student.fullName.trim() == ""
      ) {
        (
          studentToReturn["error_code"] ?? (studentToReturn["error_code"] = [])
        ).push(2);
      }

      // 8
      if (student.id != null && student.id != undefined) {
        if (!this.isValidId(student.id)) {
          (
            studentToReturn["error_code"] ??
            (studentToReturn["error_code"] = [])
          ).push(8);
        }
      }

      // 9
      if (
        student.school == null ||
        student.school == undefined ||
        student.school.trim() == ""
      ) {
        (
          studentToReturn["error_code"] ?? (studentToReturn["error_code"] = [])
        ).push(9);
      } else {
        // 11
        const schoolEntry = await getRepository(School)
          .createQueryBuilder("schools")
          .select()
          .where("schools.uniqueName = :uniqueName", {
            uniqueName: student.school.toLowerCase().trim(),
          })
          .getOne();

        if (schoolEntry == null) {
          (
            studentToReturn["error_code"] ??
            (studentToReturn["error_code"] = [])
          ).push(11);
        }
        // else {
        //   studentToReturn.school_uid = schoolEntry.uid;
        // }
      }

      // 10
      if (
        student.parent == null ||
        student.parent == undefined ||
        student.parent.trim() == ""
      ) {
        (
          studentToReturn["error_code"] ?? (studentToReturn["error_code"] = [])
        ).push(10);
      } else {
        // 12
        const parentEntry = await getRepository(User)
          .createQueryBuilder("users")
          .select()
          .where("users.email = :email", {
            email: student.parent,
          })
          .getOne();

        if (parentEntry == null) {
          (
            studentToReturn["error_code"] ??
            (studentToReturn["error_code"] = [])
          ).push(12);
        }
        // else {
        //   studentToReturn.parent_uid = parentEntry.uid;
        // }
      }

      // 0
      if (studentToReturn["error_code"] == null) {
        studentToReturn["error_code"] = [0];
      }

      returnedStudents.students.push(studentToReturn);
    }
    response.status(200).send(returnedStudents);
  }

  /**
   * request: {users: [
   * {
   * index: ...,
   * email: ...,
   * fullName:  ...,
   * address: ...,
   * phone_number: ... },
   * {},
   * ...]};
   *
   * return: {users: [
   * {
   * index: ...,
   * email: ...,
   * fullName:  ...,
   * address: ...,
   * phone_number: ...,
   * error_code: [..., ...],
   * hint_uids: [..., ...], <only with error code 3>
   * hint_indices: [..., ...], <only with error code 4> },
   * {},
   * ...]};
   */
  async validateUsers(request: Request, response: Response) {
    const { users } = request.body;
    if (users == null || !Array.isArray(users)) {
      response
        .status(401)
        .send("No users sent or users not sent in the accepted format.");
      return;
    }

    let existingEmailsInRequest = new Set<string>();
    let reptitiveEmailsInRequest = new Set<string>();
    let emailIdxPair = {};

    let returnedUsers = { users: [] };
    for (const user of users) {
      let userToReturn = { ...user };
      // 99 - Missing Index, early termination
      if (user.index == null || user.index == undefined) {
        (userToReturn["error_code"] ?? (userToReturn["error_code"] = [])).push(
          99
        );
        returnedUsers.users.push(userToReturn);
        continue;
      }
      // 1 - Email Validation
      if (
        user.email == null ||
        user.email == undefined ||
        !EmailValidator.validate(user.email)
      ) {
        (userToReturn["error_code"] ?? (userToReturn["error_code"] = [])).push(
          1
        );
      }

      // 2 - Name Validation
      if (
        user.fullName == null ||
        user.fullName == undefined ||
        user.fullName.trim() == ""
      ) {
        (userToReturn["error_code"] ?? (userToReturn["error_code"] = [])).push(
          2
        );
      }

      // 3 - Existing Emails
      const reptitiveEntry = await getRepository(User)
        .createQueryBuilder("users")
        .select()
        .where("users.email = :email", { email: user.email })
        .getOne();

      if (reptitiveEntry != null) {
        (userToReturn["error_code"] ?? (userToReturn["error_code"] = [])).push(
          3
        );
        userToReturn.hint_uids = [reptitiveEntry.uid];
      }

      // 4 - repetitive emails in the form, details added later
      (emailIdxPair[user.email] ?? (emailIdxPair[user.email] = [])).push(
        user.index
      );
      if (existingEmailsInRequest.has(user.email)) {
        reptitiveEmailsInRequest.add(user.email);
      } else {
        existingEmailsInRequest.add(user.email);
      }

      // 5 - Missing Address
      if (
        user.address == null ||
        user.address == undefined ||
        user.address.trim() == ""
      ) {
        (userToReturn["error_code"] ?? (userToReturn["error_code"] = [])).push(
          5
        );
      }

      // 6 - Geo
      // await q.add(async () => {
      let loc;
      try {
        loc = await getLngLat(user.address);
        console.log(loc);
        userToReturn = { ...userToReturn, loc };
      } catch (error) {
        console.log(`${user.email} failed to fetch location, error - ${error}`);
        (userToReturn["error_code"] ?? (userToReturn["error_code"] = [])).push(
          6
        );
      }
      // });

      // 7 - Missing phone number
      if (
        user.phone_number == null ||
        user.phone_number == undefined ||
        user.phone_number.trim() == ""
      ) {
        (userToReturn["error_code"] ?? (userToReturn["error_code"] = [])).push(
          7
        );
      }

      returnedUsers.users.push(userToReturn);
    }

    returnedUsers.users.forEach((user) => {
      if (reptitiveEmailsInRequest.has(user.email)) {
        (user["error_code"] ?? (user["error_code"] = [])).push(4);
        user.hint_indices = [...emailIdxPair[user.email]];
        user.hint_indices.splice(user.hint_indices.indexOf(user.index), 1);
      }

      // 0 - Success
      if (user["error_code"] == null) {
        user["error_code"] = [0];
      }
    });

    response.status(200).send(returnedUsers);
  }

  async saveUsers(request: Request, response: Response) {
    const { users } = request.body;
    if (users == null || !Array.isArray(users)) {
      response
        .status(401)
        .send("No users sent or users not sent in the accepted format.");
      return;
    }

    for (var user of users) {
      // Validations
      if (
        user.email == null ||
        user.email == undefined ||
        !EmailValidator.validate(user.email)
      ) {
        response
          .status(401)
          .send(`Incorrect email format for user ${user.email}`);
        return;
      }

      if (
        user.fullName == null ||
        user.fullName == undefined ||
        user.fullName.trim() == ""
      ) {
        response.status(401).send(`Empty name for user ${user.email}`);
        return;
      }

      if (
        user.address == null ||
        user.address == undefined ||
        user.address.trim() == ""
      ) {
        response.status(401).send(`Empty address for user ${user.email}`);
        return;
      }

      if (
        user.loc.longitude == null ||
        user.loc.longitude == undefined ||
        user.loc.latitude == null ||
        user.loc.latitude == undefined
      ) {
        response
          .status(401)
          .send(`Longitude or latitude missing for user ${user.email}`);
        return;
      }

      // Save
      try {
        const newUser = new User();
        newUser.email = user.email;
        newUser.fullName = user.fullName;
        newUser.address = user.address;
        newUser.longitude = user.loc.longitude;
        newUser.latitude = user.loc.latitude;
        newUser.role = "Parent";
        if (user.phone_number != null && user.phone_number != undefined) {
          newUser.phoneNumber = user.phone_number;
        }
        await getRepository(User).save(newUser);
      } catch (error) {
        response
          .status(401)
          .send(`Failed saving user to the database: ${error.message}`);
      }
    }

    response.status(200).send();
  }
}

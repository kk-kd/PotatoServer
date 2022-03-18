import { Request, Response } from "express";
import * as EmailValidator from "email-validator";
import { getRepository } from "typeorm";
import { User } from "../entity/User";
// import PQueue from "p-queue";
import { getLngLat } from "./GeoHelper";
import { School } from "../entity/School";
import { Student } from "../entity/Student";

/**
 * Note - validations while saving shouldn't be necessary. Just leave it there in case.
 */

/**
 * Validation error codes:
 * GENERAL
 * 99 - Missing index
 * 0 - success
 * 2 - no name
 * 13 - user does not permission to add parents/students to this school
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
const ROLE_SCHOOL_STAFF = "School Staff";
const ROLE_ADMIN = "Admin";

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
    const role = response.locals.jwtPayload.role;
    const userId = response.locals.jwtPayload.uid;

    if (students == null || !Array.isArray(students)) {
      response
        .status(401)
        .send("No students sent or students not sent in the accepted format.");
      return;
    }

    if (!(role === ROLE_SCHOOL_STAFF || role === ROLE_ADMIN)) {
      response
        .status(401)
        .send("You don't have enough permission for this action.");
      return;
    }

    let returnedStudents = this.studentsValidationHelper(
      students,
      role,
      userId
    );
    response.status(200).send(returnedStudents);
  }

  // return a boolean indicating if there's an error in @code{students} if @code{isAPIRequest}=false
  // return a json of potential problems of @code{students} if @code{isAPIRequest}=true
  async studentsValidationHelper(
    students,
    role: string,
    uid: number,
    isAPIRequest = true
  ) {
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
        // If not an API request, just wanna check if there's ANY error. Don't care about what the error is.
        // Similar below
        if (!isAPIRequest) return false;
        (
          studentToReturn["error_code"] ?? (studentToReturn["error_code"] = [])
        ).push(2);
      }

      // 8
      if (student.id != null && student.id != undefined) {
        if (!this.isValidId(student.id)) {
          if (!isAPIRequest) return false;

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
        if (!isAPIRequest) return false;
        (
          studentToReturn["error_code"] ?? (studentToReturn["error_code"] = [])
        ).push(9);
      } else {
        // 11
        const schoolEntry = await getRepository(School)
          .createQueryBuilder("schools")
          .select()
          .where("schools.uniqueName = :uniqueName", {
            uniqueName: student.school
              .toLowerCase()
              .trim()
              .replace(/\s\s+/g, " "),
          })
          .getOne();

        if (schoolEntry == null) {
          if (!isAPIRequest) return false;
          (
            studentToReturn["error_code"] ??
            (studentToReturn["error_code"] = [])
          ).push(11);
        }
        // else {
        //   studentToReturn.school_uid = schoolEntry.uid;
        // }
        else {
          if (role === ROLE_SCHOOL_STAFF) {
            const userEntry = await getRepository(User)
              .createQueryBuilder("users")
              .where("users.uid = :uid", { uid: uid })
              .leftJoinAndSelect("users.attachedSchools", "attachedSchools")
              .getOne();

            if (userEntry == null) {
              console.log("huh?");
            }

            const attachedSchools = userEntry.attachedSchools.map(
              (school) => school.uid
            );
            if (!attachedSchools.includes(schoolEntry.uid)) {
              if (!isAPIRequest) return false;
              (
                studentToReturn["error_code"] ??
                (studentToReturn["error_code"] = [])
              ).push(13);
            }
          }
        }
      }

      // 10
      if (
        student.parent == null ||
        student.parent == undefined ||
        student.parent.trim() == ""
      ) {
        if (!isAPIRequest) return false;
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
          if (!isAPIRequest) return false;
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

    if (isAPIRequest) {
      return returnedStudents;
    } else {
      return true;
    }
  }

  async saveStudents(request: Request, response: Response) {
    const { students } = request.body;
    const role = response.locals.jwtPayload.role;
    const userId = response.locals.jwtPayload.uid;

    if (students == null || !Array.isArray(students)) {
      response
        .status(401)
        .send("No students sent or students not sent in the accepted format.");
      return;
    }

    if (!(role === ROLE_SCHOOL_STAFF || role === ROLE_ADMIN)) {
      response
        .status(401)
        .send("You don't have enough permission for this action.");
      return;
    }

    if (!this.studentsValidationHelper(students, role, userId, false)) {
      response
        .status(401)
        .send("There's error with the data. Please validate first.");
      return;
    }

    for (var student of students) {
      const newStudent = new Student();

      // Validations
      if (
        student.fullName == null ||
        student.fullName == undefined ||
        student.fullName.trim() == ""
      ) {
        response.status(401).send(`Empty name for student ${student.fullName}`);
        return;
      }
      newStudent.fullName = student.fullName;

      if (student.id != null && student.id != undefined) {
        if (!this.isValidId(student.id)) {
          response
            .status(401)
            .send(
              `Student ${student.fullName} has invalid id. Id needs to be a positive integer.`
            );
          return;
        }
        newStudent.id = student.id;
      }

      if (
        student.school == null ||
        student.school == undefined ||
        student.school.trim() == ""
      ) {
        response
          .status(401)
          .send(`No school provided for student ${student.fullName}`);
        return;
      }

      const schoolEntry = await getRepository(School)
        .createQueryBuilder("schools")
        .select()
        .where("schools.uniqueName = :uniqueName", {
          uniqueName: student.school.toLowerCase().trim(),
        })
        .getOne();

      if (schoolEntry == null) {
        response
          .status(401)
          .send(
            `Student ${student.fullName}'s school does not exist in the database. Please create the school before adding the student.`
          );
        return;
      }
      newStudent.school = schoolEntry;

      if (
        student.parent == null ||
        student.parent == undefined ||
        student.parent.trim() == ""
      ) {
        response
          .status(401)
          .send(`No parent email provided for student ${student.fullName}`);
        return;
      }

      const parentEntry = await getRepository(User)
        .createQueryBuilder("users")
        .select()
        .where("users.email = :email", {
          email: student.parent,
        })
        .getOne();

      if (parentEntry == null) {
        response
          .status(401)
          .send(
            `Student ${student.fullName}'s parent does not exist in the database. Please create the parent before adding the student.`
          );
        return;
      }
      newStudent.parentUser = parentEntry;

      // Save
      try {
        await getRepository(Student).save(newStudent);
      } catch (error) {
        response
          .status(401)
          .send(
            `Failed saving student ${newStudent.fullName} to the database: ${error.message}`
          );
      }
    }

    response.status(200).send();
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
    const role = response.locals.jwtPayload.role;

    if (users == null || !Array.isArray(users)) {
      response
        .status(401)
        .send("No users sent or users not sent in the accepted format.");
      return;
    }

    if (!(role === ROLE_SCHOOL_STAFF || role === ROLE_ADMIN)) {
      response
        .status(401)
        .send("You don't have enough permission for this action.");
      return;
    }

    let returnedUsers = this.usersValidationHelper(users);
    response.status(200).send(returnedUsers);
  }

  // return a boolean indicating if there's an error in @code{users} if @code{isAPIRequest}=false
  // return a json of potential problems of @code{users} if @code{isAPIRequest}=true
  usersValidationHelper(users, isAPIRequest = true) {
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
      )
        if (!isAPIRequest) return false;
      {
        (userToReturn["error_code"] ?? (userToReturn["error_code"] = [])).push(
          1
        );
      }

      // 2 - Name Validation
      if (
        user.fullName == null ||
        user.fullName == undefined ||
        user.fullName.trim() == ""
      )
        if (!isAPIRequest) return false;
      {
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
        if (!isAPIRequest) return false;
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
        if (!isAPIRequest) return false;

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
        if (!isAPIRequest) return false;

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
        if (!isAPIRequest) return false;
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
      )
        if (!isAPIRequest) return false;
      {
        (userToReturn["error_code"] ?? (userToReturn["error_code"] = [])).push(
          7
        );
      }
      returnedUsers.users.push(userToReturn);
    }

    returnedUsers.users.forEach((user) => {
      if (reptitiveEmailsInRequest.has(user.email)) {
        if (!isAPIRequest) return false;
        (user["error_code"] ?? (user["error_code"] = [])).push(4);
        user.hint_indices = [...emailIdxPair[user.email]];
        user.hint_indices.splice(user.hint_indices.indexOf(user.index), 1);
      }

      // 0 - Success
      if (user["error_code"] == null) {
        user["error_code"] = [0];
      }
    });

    if (isAPIRequest) {
      return returnedUsers;
    } else {
      return true;
    }
  }

  async saveUsers(request: Request, response: Response) {
    const { users } = request.body;

    const role = response.locals.jwtPayload.role;

    if (users == null || !Array.isArray(users)) {
      response
        .status(401)
        .send("No users sent or users not sent in the accepted format.");
      return;
    }

    if (!(role === ROLE_SCHOOL_STAFF || role === ROLE_ADMIN)) {
      response
        .status(401)
        .send("You don't have enough permission for this action.");
      return;
    }

    if (!this.usersValidationHelper(users, false)) {
      response
        .status(401)
        .send("There's error with the data. Please validate first.");
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

      const newUser = new User();
      // Save
      try {
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
          .send(
            `Failed saving user ${newUser.email} to the database: ${error.message}`
          );
      }
    }

    response.status(200).send();
  }
}

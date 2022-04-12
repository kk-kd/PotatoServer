import { Request, Response } from "express";
import * as EmailValidator from "email-validator";
import { getRepository } from "typeorm";
import { User } from "../entity/User";
// import PQueue from "p-queue";
import { getLngLat } from "./GeoHelper";
import { School } from "../entity/School";
import { Student } from "../entity/Student";
import { StudentController } from "../controller/StudentController";
import { AccountRole } from "../Role";
import AuthController from "../controller/AuthController";

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
 * 1 - Email is not valid
 * 16 - Email is empty
 * 3 - email existed in the database
 * 4 - repetitive emails in request
 * 5 - Missing Address
 * 6 - Error while querying address
 * 7 - Missing Phone Number
 *
 * STUDENT
 * 8 - id is empty
 * 15 - id is invalid/nonnumerical
 * 9 - school entry is empty
 * 10 - parent email is empty
 * 14 - invalid email
 * 11 - school does not exist
 * 12 - parent email does not exist
 * 17 - student email is invalid
 * 18 - student email already exists
 */

// TODO: add phone number valiation once we have the requiremnt (ev4)
// const q = new PQueue({ intervalCap: 40, interval: 1000 });
const ROLE_SCHOOL_STAFF = "School Staff";
const ROLE_ADMIN = "Admin";
require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` });

export class BulkController {
  private isValidId(id: string) {
    return /^\d+$/.test(id);
  }
  /**
   * request: {students: [
   * {
   * index: ...,
   * student_id: ...,
   * name:  ...,
   * school_name: ...,
   * parent_email: ... },
   * {},
   * ...]};
   *
   * return: {students: [
   * {
   * index: ...,
   * student_id: ...,
   * name:  ...,
   * school_name: ...,
   * parent_email: ...,
   * error_code: [..., ...],
   * hint_uids: [..., ...], <only with error code 18>
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

    let returnedStudents = await this.studentsValidationHelper(
      students,
      role,
      userId
    );
    console.log(returnedStudents);
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
    console.log("Point 1");
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
        student.name == null ||
        student.name == undefined ||
        student.name.trim() == ""
      ) {
        // If not an API request, just wanna check if there's ANY error. Don't care about what the error is.
        // Similar below
        if (!isAPIRequest) return false;
        (
          studentToReturn["error_code"] ?? (studentToReturn["error_code"] = [])
        ).push(2);
      }

      // 8 ID IS EMPTY
      if (student.student_id == null || student.student_id == undefined) {
        if (!isAPIRequest) return false;

        (
          studentToReturn["error_code"] ?? (studentToReturn["error_code"] = [])
        ).push(8);
      }
      // 14 STUDENT ID IS NON NUMERICAL
      if (student.student_id != null && student.student_id != undefined) {
        if (!this.isValidId(student.student_id)) {
          if (!isAPIRequest) return false;
          (
            studentToReturn["error_code"] ??
            (studentToReturn["error_code"] = [])
          ).push(15);
        }
      }
      // 17 STUDENT EMAIL IS INVALID
      // Seeing if Email is blank
      console.log(student.student_email)
      const studentEmail = student.student_email;
      if (studentEmail != undefined && studentEmail != null && studentEmail != "" && studentEmail.toString().trim() != "" ) {
      // if (studentEmail != undefined && student.student_email != undefined && student.student_email != "" && student.student_email.trim() != "") {
        if (!isAPIRequest) return false;
        else {
          // 17 - Email is invalid
          if (!EmailValidator.validate(studentEmail)) {
            if (!isAPIRequest) return false;
            (
              studentToReturn["error_code"] ?? (studentToReturn["error_code"] = [])
            ).push(17);
          }
          // 18- Existing Emails
          const reptitiveEntry = await getRepository(User)
          .createQueryBuilder("users")
          .select()
          .where("users.email = :email", { email: studentEmail.toString().toLowerCase() })
          .getOne();

        if (reptitiveEntry != null || reptitiveEntry != undefined) {
          if (!isAPIRequest) return false;
          (studentToReturn["error_code"] ?? (studentToReturn["error_code"] = [])).push(
            18
          );
          studentToReturn.hint_uids = [reptitiveEntry.uid];
        }
    
      }
    }
      



      // 9 SCHOOL NAME ENTRY MISSING
      if (
        student.school_name == null ||
        student.school_name == undefined ||
        student.school_name.trim() == ""
      ) {
        if (!isAPIRequest) return false;
        (
          studentToReturn["error_code"] ?? (studentToReturn["error_code"] = [])
        ).push(9);
      } else {
        // 11 SCHOOL DOESN'T EXIST IN DATABASE
        const schoolEntry = await getRepository(School)
          .createQueryBuilder("schools")
          .select()
          .where("schools.uniqueName = :uniqueName", {
            uniqueName: student.school_name
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

      // 10 PARENT EMAIL IS EMPTY
      if (
        student.parent_email == null ||
        student.parent_email == undefined ||
        student.parent_email.trim() == ""
      ) {
        if (!isAPIRequest) return false;
        (
          studentToReturn["error_code"] ?? (studentToReturn["error_code"] = [])
        ).push(10);
      } else {
        // 12 PARENT EMAIL DOESN'T EXIST
        const parentEntry = await getRepository(User)
          .createQueryBuilder("users")
          .select()
          .where("users.email = :email", {
            email: student.parent_email.toLowerCase(),
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

      // 0 SUCCESS
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
    // const bool = await this.studentsValidationHelper(
    //   students,
    //   role,
    //   userId,
    //   false
    // );
    if (!true) {
      response
        .status(401)
        .send("There's error with the data. Please validate first.");
      return;
    }

    for (var student of students) {

      // // Validations
      // if (
      //   student.name == null ||
      //   student.name == undefined ||
      //   student.name.trim() == ""
      // ) {
      //   response.status(401).send(`Empty name for student ${student.name}`);
      //   return;
      // }
      // newStudent.fullName = student.name;

      // if (student.student_id != null && student.student_id != undefined) {
      //   if (!this.isValidId(student.student_id)) {
      //     response
      //       .status(401)
      //       .send(
      //         `Student ${student.name} has invalid id. Id needs to be a positive integer.`
      //       );
      //     return;
      //   }
      //   newStudent.id = student.student_id;
      // }

      if (
        student.school_name == null ||
        student.school_name == undefined ||
        student.school_name.trim() == ""
      ) {
        response
          .status(401)
          .send(`No school provided for student ${student.name}`);
        return;
      }

      const schoolEntry = await getRepository(School)
        .createQueryBuilder("schools")
        .select()
        .where("schools.uniqueName = :uniqueName", {
          uniqueName: student.school_name.toLowerCase().trim().replace(/\s\s+/g, ' '),
        })
        .getOne();

      if (schoolEntry == null) {
        response
          .status(401)
          .send(
            `Student ${student.name}'s school does not exist in the database. Please create the school before adding the student.`
          );
        return;
      }

      if (
        student.parent_email == null ||
        student.parent_email == undefined ||
        student.parent_email.trim() == ""
      ) {
        response
          .status(401)
          .send(`No parent email provided for student ${student.name}`);
        return;
      }

      var parentEntry = await getRepository(User)
        .createQueryBuilder("users")
        .select()
        .where("users.email = :email", {
          email: student.parent_email.toLowerCase(),
        })
        .getOne();

      if (parentEntry == null) {
        parentEntry = await getRepository(User)
          .createQueryBuilder("users")
          .select()
          .where("users.email = :email", {
            email: student.parent_email,
          })
          .getOne();
        if (parentEntry == null) {
          response
            .status(401)
            .send(
              `Student ${student.name}'s parent does not exist in the database. Please create the parent before adding the student.`
            );
          return;
        }
      }
      // // check email
      // if (student.student_email != null && student.student_email != undefined && student.student_email.trim() != "") {
        
      //     // 17 - Email is invalid
      //     if (!EmailValidator.validate(student.student_email)) {
      //       response
      //       .status(401)
      //       .send(
      //         `Student ${student.student_email}'s email is formatted incorrectly.`
      //       );
      //     return;
      //     }
          
      //     // 18- Existing Emails
      //     const reptitiveEntry = await getRepository(User)
      //     .createQueryBuilder("users")
      //     .select()
      //     .where("users.email = :email", { email: student.student_email.toLowerCase() })
      //     .getOne();

      //   if (reptitiveEntry != null || reptitiveEntry != undefined) {
      //     response
      //     .status(401)
      //     .send(
      //       `Student ${student.student_email}'s matches an existing user's email.`
      //     );
      //   }
      // }
      // newStudent.email = student.student_email;

    
      const studentEmail = student.student_email;

      if (studentEmail != undefined && studentEmail != null && studentEmail != "" && studentEmail.trim() != "" && studentEmail != null && !EmailValidator.validate(studentEmail)) {
        response.status(401).send("Please enter a valid email address.");
        return;
      }
  
      if (studentEmail != undefined) {
        const existingEmail = await getRepository(User)
          .createQueryBuilder("users")
          .where("users.email = :email", { email: studentEmail.toLowerCase() })
          .getOne();
  
        if (existingEmail != undefined || existingEmail != null) {
          response.status(401).send("This email has already been registered.");
          return;
        }
      }
  
      // would like all students live at the same place to have the same bus route
      // const existingStudent = await getRepository(Student)
      //   .createQueryBuilder("students")
      //   .leftJoinAndSelect("students.school", "school")
      //   .leftJoinAndSelect("students.parentUser", "user")
      //   .leftJoinAndSelect("students.route", "route")
      //   .leftJoinAndSelect("students.inRangeStops", "inRangeStops")
      //   .where("school.uniqueName = :school", {
      //     school: request.body.school.uniqueName,
      //   })
      //   .andWhere("user.longitude = :longitude", {
      //     longitude: request.body.parentUser.longitude,
      //   })
      //   .andWhere("user.latitude = :latitude", {
      //     latitude: request.body.parentUser.latitude,
      //   })
      //   .getOne();
  
      // if (existingStudent != undefined) {
      //   request.body.route = existingStudent.route;
      //   request.body.inRangeStops = existingStudent.inRangeStops;
      // }
      var saveStudentDict = {};

      if (studentEmail != undefined) {
        var loginAccount = new User();
        loginAccount.fullName = student.name;
        loginAccount.email = studentEmail;
        loginAccount.role = AccountRole.STUDENT;
        loginAccount.phoneNumber = student.phoneNumber;
        request.body.account = loginAccount;
      
      saveStudentDict = {
        fullName: student.name,
        id: student.student_id,
        school: schoolEntry,
        parentUser: parentEntry,
        account: loginAccount,
        }
      }
      else{
        saveStudentDict = {
          fullName: student.name,
          id: student.student_id,
          school: schoolEntry,
          parentUser: parentEntry,
          }
      }
      //manipulate student dict around to fit our wanted input format.

      let result;
      try {
        result = await getRepository(Student).save(saveStudentDict);
      } catch (e) {
        response
          .status(401)
          .send(
            "New Student (" + student + ") couldn't be saved with error " + e
          );
        return;
      }
  
      if (studentEmail != undefined) {
        const link = await AuthController.generatePasswordJWT(
          loginAccount,
          "14 days"
        );
        try {
          await getRepository(User).save(loginAccount);
        } catch (error) {
          response.status(401).send("User Register: " + error);
          return;
        }
  
        try {
          await AuthController.sendNewUserEmail(loginAccount, link);
        } catch (error) {
          response
            .status(401)
            .send("Error sending confirmation email. Please try again.");
          return;
        }
      }
      response.status(200).send();
    }
  }
  
  /**
   * request: {users: [
   * {
   * index: ...,
   * email: ...,
   * name:  ...,
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
    console.log("we made it");
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

    let returnedUsers = await this.usersValidationHelper(users);
    console.log(returnedUsers);
    response.status(200).send(returnedUsers);
  }

  // return a boolean indicating if there's an error in @code{users} if @code{isAPIRequest}=false
  // return a json of potential problems of @code{users} if @code{isAPIRequest}=true
  async usersValidationHelper(users, isAPIRequest = true) {
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

      // 1 - Email is blank
      if (user.email == null || user.email == undefined) {
        if (!isAPIRequest) return false;
        (userToReturn["error_code"] ?? (userToReturn["error_code"] = [])).push(
          16
        );
      } else {
        // 14 - Email is invalid
        if (!EmailValidator.validate(user.email)) {
          if (!isAPIRequest) return false;
          (
            userToReturn["error_code"] ?? (userToReturn["error_code"] = [])
          ).push(1);
        }
      }

      // 2 - Name Validation
      if (
        user.name == null ||
        user.name == undefined ||
        user.name.trim() == ""
      ) {
        if (!isAPIRequest) return false;
        (userToReturn["error_code"] ?? (userToReturn["error_code"] = [])).push(
          2
        );
      }
      // 3 - Existing Emails
      if (user.email != null || user.email != undefined) {
        const reptitiveEntry = await getRepository(User)
          .createQueryBuilder("users")
          .select()
          .where("users.email = :email", { email: user.email.toLowerCase() })
          .getOne();

        if (reptitiveEntry != null) {
          if (!isAPIRequest) return false;
          (userToReturn["error_code"] ?? (userToReturn["error_code"] = [])).push(
            3
          );
          userToReturn.hint_uids = [reptitiveEntry.uid];
        }
      }
      if (user.email != null || user.email != undefined) {

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
      } else {
        // 6 - Geo
        // await q.add(async () => {
        var loc;
        try {
          loc = await getLngLat(user.address);
          console.log(loc);
          userToReturn = { ...userToReturn, loc };
        } catch (error) {
          console.log(
            `${user.email} failed to fetch location, error - ${error}`
          );
          if (!isAPIRequest) return false;
          (
            userToReturn["error_code"] ?? (userToReturn["error_code"] = [])
          ).push(6);
        }
      }

      // 7 - Missing phone number
      // When changing this in ev4, trim a string version of the phone number to check if its blank
      if (user.phone_number == null || user.phone_number == undefined) {
        if (!isAPIRequest) return false;
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

    // console.log(returnedUsers[0]["error_code"]);


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

    if (!(await this.usersValidationHelper(users, false))) {
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
        user.name == null ||
        user.name == undefined ||
        user.name.trim() == ""
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
        newUser.email = user.email.toLowerCase();
        newUser.fullName = user.name;
        newUser.address = user.address;
        newUser.longitude = user.loc.longitude;
        newUser.latitude = user.loc.latitude;
        newUser.role = AccountRole.PARENT;
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

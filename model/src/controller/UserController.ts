import {
  EntityRepository,
  Repository,
  getRepository,
  getConnection,
} from "typeorm";
import { NextFunction, Request, Response } from "express";
import { User } from "../entity/User";
import * as bcrypt from "bcryptjs";
import * as EmailValidator from "email-validator";
import { Dirent } from "fs";
import { AccountRole } from "../Role";

@EntityRepository(User)
export class UserController extends Repository<User> {
  private userRepository = getRepository(User);

  async allUsers(request: Request, response: Response, next: NextFunction) {
    try {
      // let {test} = request.body;
      // const users = this.userRepository.find();
      // const numberOfUsersToSkip = pagesToSkip * pageSize;
      // PAGE STARTS AT 0
      const role = response.locals.jwtPayload.role;
      if (!role || role != "Admin") {
        response.status(409).send("User is not an admin.");
        return;
      }
      const pageNum: number = +request.query.page;
      const takeNum: number = +request.query.size;
      var skipNum = pageNum * takeNum;
      var sortSpecification;
      var sortDirSpec;
      if (request.query.sort == "none") {
        sortSpecification = "users.uid";
      } else {
        //should error check instead of else
        sortSpecification = "users." + request.query.sort;
      }
      if (request.query.sortDir == "none" || request.query.sortDir == "ASC") {
        sortDirSpec = "ASC";
      } else {
        //error check instead of else
        sortDirSpec = "DESC";
      }
      const usersQueryResult = await this.userRepository
        .createQueryBuilder("users")
        .skip(skipNum)
        .take(takeNum)
        .orderBy(sortSpecification, sortDirSpec)
        .getMany();
      response.status(200);
      return usersQueryResult;
    } catch (e) {
      response.status(401).send("Users were not found with error: " + e);
      return;
    }
  }
  async filterAllUsers(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    try {
      // let {test} = request.body;
      // const users = this.userRepository.find();
      // const numberOfUsersToSkip = pagesToSkip * pageSize;
      // PAGE STARTS AT 0

      const role = response.locals.jwtPayload.role;
      if (
        !role ||
        !(role == "Admin" || role == "School Staff" || role == "Driver")
      ) {
        response.status(409).send("User is not an admin.");
        return;
      }
      const pageNum: number = +request.query.page;
      if (pageNum <= -1) {
        response
          .status(401)
          .send("Please specify a positive page number to view results.");
        return;
      }
      const takeNum: number = +request.query.size;
      var skipNum = pageNum * takeNum;

      var sortSpecification;
      var sortDirSpec;
      if (request.query.sort == "none") {
        sortSpecification = "users.uid";
      } else {
        //should error check instead of else
        sortSpecification = "users." + request.query.sort;
      }
      if (request.query.sortDir == "ASC") {
        sortDirSpec = "ASC";
      } else if (request.query.sortDir == "DESC") {
        //error check instead of else
        sortDirSpec = "DESC";
      } else {
        sortDirSpec = "ASC";
        sortSpecification = "users.uid";
      }
      var filterSpecification;
      filterSpecification = "users." + request.query.sort;
      const queryFilterType = request.query.filterType || "";
      const queryFilterData = request.query.filterData || "";
      const roleFilterData = request.query.roleFilter || "";
      if (request.query.showAll && request.query.showAll === "true") {
        if (role == "School Staff" && !request.query.isCreate) {
          const userId = response.locals.jwtPayload.uid;
          const currentUser = await this.userRepository
            .createQueryBuilder("users")
            .where("users.uid = :uid", { uid: userId })
            .leftJoinAndSelect("users.attachedSchools", "attachedSchools")
            .getOneOrFail();
          const attachedSchools = currentUser.attachedSchools.map(
            (school) => school.uid
          );
          const usersQueryResult = await this.userRepository
            .createQueryBuilder("users")
            .orderBy(sortSpecification, sortDirSpec)
            .where("users.email ilike '%' || :email || '%'", {
              email: queryFilterData,
            })
            .andWhere("users.fullName ilike '%' || :fullName || '%'", {
              fullName: queryFilterType,
            })
            .andWhere("users.role ilike '%' || :role || '%'", {
              role: roleFilterData,
            })
            .leftJoinAndSelect("users.students", "student")
            .leftJoinAndSelect("student.school", "schools")
            .getMany();
          response.status(200);
          const filtered = usersQueryResult.filter((user) =>
            user.students.some((student) =>
              attachedSchools.some((uid) => uid == student.school.uid)
            )
          );
          const total = filtered.length;
          return {
            users: filtered,
            total: total,
          };
        }
        const [usersQueryResult, total] = await this.userRepository
          .createQueryBuilder("users")
          .orderBy(sortSpecification, sortDirSpec)
          .where("users.email ilike '%' || :email || '%'", {
            email: queryFilterData,
          })
          .andWhere("users.fullName ilike '%' || :fullName || '%'", {
            fullName: queryFilterType,
          })
          .andWhere("users.role ilike '%' || :role || '%'", {
            role: roleFilterData,
          })
          .leftJoinAndSelect("users.students", "student")
          .getManyAndCount();
        response.status(200);
        return {
          users: usersQueryResult,
          total: total,
        };
      } else {
        if (role == "School Staff" && !request.query.isCreate) {
          const userId = response.locals.jwtPayload.uid;
          const currentUser = await this.userRepository
            .createQueryBuilder("users")
            .where("users.uid = :uid", { uid: userId })
            .leftJoinAndSelect("users.attachedSchools", "attachedSchools")
            .getOneOrFail();
          const attachedSchools = currentUser.attachedSchools.map(
            (school) => school.uid
          );
          const usersQueryResult = await this.userRepository
            .createQueryBuilder("users")
            .orderBy(sortSpecification, sortDirSpec)
            .where("users.email ilike '%' || :email || '%'", {
              email: queryFilterData,
            })
            .andWhere("users.fullName ilike '%' || :fullName || '%'", {
              fullName: queryFilterType,
            })
            .andWhere("users.role ilike '%' || :role || '%'", {
              role: roleFilterData,
            })
            .leftJoinAndSelect("users.students", "student")
            .leftJoinAndSelect("student.school", "schools")
            .getMany();
          response.status(200);
          const filtered = usersQueryResult.filter((user) =>
            user.students.some((student) =>
              attachedSchools.some((uid) => uid == student.school.uid)
            )
          );
          const total = filtered.length;
          return {
            users: filtered.splice(skipNum, skipNum + takeNum),
            total: total,
          };
        }
        const [usersQueryResult, total] = await this.userRepository
          .createQueryBuilder("users")
          .skip(skipNum)
          .take(takeNum)
          .orderBy(sortSpecification, sortDirSpec)
          .where("users.email ilike '%' || :email || '%'", {
            email: queryFilterData,
          })
          .andWhere("users.fullName ilike '%' || :fullName || '%'", {
            fullName: queryFilterType,
          })
          .andWhere("users.role ilike '%' || :role || '%'", {
            role: roleFilterData,
          })
          .leftJoinAndSelect("users.students", "student")
          .getManyAndCount();
        response.status(200);
        return {
          users: usersQueryResult,
          total: total,
        };
      }
    } catch (e) {
      response.status(401).send("Users were not found with error: " + e);
      return;
    }
  }

  async currentUserJWT(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    try {
      const uidNumber = response.locals.jwtPayload.uid;
      const usersQueryResult = await this.userRepository
        .createQueryBuilder("users")
        .where("users.uid = :uid", { uid: uidNumber })
        .leftJoinAndSelect("users.students", "students")
        .leftJoinAndSelect("students.school", "school")
        .leftJoinAndSelect("students.route", "route")
        .getOneOrFail();
      response.status(200);
      return usersQueryResult;
    } catch (e) {
      response
        .status(401)
        .send(
          "User UID: " +
            response.locals.jwtPayload.uid +
            " was not found adn could not be deleted."
        );
      return;
    }
  }

  async oneUser(request: Request, response: Response, next: NextFunction) {
    try {
      const uidNumber = request.params.uid; //needed for the await call / can't nest them
      const role = response.locals.jwtPayload.role;
      if (
        !role ||
        !(role == "Admin" || role == "School Staff" || role == "Driver")
      ) {
        response.status(409).send("User is not an admin.");
        return;
      }
      const usersQueryResult = await this.userRepository
        .createQueryBuilder("users")
        .where("users.uid = :uid", { uid: uidNumber })
        .leftJoinAndSelect("users.students", "students")
        .leftJoinAndSelect("students.route", "route")
        .leftJoinAndSelect("students.inRangeStops", "stops")
        .leftJoinAndSelect("students.school", "school")
        .leftJoinAndSelect("users.attachedSchools", "attachedSchools")
        .leftJoinAndSelect("users.runs", "runs")
        .leftJoinAndSelect("runs.route", "runRoute")
        .getOneOrFail();
      response.status(200);
      return usersQueryResult;
    } catch (e) {
      response
        .status(401)
        .send("User ID: " + request.params.uid + " was not found.");
      return;
    }
  }
  async saveNewUser(request: Request, response: Response, next: NextFunction) {
    try {
      const role = response.locals.jwtPayload.role;
      if (!role || !(role == "Admin" || role == "School Staff")) {
        response.status(409).send("User is not an admin.");
        return;
      }
      if (!EmailValidator.validate(request.body.email)) {
        response.status(401).send("Update User: Email validation failed");
        return;
      }
      const userEmail = request.body.email;

      const reptitiveEntry = await getRepository(User)
        .createQueryBuilder("users")
        .select()
        .where("users.email = :email", { email: userEmail.toLowerCase() })
        .getOne();

      console.log(reptitiveEntry);

      if (
        reptitiveEntry != null &&
        reptitiveEntry.uid != parseInt(request.body.uid)
      ) {
        response.status(401).send("Email is already taken for User.");
        return;
      }
      const user = await this.userRepository.save(request.body);
      response.status(200);
      return user;
    } catch (e) {
      response
        .status(401)
        .send(
          "New User (" + request.body + ") couldn't be saved with error " + e
        );
      return;
    }
  }

  async updateUser(request: Request, response: Response, next: NextFunction) {
    try {
      const uidNumber = request.params.uid;
      const role = response.locals.jwtPayload.role;
      if (!(role == AccountRole.ADMIN || role == AccountRole.SCHOOL_STAFF)) {
        response.status(409).send("The user does not have enough permission.");
        return;
      }

      if (!EmailValidator.validate(request.body.email)) {
        response.status(401).send("Update User: Email validation failed");
        return;
      }
      const userEmail = request.params.email;

      const reptitiveEntry = await getRepository(User)
        .createQueryBuilder("users")
        .select()
        .where("users.email = :email", { email: userEmail })
        .getOne();

      console.log(reptitiveEntry);

      if (reptitiveEntry != null && reptitiveEntry.uid != parseInt(uidNumber)) {
        response.status(401).send("Email is already taken for User.");
        return;
      }

      const ret = await getConnection()
        .createQueryBuilder()
        .update(User)
        .where("uid = :uid", { uid: uidNumber })
        .set(request.body)
        .execute();
      response.status(200);
      return ret;
    } catch (e) {
      response
        .status(401)
        .send(
          "User with UID " +
            request.params.uid +
            " and details(" +
            request.body +
            ") couldn't be updated with error " +
            e
        );
      return;
    }
  }

  async deleteUser(request: Request, response: Response, next: NextFunction) {
    try {
      // const isAdmin = response.locals.jwtPayload.isAdmin;
      // if (!isAdmin) {
      //   response.status(409).send("User is not an admin.")
      //   return;
      // }
      const uidNumber = request.params.uid; //needed for the await call / can't nest them
      const role = response.locals.jwtPayload.role;
      if (!role || !(role == "Admin" || role == "School Staff")) {
        response.status(409).send("User is not an admin.");
        return;
      }
      const userQuereyResult = await this.userRepository
        .createQueryBuilder("users")
        .delete()
        .where("users.uid = :uid", { uid: uidNumber })
        .execute();
      response.status(200);
      return userQuereyResult;
    } catch (e) {
      response
        .status(401)
        .send(
          "User UID: " +
            request.params.uid +
            " was not found adn could not be deleted."
        );
      return;
    }
  }

  findByUserID(uid: number) {
    return this.createQueryBuilder("users")
      .where("users.uid = :uid", { uid })
      .leftJoinAndSelect("users.students", "student")
      .getOne();
  }
  findByUserName(firstName: string) {
    return this.createQueryBuilder("users")
      .where("users.firstName = :firstName", { firstName })
      .getOne();
  }
  updateUserName(uid: number, role: string) {
    return this.createQueryBuilder("users")
      .update()
      .set({ role: role })
      .where("users.uid = :uid", { uid })
      .execute();
  }
  getAssociatedStudents() {
    return this.createQueryBuilder("users")
      .leftJoinAndSelect("users.students", "students")
      .where("students.firstName = :firstName", {
        firstName: "firstStudentFirstName",
      })
      .getMany();
  }
}

function checkIfAdminForPrivileges(response) {
  const role = response.locals.jwtPayload.role;
  if (!role || role != "Admininstrator") {
    response.status(409).send("User is not an admin.");
    return;
  }
}

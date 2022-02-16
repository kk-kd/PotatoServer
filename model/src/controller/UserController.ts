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

@EntityRepository(User)
export class UserController extends Repository<User> {
  private userRepository = getRepository(User);

  async allUsers(request: Request, response: Response, next: NextFunction) {
    try {
      // let {test} = request.body;
      // const users = this.userRepository.find();
      // const numberOfUsersToSkip = pagesToSkip * pageSize;
      // PAGE STARTS AT 0
      const isAdmin = response.locals.jwtPayload.isAdmin;
      if (!isAdmin) {
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

      const isAdmin = response.locals.jwtPayload.isAdmin;
      if (!isAdmin) {
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
      const queryFilterType = request.query.filterType;
      const queryFilterData = request.query.filterData;
      if (request.query.showAll && request.query.showAll === "true") {
        const [usersQueryResult, total] = await this.userRepository
          .createQueryBuilder("users")
          .orderBy(sortSpecification, sortDirSpec)
          .where("users.email ilike '%' || :email || '%'", {
            email: queryFilterData,
          })
          .andWhere("users.lastName ilike '%' || :lastName || '%'", {
            lastName: queryFilterType,
          })
          .leftJoinAndSelect("users.students", "student")
          .getManyAndCount();
        response.status(200);
        return {
          users: usersQueryResult,
          total: total,
        };
      } else {
        const [usersQueryResult, total] = await this.userRepository
          .createQueryBuilder("users")
          .skip(skipNum)
          .take(takeNum)
          .orderBy(sortSpecification, sortDirSpec)
          .where("users.email ilike '%' || :email || '%'", {
            email: queryFilterData,
          })
          .andWhere("users.lastName ilike '%' || :lastName || '%'", {
            lastName: queryFilterType,
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
    }
  }

  async oneUser(request: Request, response: Response, next: NextFunction) {
    try {
      const uidNumber = request.params.uid; //needed for the await call / can't nest them
      const isAdmin = response.locals.jwtPayload.isAdmin;
      if (!isAdmin) {
        response.status(409).send("User is not an admin.");
        return;
      }
      const usersQueryResult = await this.userRepository
        .createQueryBuilder("users")
        .where("users.uid = :uid", { uid: uidNumber })
        .leftJoinAndSelect("users.students", "students")
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
      const isAdmin = response.locals.jwtPayload.isAdmin;
      if (!isAdmin) {
        response.status(409).send("User is not an admin.");
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
      const isAdmin = response.locals.jwtPayload.isAdmin;
      if (!isAdmin) {
        response.status(409).send("User is not an admin.");
        return;
      }

      var passwordValidator = require("password-validator");
      var schema = new passwordValidator();
      schema
        .is()
        .min(8) // Minimum length 8
        .is()
        .max(64) // Maximum length 100
        .has()
        .uppercase() // Must have uppercase letters
        .has()
        .lowercase() // Must have lowercase letters
        .has()
        .digits(2) // Must have at least 2 digits
        .has()
        .not()
        .spaces(); // Should not have spaces

      if (!EmailValidator.validate(request.body.email)) {
        response.status(401).send("Update User: Email validation failed");
        return;
      }

      if (!schema.validate(request.body.password)) {
        response
          .status(401)
          .send(
            "Update User: Password validation failed; Please specify a password with at least 8 characters, with at least 1 uppercase letter, 1 lowercase letter, and 2 digits. No spaces."
          );
        return;
      }
      if (
        request.query.changePassword &&
        request.query.changePassword == "true"
      ) {
        console.log("Hashing Password");
        console.log(request.body.password);
        request.body.password = await bcrypt.hash(request.body.password, 10);
        console.log(request.body.password);
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
      const isAdmin = response.locals.jwtPayload.isAdmin;
      if (!isAdmin) {
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
  updateUserName(uid: number, isAdmin: boolean) {
    return this.createQueryBuilder("users")
      .update()
      .set({ isAdmin: isAdmin })
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
  const isAdmin = response.locals.jwtPayload.isAdmin;
  if (!isAdmin) {
    response.status(409).send("User is not an admin.");
    return;
  }
}

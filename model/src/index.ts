import "reflect-metadata";
import { Connection, createConnection, getConnection } from "typeorm";
import * as express from "express";
import * as bodyParser from "body-parser";
import { Request, Response } from "express";
import { Routes } from "./routes";

import { User } from "./entity/User";
import { UserController } from "./controller/UserController";
import { Student } from "./entity/Student";
import { StudentController } from "./controller/StudentController";
import { Route } from "./entity/Route";
import { RouteController } from "./controller/RouteController";

import { School } from "./entity/School";
import { SchoolController } from "./controller/SchoolController";

createConnection()
  .then(async (connection) => {
    // create express app
    const app = express();
    app.use(bodyParser.json());
    var cors = require("cors");
    app.use(cors());
    // register all express routes from defined application routes
    Routes.forEach((route) => {
      (app as any)[route.method](
        route.route,
        (req: Request, res: Response, next: Function) => {
          const result = new (route.controller as any)()[route.action](
            req,
            res,
            next
          );
          if (result instanceof Promise) {
            result.then((result) =>
              result !== null && result !== undefined
                ? res.send(result)
                : undefined
            );
          } else if (result !== null && result !== undefined) {
            res.json(result);
          }
        }
      );
    });

    // setup express app here
    // ...

    // start express server
    app.listen(3000);

    // Clean the tables:
    let tableNames: string[] = ["users", "students", "schools", "routes"]; //TODO: Clean other tables by adding strings here if needed
    for (var tableName of tableNames) {
      await getConnection()
        .createQueryBuilder()
        .delete()
        .from(tableName)
        .execute();
    }

    const userRepository = connection.getCustomRepository(UserController);

    let nameIter: string[] = [
      "first",
      "second",
      "third",
      "fourth",
      "fifth",
      "sixth",
      "seventh",
      "eighth",
      "ninth",
      "tenth",
    ];
    var count = 0.1;
    var AdminBoolean = false;
    for (var userNumber in nameIter) {
      AdminBoolean = !AdminBoolean;
      count = count + 1;
      const userName = nameIter[userNumber] + "User";
      const newUser = new User();
      newUser.email = userName + "Email@email.com";
      newUser.firstName = userName + "FirstName";
      newUser.middleName = userName + "MiddleName";
      newUser.lastName = userName + "LastName";
      newUser.address = userName + " address Road";
      newUser.longitude = count;
      newUser.latitude = count - 1;
      newUser.isAdmin = AdminBoolean;
      await userRepository.save(newUser);
    }

    const studentRepository = connection.getCustomRepository(StudentController);
    var intCount = 0;
    for (var studentNumber in nameIter) {
      intCount = intCount + 1;
      const studentName = nameIter[studentNumber] + "Student";
      const newStudent = new Student();
      newStudent.id = intCount;
      newStudent.firstName = studentName + "FirstName";
      newStudent.middleName = studentName + "MiddleName";
      newStudent.lastName = studentName + "LastName";
      //TODO: throw in some links to routes, schools, and parents for test students

      await studentRepository.save(newStudent);
    }

    const schoolRepository = connection.getCustomRepository(SchoolController);
    var intCount = 0;
    for (var schoolNumber in nameIter) {
      intCount = intCount + 1;
      const schoolName = nameIter[schoolNumber] + "School";
      const newSchool = new School();
      newSchool.name = schoolName + " Name";
      newSchool.address = intCount + " Lane, Durham, NC";
      newSchool.latitude = intCount + 1;
      newSchool.longitude = intCount + 2;
      //TODO: Throw in some associated students / routes depending on what testing needs
      await schoolRepository.save(newSchool);
    }

    const routeRepository = connection.getCustomRepository(RouteController);
    var intCount = 0;
    for (var routeNumber in nameIter) {
      intCount = intCount + 1;
      const routeName = nameIter[routeNumber] + "Route";
      const newRoute = new Route();
      newRoute.name = routeName + " Name";
      newRoute.desciption = routeName + " Description";
      //TODO: Throw in some associated students / routes depending on what testing needs
      await routeRepository.save(newRoute);
    }

    // // insert new users for test
    // await connection.manager.save(
    //   connection.manager.create(User, {
    //     email: "jdm109@duke.edu",
    //     firstName: "Jackson",
    //     lastName: "McNabb",
    //     address: "102 Example Lane",
    //     longitude: 32.5,
    //     latitude: 432.54,
    //     isAdmin: false,
    //   })
    // );

    // await connection.manager.save(
    //   connection.manager.create(School, {

    //   })
    // )

    console.log(
      "Express server has started on port 3000. Open http://localhost:3000/users or http://localhost:3000/students to see results"
    );

    console.log();
  })
  .catch((error) => console.log(error));

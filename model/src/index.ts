import "reflect-metadata";
import { Connection, createConnection, getConnection } from "typeorm";
import * as express from "express";
import * as bodyParser from "body-parser";
import { Request, Response } from "express";
import { allRoutes } from "./routes/allRoutes";
import authRoutes from "./routes/authRoutes";
import { User } from "./entity/User";
import { UserController } from "./controller/UserController";
import { Student } from "./entity/Student";
import { StudentController } from "./controller/StudentController";
import { Route } from "./entity/Route";
import { RouteController } from "./controller/RouteController";

import { School } from "./entity/School";
import { SchoolController } from "./controller/SchoolController";
import { checkJwt } from "./middlewares/checkJwt";

require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` });
let privateKey;
let certificate;
let credentials;
var fs = require("fs");

if (process.env.NODE_ENV == "development") {
  privateKey = fs.readFileSync(
    __dirname + process.env.CERTIFICATE_KEY_PATH,
    "utf8"
  );
  certificate = fs.readFileSync(
    __dirname + process.env.CERTIFICATE_SERVER_PATH,
    "utf8"
  );
  credentials = { key: privateKey, cert: certificate };
} else if (process.env.NODE_ENV == "production") {
  privateKey = fs.readFileSync(process.env.CERTIFICATE_KEY_PATH, "utf8");
  certificate = fs.readFileSync(process.env.CERTIFICATE_SERVER_PATH, "utf8");
  var chain = fs.readFileSync(process.env.CERTIFICATE_CHAIN_PATH, "utf8");
  credentials = { key: privateKey, ca: chain, cert: certificate };
}
console.log('we made it 1');

function makeid(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

createConnection()
  .then(async (connection) => {
    // create express app
    const app = express();
    app.use(bodyParser.json());
    app.use("/api", authRoutes);
    // var cors = require("cors"); //neeeded? cady: beaware - use cors cause potential security problems
    // app.use(cors()); //etc ^
    // // register all express routes from defined application routes
    allRoutes.forEach((route) => {
      (app as any)[route.method](
        route.route, //TODO: jwt here
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
    const path = require("path");
    app.use(express.static(path.join(__dirname, "..", "..", "view", "build")));
    app.get("/*", function (req, res) {
      res.sendFile(
        path.join(__dirname, "..", "..", "view", "build", "index.html")
      );
    });

    // start express server
    var https = require("https");
    var httpsServer = https.createServer(credentials, app);
    httpsServer.listen(process.env.HTTPS_PORT, () => {
      console.log(
        `Example app listening at https://localhost:${process.env.HTTPS_PORT}`
      );
    });

    // Redirect from http port 80 to https
    var http = require("http");
    http
      .createServer(function (req, res) {
        res.writeHead(301, {
          Location: "https://" + req.headers["host"] + req.url,
        });
        res.end();
      })
      .listen(process.env.HTTP_PORT);

    // Clean the tables:
    // let tableNames: string[] = ["users", "students", "schools", "routes"]; //TODO: Clean other tables by adding strings here if needed
    // for (var tableName of tableNames) {
    //   await getConnection()
    //     .createQueryBuilder()
    //     .delete()
    //     .from(tableName)
    //     .execute();
    // }

    // const userRepository = connection.getCustomRepository(UserController);
    // userRepository.query(`TRUNCATE ${"users"} RESTART IDENTITY CASCADE;`);

    // const studentRepository = connection.getCustomRepository(StudentController);
    // studentRepository.query(`TRUNCATE ${"students"} RESTART IDENTITY CASCADE;`);

    // const schoolRepository = connection.getCustomRepository(SchoolController);
    // schoolRepository.query(`TRUNCATE ${"schools"} RESTART IDENTITY CASCADE;`)

    // const routeRepository = connection.getCustomRepository(RouteController);
    // routeRepository.query(`TRUNCATE ${"routes"} RESTART IDENTITY CASCADE;`);


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
    var intCount = 0;

    // Construct User Entity
    for (var userNumber in nameIter) {
      AdminBoolean = !AdminBoolean;
      count = count + 1;
      intCount = intCount + 1;
      const userName = nameIter[userNumber] + "User";
      const newUser = new User();
      newUser.email = makeid(20) + "@email.com";
      newUser.firstName = userName + "FirstName";
      newUser.middleName = userName + "MiddleName";
      newUser.lastName = userName + "LastName";
      newUser.address = userName + " address Road";
      newUser.longitude = count;
      newUser.latitude = count - 1;
      newUser.isAdmin = AdminBoolean;
      newUser.password = 'testPassword' + count + 5;
      // Construct Student Entity
      const studentName = nameIter[userNumber] + "Student";
      const newStudent = new Student();
      newStudent.id = "" + intCount;
      newStudent.firstName = studentName + "FirstName";
      newStudent.middleName = studentName + "middleName";
      newStudent.lastName = studentName + "lastName";
      newUser.students = [newStudent];

      // Construct Route Entity:
      const routeName = nameIter[userNumber] + "Route";
      const newRoute = new Route();
      newRoute.name = routeName + " Name";
      newRoute.desciption = routeName + " Description";
      newRoute.students = [newStudent];
      // Construct School Entity
      const schoolName = nameIter[userNumber] + "School";
      const newSchool = new School();
      newSchool.name = schoolName + " Name";
      newSchool.address = intCount + " Lane, Durham, NC";
      newSchool.latitude = intCount + 1;
      newSchool.longitude = intCount + 2;
      // newSchool.routes = [newRoute];
      newSchool.students = [newStudent];

      // Save the entries to the Databse
      await connection.manager.save(newUser);
      await connection.manager.save(newRoute);
      await connection.manager.save(newSchool);


      // await userRepository.save(newUser);
      // await studentRepository.save(newStudent);



    }

    // connection.manager.createQueryBuilder()
    // .leftJoinAndSelect("t.customer", "customer")
    // .leftJoinAndSelect(/* other joins */)
    // .where(/* custom where */)
    // .getOne();


    // var intCount = 0;
    // intCount = intCount + 1;

    // for (var studentNumber in nameIter) {
    //   const studentName = nameIter[studentNumber] + "Student";
    //   await connection.manager.save(
    //     connection.manager.create(Student, {
    //       id: intCount,
    //       firstName: studentName + "FirstName",
    //       lastName: studentName + "LastName",
    //       middleName: studentName + "MiddleName",
    //     })
    //   );
    //   //TODO: throw in some links to routes, schools, and parents for test students
    // }

    // var intCount = 0;
    // for (var schoolNumber in nameIter) {
    //   intCount = intCount + 1;
    //   const schoolName = nameIter[schoolNumber] + "School";
    //   const newSchool = new School();
    //   newSchool.name = schoolName + " Name";
    //   newSchool.address = intCount + " Lane, Durham, NC";
    //   newSchool.latitude = intCount + 1;
    //   newSchool.longitude = intCount + 2;
    //   //TODO: Throw in some associated students / routes depending on what testing needs
    //   await schoolRepository.save(newSchool);
    // }


    // var intCount = 0;
    // for (var routeNumber in nameIter) {
    //   intCount = intCount + 1;
    //   const routeName = nameIter[routeNumber] + "Route";
    //   const newRoute = new Route();
    //   newRoute.name = routeName + " Name";
    //   newRoute.desciption = routeName + " Description";
    //   //TODO: Throw in some associated students / routes depending on what testing needs
    //   await routeRepository.save(newRoute);
    // }

    console.log(
      "Express server has started on port 3000. Open https://localhost:3000/api/users/all/page=0&size=0&sort=none&sortDir=none or: /students /routes /schools to see results"
    );
  })
  .catch((error) => console.log(error));

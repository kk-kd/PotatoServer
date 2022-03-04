import "reflect-metadata";
import app from "./app";
import { Connection, createConnection, getConnection } from "typeorm";
import * as express from "express";
import * as bodyParser from "body-parser";
import * as bcrypt from "bcryptjs";

import { Request, Response } from "express";
import { allRoutes } from "./routes/allRoutes";
import authRoutes from "./routes/authRoutes";
import { User } from "./entity/User";
import { UserController } from "./controller/UserController";
import { Student } from "./entity/Student";
import { StudentController } from "./controller/StudentController";
import { Route } from "./entity/Route";
import { RouteController } from "./controller/RouteController";

import { Stop } from "./entity/Stop";
import { StopController } from "./controller/StopController";

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

    // Instantiate all table entity controller

    // const stopRepository = connection.getCustomRepository(StopController);
    // const userRepository = connection.getCustomRepository(UserController);
    // const studentRepository = connection.getCustomRepository(StudentController);
    // const schoolRepository = connection.getCustomRepository(SchoolController);
    // const routeRepository = connection.getCustomRepository(RouteController);


    // Clean tables

    // stopRepository.query(`TRUNCATE ${"stops"} RESTART IDENTITY CASCADE;`);
    // userRepository.query(`TRUNCATE ${"users"} RESTART IDENTITY CASCADE;`);
    // studentRepository.query(`TRUNCATE ${"students"} RESTART IDENTITY CASCADE;`);
    // schoolRepository.query(`TRUNCATE ${"schools"} RESTART IDENTITY CASCADE;`)
    // routeRepository.query(`TRUNCATE ${"routes"} RESTART IDENTITY CASCADE;`);

    let firstNameIter: string[] = [
      "Melody",
      "Oswaldo",
      "Tony",
      "Marian",
      "Kevin",
      "Mark",
      "Adesh",
      "Varun",
      "Andrew",
      "Brandon",
    ];
    let firstNameIterStudents: string[] = [
      "Jessica",
      "Alfred",
      "Jack",
      "Doug",
      "John",
      "Ronan",
      "Jessica",
      "Bobby",
      "Bo",
      "Alvin",
    ];
    let middleNameIter: string[] = [
      "A",
      "B",
      "C",
      "D",
      "E",
      "F",
      "G",
      "H",
      "I",
      "J",
    ];
    let lastNameIter: string[] = [
      "Bowman",
      "Hinton",
      "Jensen",
      "Thompson",
      "Smith",
      "McDog",
      "seventh",
      "Porkloin",
      "Labbes",
      "McCaster",
    ];
    let addressIter: string[] = [
      "4500 Margalo Avenue, Bakersfield, CA 93313",
      "7800 River Mist Avenue, Bakersfield, CA 93313",
      "21950 Arnold Center Road, Carson, CA 90810",
      "10202 Vista Drive, Cupertino, CA 95014",
      "5397 Wentworth Avenue, Oakland, CA 94601",
      "2708 Mabel Street, Berkeley, CA 94702",
      "26466 Mockingbird Lane, Hayward, CA 94544",
      "26466 Mockingbird Lane, Hayward, CA 94544",
      "2443 Sierra Nevada Road, Mammoth Lakes, CA 93546",
      "3027 Badger Drive, Pleasanton, CA 94566",
    ];
    let emailIter: string[] = [
      "Bowman@example.com",
      "Hinton123@example.com",
      "Jensen4@example.com",
      "Thompson91238@example.com",
      "Smith2981@example.com",
      "McDog0808@example.com",
      "seventh8128379@example.com",
      "Porkloin12497@example.com",
      "Labbes50812@example.com",
      "McCaster981@example.com",
    ];


    // Add basic admin account

    /* 
    **********************************************************
    */

    // const newUser = new User();
    // newUser.email = "admin@example.com"
    // newUser.password = await bcrypt.hash("Admin123", 10);
    // newUser.firstName = "Ad";
    // newUser.middleName = "M";
    // newUser.lastName = "in";
    // newUser.address = "Funky Address";
    // newUser.latitude = 3.28459;
    // newUser.longitude = 171.72426;
    // newUser.role = "Admin";
    // await userRepository.save(newUser);

    // // Construct basic users and students.
    // for (let i = 0; i < firstNameIter.length; i++) {
    //   const newUser = new User();
    //   newUser.email = emailIter[i];
    //   newUser.firstName = firstNameIter[i];
    //   newUser.middleName = middleNameIter[i];
    //   newUser.lastName = lastNameIter[i];
    //   newUser.address = addressIter[i];
    //   // newUser.longitude = longitude;
    //   // newUser.latitude = count - 1;
    //   newUser.isAdmin = false;
    //   newUser.password = await bcrypt.hash("parentPassWRD9184123", 10);

    //   // Construct Student Entity
    //   const newStudent = new Student();
    //   var myNum = i + 2;
    //   newStudent.id = "" + myNum;
    //   newStudent.firstName = firstNameIterStudents[i];
    //   newStudent.middleName = middleNameIter[i];
    //   newStudent.lastName = lastNameIter[i];
    //   newUser.students = [newStudent];

    // make routes
    // const routeName = "Route " + i;
    // const newRoute = new Route();
    // newRoute.name = routeName + " Name";
    // newRoute.desciption = routeName + " Description";
    // newRoute.
    // if (i == 1 || i == 2 || i == 3) {
    // }
    // else {
    //   newRoute.students = [newStudent];
    // }

    // await connection.manager.save(newUser);
    // await connection.manager.save(newRoute);

    // }


    /* 
    **********************************************************
    */


    // Construct School Entities

    // const schoolName = nameIter[userNumber] + "School";
    // const newSchool = new School();
    // newSchool.name = schoolName + " Name";
    // newSchool.address = intCount + " Lane, Durham, NC";
    // newSchool.latitude = intCount + 1;
    // newSchool.longitude = intCount + 2;
    // // newSchool.routes = [newRoute];
    // newSchool.students = [newStudent];

    // Save the entries to the Databse
    // await connection.manager.save(newRoute);
    // await connection.manager.save(newSchool);

    //   // await userRepository.save(newUser);
    //   // await studentRepository.save(newStudent);
    // }

    //   // await userRepository.save(newUser);
    //   // await studentRepository.save(newStudent);
    // }

    // // connection.manager.createQueryBuilder()
    // // .leftJoinAndSelect("t.customer", "customer")
    // // .leftJoinAndSelect(/* other joins */)
    // // .where(/* custom where */)
    // // .getOne();

    // // var intCount = 0;
    // // intCount = intCount + 1;

    // // for (var studentNumber in nameIter) {
    // //   const studentName = nameIter[studentNumber] + "Student";
    // //   await connection.manager.save(
    // //     connection.manager.create(Student, {
    // //       id: intCount,
    // //       firstName: studentName + "FirstName",
    // //       lastName: studentName + "LastName",
    // //       middleName: studentName + "MiddleName",
    // //     })
    // //   );
    // //   //TODO: throw in some links to routes, schools, and parents for test students
    // // }

    // // var intCount = 0;
    // // for (var schoolNumber in nameIter) {
    // //   intCount = intCount + 1;
    // //   const schoolName = nameIter[schoolNumber] + "School";
    // //   const newSchool = new School();
    // //   newSchool.name = schoolName + " Name";
    // //   newSchool.address = intCount + " Lane, Durham, NC";
    // //   newSchool.latitude = intCount + 1;
    // //   newSchool.longitude = intCount + 2;
    // //   //TODO: Throw in some associated students / routes depending on what testing needs
    // //   await schoolRepository.save(newSchool);
    // // }

    // // var intCount = 0;
    // // for (var routeNumber in nameIter) {
    // //   intCount = intCount + 1;
    // //   const routeName = nameIter[routeNumber] + "Route";
    // //   const newRoute = new Route();
    // //   newRoute.name = routeName + " Name";
    // //   newRoute.desciption = routeName + " Description";
    // //   //TODO: Throw in some associated students / routes depending on what testing needs
    // //   await routeRepository.save(newRoute);
    // // }

    console.log(
      "Express server has started on port 3000. Open https://localhost:3000/api/users/all/page=0&size=0&sort=none&sortDir=none or: /students /routes /schools to see results"
    );
  })
  .catch((error) => console.log(error));

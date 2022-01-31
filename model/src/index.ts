import "reflect-metadata";
import app from "./app";
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

// function makeid(length) {
//   var result = "";
//   var characters =
//     "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
//   var charactersLength = characters.length;
//   for (var i = 0; i < length; i++) {
//     result += characters.charAt(Math.floor(Math.random() * charactersLength));
//   }
//   return result;
// }

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

    console.log(
      "Express server has started on port 3000. Open https://localhost:3000/api/users/all/page=0&size=0&sort=none&sortDir=none or: /students /routes /schools to see results"
    );
  })
  .catch((error) => console.log(error));

import "reflect-metadata";
import { createConnection } from "typeorm";
import * as express from "express";
import * as bodyParser from "body-parser";
import { Request, Response } from "express";
import { userRoutes } from "./routes/userRoutes";
import authRoutes from "./routes/authRoutes";

// Test
const https_port = 3000;
const http_port = 2999;
const privateKeyAddr = __dirname + "/../../../cert/server.key";
const certificateAddr = __dirname + "/../../../cert/server.cert";

// const https_port = 443;
// const http_port = 80;
// const privateKeyAddr =
//   "/etc/letsencrypt/live/vcm-23920.vm.duke.edu/privkey.pem";
// const certificateAddr = "/etc/letsencrypt/live/vcm-23920.vm.duke.edu/cert.pem";
// const chainAddr = "/etc/letsencrypt/live/vcm-23920.vm.duke.edu/chain.pem";

var fs = require("fs");
var privateKey = fs.readFileSync(privateKeyAddr, "utf8");
var certificate = fs.readFileSync(certificateAddr, "utf8");
// var chain = fs.readFileSync(chainAddr, "utf8");
// var credentials = { key: privateKey, ca: chain, cert: certificate };
var credentials = { key: privateKey, cert: certificate };

createConnection()
  .then(async (connection) => {
    // create express app
    const app = express();
    app.use(bodyParser.json());

    app.use("/api", authRoutes);

    // register all express routes from defined application routes
    userRoutes.forEach((route) => {
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
    httpsServer.listen(https_port, () => {
      console.log(`Example app listening at https://localhost:${https_port}`);
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
      .listen(http_port);

    // temporary testings
    // const userRepository = connection.getCustomRepository(UserController);
    // const newUser = new User();
    // newUser.email = "test2user@email.com";
    // newUser.firstName = "test2 First Name";
    // newUser.middleName = "test2 Middle Name";
    // newUser.lastName = "test2 Last Name";
    // newUser.address = "test2 example address";
    // newUser.longitude = 101.1;
    // newUser.latitude = 102.1;
    // newUser.isAdmin = true;
    // await userRepository.save(newUser);

    // Find the person we just saved to the database using the custom query
    // method we wrote in the person repository.
    // const existingUser = await userRepository.findByUserName(
    //   "test2 First Name"
    // );
    // if (!existingUser) {
    //   throw Error("Unable to find test2 User entry.");
    // } else {
    //   await userRepository.updateUserName(
    //     existingUser.uid,
    //     "Test 2 New First Name",
    //     "Test 2 New Middle Name",
    //     "Test 2 New Last Name"
    //   );
    // }

    // // insert new users for test
    // await connection.manager.save(
    //   connection.manager.create(User, {
    //     email: "jdm109@duk.edu",
    //     firstName: "Jackson",
    //     lastName: "McNabb",
    //     address: "102 Example Lane",
    //     longitude: 32.5,
    //     latitude: 432.54,
    //     isAdmin: false,
    //   })
    // );

    // console.log(
    //   "Express server has started on port 3000. Open http://localhost:3000/users to see results"
    // );
  })
  .catch((error) => console.log(error));

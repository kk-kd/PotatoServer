import { createConnection, getConnection, getRepository } from "typeorm";
import axios from "axios";
import app from "../src/index";
import { User } from "../src/entity/User";

let chai = require("chai");
let chaiHttp = require("chai-http");
let should = chai.should();
chai.use(chaiHttp);
var expect = chai.expect;
// require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` });

// beforeAll(async () => {
//   if (process.env.NODE_ENV != "test") {
//     console.log("NODE_ENV not test.");
//     expect(true).toBe(false);
//     return;
//   }

//   // await createConnection();
//   // getRepository(User).createQueryBuilder().softDelete();
//   });

//   // var fs = require("fs");
//   // const privateKey = fs.readFileSync(
//   //   __dirname + process.env.CERTIFICATE_KEY_PATH,
//   //   "utf8"
//   // );
//   // const certificate = fs.readFileSync(
//   //   __dirname + process.env.CERTIFICATE_SERVER_PATH,
//   //   "utf8"
//   // );
//   // const credentials = { key: privateKey, cert: certificate };

//   // var https = require("https");
//   // var httpsServer = https.createServer(credentials, app);
//   // httpsServer.listen(process.env.HTTPS_PORT, () => {
//   //   console.log(
//   //     `Test Begins. App listening at https://localhost:${process.env.HTTPS_PORT}`
//   //   );
//   // });

// afterAll(async () => {
//   // getRepository(User).createQueryBuilder().restore();
//   // await getConnection().close();
// });

// describe("Test AuthController", () => {
//   it("Register an admin", async () => {
//     const result = await axios.post("/api/register", {
//       email: "admin1@example.com",
//       firstName: "Admin",
//       lastName: "Example",
//       isAdmin: true,
//       password: "Admin123",
//     }).then((result) => {
//       expect(result.status).toBe(201);
//       expect(result.data).toBe("User Register: User created");})
//   });
// });

describe("AuthController API calls", () => {
  it("Cannot register a user whose email is already present", async () => {
    let userInfo = {
      email: "admin1@example.com",
      firstName: "Admin",
      lastName: "Example",
      isAdmin: "true",
      password: "Admin123",
    };

    chai
      .request("https://potato-beta.colab.duke.edu")
      .post("/api/register")
      .set("content-type", "application/json")
      .send(userInfo)
      .end((err, res) => {
        expect(res).to.have.status(401);
      });
  });
});

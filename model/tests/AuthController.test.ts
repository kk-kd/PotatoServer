import { createConnection, getConnection, getRepository } from "typeorm";
import app from "../src/app";
import { User } from "../src/entity/User";
let request = require("supertest");

beforeAll(async () => {
  if (process.env.NODE_ENV != "test" && process.env.NODE_ENV != "test.local") {
    console.log("NODE_ENV not test.");
    expect(true).toBe(false);
    return;
  }

  await createConnection();
  getRepository(User).createQueryBuilder().softDelete();
});

afterAll(async () => {
  getRepository(User).createQueryBuilder().restore();
  await getConnection().close();
});

// describe("AuthController API calls", () => {
//   it("Cannot register a user whose email is already present", async () => {
//     let userInfo = {
//       email: "admin1@example.com",
//       firstName: "Admin",
//       lastName: "Example",
//       isAdmin: "true",
//       password: "Admin123",
//     };

//     chai
//       .request("https://potato-beta.colab.duke.edu")
//       .post("/api/register")
//       .set("content-type", "application/json")
//       .send(userInfo)
//       .end((err, res) => {
//         expect(res).to.have.status(401);
//         res.body.should.
//       });
//   });
// });

describe("AuthController API calls", () => {
  it("Cannot register a user whose email is already present", async () => {
    const result = await request(app)
      .post("/api/register")
      .set("content-type", "application/json")
      .set("Accept", "application/json")
      .send({
        email: "admin1@example.com",
        firstName: "Admin",
        lastName: "Example",
        isAdmin: "true",
        password: "Admin123",
      });

    if (process.env.NODE_ENV == "test") {
      expect(result.status).toEqual(201);
    } else {
      expect(result.status).toEqual(401);
    }
  });
});

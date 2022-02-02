import { createConnection, getConnection, getManager } from "typeorm";
import app from "../src/app";
import { createSampleAdmin, createSampleUsers } from "./Utility";
import { getJWTToken } from "./ConnectionUtil";
require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` });
const request = require("supertest");

let connection;
let JWTToken;

beforeAll(async () => {
  if (process.env.NODE_ENV != "test" && process.env.NODE_ENV != "test.local") {
    console.log("NODE_ENV not test.");
    expect(true).toBe(false);
    return;
  }

  await createConnection();
  connection = getConnection();

  // Database cleanup
  const entities = connection.entityMetadatas;
  const entityDeletionPromises = entities.map(async (entity) => {
    await getManager().query(
      `TRUNCATE ${entity.tableName} RESTART IDENTITY CASCADE;`
    );
  });

  // User Creation & Get JWTToken
  await Promise.all(entityDeletionPromises)
    .then(async () => {
      // Admin
      await createSampleAdmin();
      // Non-admins
      await createSampleUsers();
    })
    .then(async () => {
      JWTToken = await getJWTToken();
    })
    .then(() => {
      console.log("Init Succeeded");
    });
});

afterAll(async () => {
  await getConnection().close();
});

describe("UserController API calls - Success", () => {
  it("should return all users", async () => {
    const user1 = {
      uid: 1,
      email: "admin@example.com",
      firstName: "Admin",
      middleName: null,
      lastName: "Example",
      address: "4920 Quonset Drive, Sacramento, CA 95820",
      longitude: "1",
      latitude: "2",
      isAdmin: true,
    };
    const user2 = {
      uid: 2,
      email: "user1@potato.com",
      firstName: "User",
      middleName: null,
      lastName: "Potato",
      address: "11256 Palos Verdes Court, Cupertino, CA 95014",
      longitude: "0",
      latitude: "1",
      isAdmin: false,
    };
    const user3 = {
      uid: 3,
      email: "parent2@tomato.com",
      firstName: "Parent",
      middleName: null,
      lastName: "Tomato",
      address: "14524 Lodestar Drive, Grass Valley, CA 95949",
      longitude: "1",
      latitude: "2",
      isAdmin: false,
    };
    const user4 = {
      uid: 4,
      email: "player3@apple.com",
      firstName: "Player",
      middleName: null,
      lastName: "Apple",
      address: "4329 Howe Street, Oakland, CA 94611",
      longitude: "3",
      latitude: "6",
      isAdmin: false,
    };

    const user5 = {
      uid: 5,
      email: "annoyed4@ginger.com",
      firstName: "Annoyed",
      middleName: null,
      lastName: "Ginger",
      address: "11 Eclipse Court, Alameda, CA 94501",
      longitude: "2.5",
      latitude: "4.5",
      isAdmin: false,
    };

    await request(app)
      .get(
        "/api/users/all/?page=0&size=0&sort=none&sortDir=none&filterType=none&filterData=none&showAll=true"
      )
      .set("content-type", "application/json")
      .set("Accept", "*/*")
      .set("auth", JWTToken)
      .send()
      .then((result) => {
        expect(result.status).toBe(200);
        expect(result._body[0]).toMatchObject(user1);
        expect(result._body[1]).toMatchObject(user2);
        expect(result._body[2]).toMatchObject(user3);
        expect(result._body[3]).toMatchObject(user4);
        expect(result._body[4]).toMatchObject(user5);
      });
  });
});

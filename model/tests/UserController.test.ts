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
    await request(app)
      .get("/api/users/all/")
      .set("content-type", "application/json")
      .set("Accept", "*/*")
      .set("auth", JWTToken)
      .send({
        page: 1,
        size: 1,
        sort: "none",
        sortDir: "none",
      })
      .then((result) => {
        console.log(result);
        expect(result.status).toBe(200);
      });
  });
});

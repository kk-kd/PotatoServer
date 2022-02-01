import { createConnection, getConnection, getRepository } from "typeorm";
import app from "../src/app";
import { User } from "../src/entity/User";
const request = require("supertest");

let connection;
beforeAll(async () => {
  if (process.env.NODE_ENV != "test" && process.env.NODE_ENV != "test.local") {
    console.log("NODE_ENV not test.");
    expect(true).toBe(false);
    return;
  }

  await createConnection();
  connection = getConnection();
  const entities = connection.entityMetadatas;
  entities.forEach(async (entity) => {
    const repository = connection.getRepository(entity.name);
    await repository.query(
      `TRUNCATE ${entity.tableName} RESTART IDENTITY CASCADE;`
    );
  });

  console.log("Init Succeed");
});

afterAll(async () => {
  await getConnection().close();
});

describe("AuthController API calls - Success", () => {
  it("should successful register a user", async () => {
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

    expect(result.status).toEqual(201);
    expect(result.text).toBe("User Register: User created");
  });

  it("should create an non-admin user AdminExample", async () => {
    const newUser = await getRepository(User)
      .createQueryBuilder("users")
      .where("users.email = :email", { email: "admin1@example.com" })
      .getOneOrFail();

    expect(newUser.isAdmin).toBe(false);
    expect(newUser.firstName).toBe("Admin");
    expect(newUser.lastName).toBe("Example");
  });

  it("should not create two users with the same email", async () => {
    const result = await request(app)
      .post("/api/register")
      .set("content-type", "application/json")
      .set("Accept", "application/json")
      .send({
        email: "admin1@example.com",
        firstName: "Admin2",
        lastName: "Example2",
        isAdmin: "true",
        password: "Admin123",
      });

    expect(result.status).toEqual(401);
  });
});

describe("AuthController API calls - Fail", () => {
  it("should reject invalid email", async () => {
    const result = await request(app)
      .post("/api/register")
      .set("content-type", "application/json")
      .set("Accept", "application/json")
      .send({
        email: "hehe.notcorrect.email",
        firstName: "Admin",
        lastName: "Example",
        isAdmin: "true",
        password: "Admin123",
      });

    expect(result.status).toEqual(401);
    expect(result.text).toBe("User Register: Email validation failed");
  });

  it("should reject weak password", async () => {
    const result = await request(app)
      .post("/api/register")
      .set("content-type", "application/json")
      .set("Accept", "application/json")
      .send({
        email: "admin1@example.com",
        firstName: "Admin",
        lastName: "Example",
        isAdmin: "true",
        password: "123456",
      });

    expect(result.status).toEqual(401);
    expect(result.text).toBe("User Register: Password validation failed");
  });
});

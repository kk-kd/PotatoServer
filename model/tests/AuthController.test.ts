import { createConnection, getConnection } from "typeorm";
import axios from "axios";
import app from "../src/index";

require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` });

beforeAll(async () => {
  if (process.env.NODE_ENV != "test") {
    console.log("NODE_ENV not test.");
    expect(true).toBe(false);
    return;
  }

  await createConnection();
  const entities = getConnection().entityMetadatas;
  entities.forEach(async (entity) => {
    getConnection()
      .getRepository(entity.name)
      .createQueryBuilder()
      .softDelete();
  });

  var fs = require("fs");
  const privateKey = fs.readFileSync(
    __dirname + process.env.CERTIFICATE_KEY_PATH,
    "utf8"
  );
  const certificate = fs.readFileSync(
    __dirname + process.env.CERTIFICATE_SERVER_PATH,
    "utf8"
  );
  const credentials = { key: privateKey, cert: certificate };

  var https = require("https");
  var httpsServer = https.createServer(credentials, app);
  httpsServer.listen(process.env.HTTPS_PORT, () => {
    console.log(
      `Test Begins. App listening at https://localhost:${process.env.HTTPS_PORT}`
    );
  });
});

afterAll(async () => {
  await getConnection().close();
  const entities = getConnection().entityMetadatas;
  entities.forEach(async (entity) => {
    getConnection().getRepository(entity.name).createQueryBuilder().restore();
  });
});

describe("Test AuthController", () => {
  it("Register an admin", async () => {
    const result = await axios.post(domain + "/api/register", {
      email: "admin@example.com",
      firstName: "Admin",
      lastName: "Example",
      isAdmin: true,
      password: "Admin123",
    });

    expect(result.status).toBe(201);
    expect(result.data).toBe("User Register: User created");
  });
});

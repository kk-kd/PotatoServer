// const request = require("supertest");
// const app = require("../index");

import testcConnection from "./ connection";

// describe("GET /", () => {
//   it("responds with Hello World!", (done) => {
//     request(app).get("/").expect("Hello World!", done);
//   });
// });

describe("User Test", () => {
  beforeAll(async () => {
    await testcConnection.create();
  });
});

afterAll(async () => {
  await testcConnection.close();
});

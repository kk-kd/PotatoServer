//Require the dev-dependencies
let chai = require("chai");
let chaiHttp = require("chai-http");
let should = chai.should();
let server = require("../src/index.ts");

chai.use(chaiHttp);
describe("User Registraion", () => {
  it("It should register a user with email-abc123@gmail.com, password-12345678Cc", (done) => {
    const newUser = {
      email: "abc123@gmail.com",
      firstName: "abc",
      lastName: "123",
      isAdmin: false,
      password: "12345678Cc",
    };

    chai
      .request(server)
      .post("/api/register")
      .set("Accept", "application/json")
      .send(newUser)
      .end((err, res) => {
        expect(res.status).to.equal(201);
        expect(res.body.data).to.include;
      });
  });
});

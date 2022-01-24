//Require the dev-dependencies
process.env.NODE_ENV = 'test'
import {getConnection} from "typeorm";
import { User } from "../build/entity/User.js";

let chai = require("chai");
let chaiHttp = require("chai-http");
let should = chai.should();
let server = require("../build/index.js");

chai.use(chaiHttp);

describe('Clean up users', () => {
  beforeEach((done) => {
    await.getConnection()
    .getRepository(User)
    .softDelete()
    
  }).catch(error => console.log(error));
})  

describe('Restore users', () => {
  afterEach((done) => {
    await.getConnection()
    .getRepository(User)
    .restore()
    
  }).catch(error => console.log(error));
})  


describe("POST /register", () => {
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
        res.should.have.status(201);
        res.body.should.have
          .property("message")
          .equal("User Register: User created");
        done();
      });
  });
});

import { response } from "express";
import app from "../src/app";
const request = require("supertest");

export async function getJWTToken() {
  return request(app)
    .post("/api/login")
    .set("content-type", "application/json")
    .set("Accept", "application/json")
    .send({
      email: "admin@example.com",
      password: "Admin123",
    })
    .then((response) => {
      return response.text;
    });
}

import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";

export const checkJwt = (req: Request, res: Response, next: NextFunction) => {
  //Get the jwt token from the head
  const token = <string>req.headers["auth"];
  let jwtPayload;

  var fs = require("fs");
  var privateKey = fs.readFileSync("../secrets/jwt_private.key");

  //Try to validate the token and get data
  try {
    jwtPayload = <any>jwt.verify(token, privateKey);
    res.locals.jwtPayload = jwtPayload;
  } catch (error) {
    //If token is not valid, respond with 401 (unauthorized)
    res.status(401).send("checkJwt: token invalide");
    return;
  }

  var signOptions = {
    issuer: "Potato",
    subject: jwtPayload.email,
    audience: "potato.colab.duke.edu",
    expiresIn: "6h",
    algorithm: "RS256",
  };

  const newToken = jwt.sign(jwtPayload, privateKey, signOptions);
  res.setHeader("token", newToken);

  next();
};

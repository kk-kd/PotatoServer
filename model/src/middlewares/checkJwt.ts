import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";

export const checkJwt = (req: Request, res: Response, next: NextFunction) => {
  //Get the jwt token from the head
  const token = <string>req.headers["auth"];
  let jwtPayload;

  var fs = require("fs");
  var privateKey = fs.readFileSync(
    __dirname + "/../../secrets/jwt_private.key"
  );
  var publicKey = fs.readFileSync(__dirname + "/../../secrets/jwt_public.key");

  //Try to validate the token and get data
  try {
    jwtPayload = <any>jwt.verify(token, publicKey);
    res.locals.jwtPayload = jwtPayload;
    console.log(jwtPayload);
  } catch (error) {
    console.log(res);
    res.status(401).send("checkJwt: token invalid");
    return;
  }

  var signOptions = {
    algorithm: "RS256",
  };

  const newToken = jwt.sign(jwtPayload, privateKey, signOptions);
  res.setHeader("token", newToken);

  next();
};

import { EntityRepository, Repository, getRepository } from "typeorm";
import { NextFunction, Request, Response } from "express";
import { User } from "../entity/User";
import * as jwt from "jsonwebtoken";

@EntityRepository(User)
export class AuthController extends Repository<User> {
  private userRepository = getRepository(User);

  async login(request: Request, response: Response, next: NextFunction) {
    //Check if username and password are set
    let { email, password } = request.body;
    if (!(email && password)) {
      response.status(400).send("User Login: Email or password missing");
    }

    let user: User;
    try {
      user = await this.userRepository.findOneOrFail({ where: { email } });
    } catch (error) {
      response.status(401).send("User Login: User not registered");
    }

    if (!user.checkIfUnencryptedPasswordIsValid(password)) {
      response.status(401).send("User Login: Incorrect password");
      return;
    }

    var fs = require("fs");
    var privateKey = fs.readFileSync("../secrets/jwt_private.key");
    var payload = {
      uid: user.uid,
      email: user.password,
      isAdmin: user.isAdmin,
    };
    var signOptions = {
      issuer: "Potato",
      subject: user.email,
      audience: "potato.colab.duke.edu",
      expiresIn: "6h",
      algorithm: "RS256",
    };

    const token = jwt.sign(payload, privateKey, signOptions);
    response.send(token);
  }
}

import { EntityRepository, Repository, getRepository } from "typeorm";
import { NextFunction, Request, Response } from "express";
import { User } from "../entity/User";
import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcryptjs";
import * as EmailValidator from "email-validator";

var passwordValidator = require("password-validator");
var schema = new passwordValidator();
schema
  .is()
  .min(8) // Minimum length 8
  .is()
  .max(64) // Maximum length 100
  .has()
  .uppercase() // Must have uppercase letters
  .has()
  .lowercase() // Must have lowercase letters
  .has()
  .digits(2) // Must have at least 2 digits
  .has()
  .not()
  .spaces(); // Should not have spaces

class AuthController {
  static register = async (request: Request, response: Response) => {
    let { email, firstName, middleName, lastName, address, longitude, latitude, password, isAdmin } = request.body;
    if (!(email && password && firstName && lastName && isAdmin != null)) {
      response
        .status(401)
        .send("User Register: email/password/isAdmin/firstName/lastName is not provided.");
      return;
    }

    if (!EmailValidator.validate(email)) {
      response.status(401).send("User Register: Email validation failed");
      return;
    }

    if (!schema.validate(password)) {
      response.status(401).send("User Register: Password validation failed");
      return;
    }

    let user = new User();
    const userRepository = getRepository(User);
    try {
      user.password = await bcrypt.hash(password, 10);
      user.email = email;
      user.firstName = firstName;
      user.middleName = middleName;
      user.lastName = lastName;
      user.address = address;
      user.longitude = longitude;
      user.latitude = latitude;
      user.isAdmin = isAdmin;
      await userRepository.save(user);
    } catch (error) {
      response.status(401).send("User Register: " + error);
      return;
    }

    response.status(201).send("User Register: User created");
  };

  static login = async (request: Request, response: Response) => {
    //Check if username and password are set
    let { email, password } = request.body;
    if (!(email && password)) {
      response.status(400).send("User Login: Email or password missing");
      return;
    }

    if (!EmailValidator.validate(email)) {
      response.status(401).send("User Login: Email validation failed");
      return;
    }

    if (!schema.validate(password)) {
      response.status(401).send("User Login: Password validation failed");
      return;
    }

    const userRepository = getRepository(User);
    let user: User;
    try {
      user = await userRepository.findOneOrFail({ where: { email } });
    } catch (error) {
      response.status(401).send("User Login: User not registered");
      return;
    }

    if (!(await bcrypt.compare(password, user.password))) {
      response.status(401).send("User Login: Incorrect password");
      return;
    }

    var fs = require("fs");
    var privateKey = fs.readFileSync(__dirname + "../secrets/jwt_private.key");
    var payload = {
      uid: user.uid,
      email: user.email,
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
  };

  static changePassword = async (request: Request, response: Response) => {
    const id = response.locals.jwtPayload.uid;

    const { oldPassword, newPassword } = request.body;
    if (!(oldPassword && newPassword)) {
      response
        .status(400)
        .send("User Password Change: old or new password missing");

      return;
    }

    if (!schema.validate(oldPassword)) {
      response.status(401).send("User Login: Old Password validation failed");
      return;
    }

    if (!schema.validate(newPassword)) {
      response.status(401).send("User Login: New Password validation failed");
      return;
    }

    const userRepository = getRepository(User);
    let user: User;
    try {
      user = await userRepository.findOneOrFail(id);
    } catch (id) {
      response
        .status(401)
        .send(
          "User Paasword Change: You know what? This session doesn't belong to u. Checkmate."
        );
    }

    //Check if old password matchs
    if (!(await bcrypt.compare(oldPassword, user.password))) {
      response.status(401).send("User Password Change: Incorrect Old Password");
      return;
    }

    try {
      user.password = await bcrypt.hash(newPassword, 10);
      await userRepository.save(user);
    } catch (error) {
      response.status(401).send("User Password Change: " + error);
    }

    response.status(204).send("User Password Change: Success");
  };
}
export default AuthController;

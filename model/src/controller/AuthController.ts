import { getRepository } from "typeorm";
import { Request, Response } from "express";
import { User } from "../entity/User";
import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcryptjs";
import * as EmailValidator from "email-validator";
import { publishMessage } from "../mailer/emailWorker";

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
var fs = require("fs");

class AuthController {
  static register = async (request: Request, response: Response) => {
    let {
      email,
      firstName,
      middleName,
      lastName,
      address,
      longitude,
      latitude,
      isAdmin,
    } = request.body;
    if (!(email && firstName && lastName && isAdmin != null)) {
      response
        .status(401)
        .send(
          "User Register: email/isAdmin/firstName/lastName is not provided."
        );
      return;
    }

    if (!EmailValidator.validate(email)) {
      response.status(401).send("User Register: Please enter a valid email.");
      return;
    }

    const reptitiveEntry = await getRepository(User)
      .createQueryBuilder("users")
      .select()
      .where("users.email = :email", { email: email })
      .getOne();

    console.log(reptitiveEntry);

    if (reptitiveEntry != null) {
      response.status(401).send("Email is already taken.");
      return;
    }

    let user = new User();
    const userRepository = getRepository(User);
    user.email = email.toLowerCase();
    user.password = null;
    user.firstName = firstName;
    user.middleName = middleName;
    user.lastName = lastName;
    user.address = address;
    user.longitude = longitude;
    user.latitude = latitude;
    user.isAdmin = isAdmin;

    try {
      await userRepository.save(user);
    } catch (error) {
      response.status(401).send("User Register: " + error);
      return;
    }
    var payload = {
      uid: user.uid,
      email: user.email,
      isAdmin: user.isAdmin,
    };
    var signOptions = {
      issuer: "Potato",
      subject: user.email,
      audience: "potato.colab.duke.edu",
      expiresIn: "14 days",
      algorithm: "RS256",
    };

    let privateKey = fs.readFileSync(
      __dirname + "/../../secrets/jwt_private.key"
    );
    const token = jwt.sign(payload, privateKey, signOptions);
    user.confirmationCode = await bcrypt.hash(token, 10);
    const link = `${process.env.BASE_URL}/PasswordReset/${token}`;

    try {
      const saved = await userRepository.save(user);
      console.log(saved);
    } catch (error) {
      response.status(401).send("User Register: " + error);
      return;
    }

    try {
      await publishMessage({
        from: "Potato Web Service",
        subject: "[Potato] Please set your password",
        html:
          `<div>Your school admin just made you an account! Please set your password <a href=${link}>here.</a></div><br>` +
          `<div>If the above link does not work, copy and paste the URL below into your browser:<br>${link}</div>`,
        to: user.email,
      });
    } catch (error) {
      response
        .status(401)
        .send("Error sending confirmation email. Please try again.");
      return;
    }

    response.status(201).send(`${user.uid}`);
  };

  static generatePasswordResetLink = async (
    request: Request,
    response: Response
  ) => {
    let { email } = request.body;
    let user;
    try {
      user = await getRepository(User)
        .createQueryBuilder("users")
        .select()
        .where("users.email = :email", { email: email })
        .getOneOrFail();
    } catch (error) {
      response
        .status(401)
        .send(
          "The user has not been registered. Please contact an admin to get registered."
        );
      return;
    }

    var payload = {
      uid: user.uid,
      email: user.email,
      isAdmin: user.isAdmin,
    };
    var signOptions = {
      issuer: "Potato",
      subject: user.email,
      audience: "potato.colab.duke.edu",
      expiresIn: "2h",
      algorithm: "RS256",
    };

    let privateKey = fs.readFileSync(
      __dirname + "/../../secrets/jwt_private.key"
    );

    const token = jwt.sign(payload, privateKey, signOptions);
    user.confirmationCode = await bcrypt.hash(token, 10);
    const link = `${process.env.BASE_URL}/PasswordReset/${token}`;

    try {
      await publishMessage({
        from: "Potato Web Service",
        subject: "[Potato] Please reset your password",
        html:
          `<div> We heard that you lost your password. Please reset your password <a href=${link}>here.</a></div><br>` +
          `<div>If the above link does not work, copy and paste the URL below into your browser:<br>${link}</div>`,
        to: user.email,
      });
    } catch (error) {
      response
        .status(401)
        .send("Error sending confirmation email. Please try again.");
    }

    try {
      await getRepository(User).save(user);
    } catch (error) {
      response.status(401).send("Failed to save user to database: " + error);
      return;
    }

    response.status(200).send("Check your mailbox to reset password.");
  };

  static login = async (request: Request, response: Response) => {
    //Check if username and password are set
    let { email, password } = request.body;
    if (!(email && password)) {
      response
        .status(400)
        .send(
          "User Login: Email or password missing. Please fill in all fields."
        );
      return;
    }

    if (!EmailValidator.validate(email)) {
      response
        .status(401)
        .send(
          "User Login: Email validation failed. Please enter a valid email."
        );
      return;
    }

    if (!schema.validate(password)) {
      response
        .status(401)
        .send(
          "User Login: Password validation failed. Please enter a password with at 6 least characters (with at least 1 lowercase and 1 uppercase letter) and 2 numbers."
        );
      return;
    }

    const userRepository = getRepository(User);
    let user: User;
    const emailLower = email.toLowerCase();
    try {
      user = await userRepository.findOneOrFail({
        where: { email: emailLower },
      });
    } catch (error) {
      response.status(401).send("User Login: User not registered.");
      return;
    }

    if (user.password == null) {
      response
        .status(401)
        .send("Please verify your account and set a password");
      return;
    }

    if (!(await bcrypt.compare(password, user.password))) {
      response.status(401).send("User Login: Incorrect password.");
      return;
    }
    var payload = {
      uid: user.uid,
      email: user.email,
      isAdmin: user.isAdmin,
    };
    var signOptions = {
      issuer: "Potato",
      subject: user.email,
      audience: "potato.colab.duke.edu",
      expiresIn: "2h",
      algorithm: "RS256",
    };

    let privateKey = fs.readFileSync(
      __dirname + "/../../secrets/jwt_private.key"
    );
    const token = jwt.sign(payload, privateKey, signOptions);
    response.status(200).send(token);
  };

  static resetPassword = async (request: Request, response: Response) => {
    const { token, newPassword } = request.body;
    if (!(token && newPassword)) {
      response.status(400).send("Missing JWT or password.");
      return;
    }

    var publicKey = fs.readFileSync(
      __dirname + "/../../secrets/jwt_public.key"
    );
    let jwtPayload;
    try {
      jwtPayload = <any>jwt.verify(token, publicKey);
    } catch (error) {
      response
        .status(401)
        .send(
          "This is not a valid password reset link or the link has expired."
        );
    }

    if (!schema.validate(newPassword)) {
      response
        .status(401)
        .send(
          "Please enter a password with at 6 least characters (with at least 1 lowercase and 1 uppercase letter) and 2 numbers."
        );
      return;
    }

    let user;
    try {
      user = await getRepository(User)
        .createQueryBuilder("users")
        .select()
        .where("users.uid = :uid", { uid: jwtPayload.uid })
        .getOneOrFail();
    } catch (error) {
      response.status(401).send(error);
      return;
    }

    if (user.confirmationCode == null) {
      response
        .status(401)
        .send(
          "This is not a valid password reset link or the link has expired."
        );
      return;
    }

    if (!(await bcrypt.compare(token, user.confirmationCode))) {
      response.status(401).send("Incorrect JWT.");
      return;
    }

    try {
      user.password = await bcrypt.hash(newPassword, 10);
      user.confirmationCode = null;
      await getRepository(User).save(user);
    } catch (error) {
      response.status(401).send("Error saving user password: " + error);
    }

    response.status(200).send("Successfully set user password.");
    return;
  };

  static changePassword = async (request: Request, response: Response) => {
    const id = response.locals.jwtPayload.uid;
    console.log(id);

    const { oldPassword, newPassword } = request.body;
    if (!(oldPassword && newPassword)) {
      response
        .status(400)
        .send("User Password Change: old or new password missing.");

      return;
    }
    if (!schema.validate(newPassword)) {
      response
        .status(401)
        .send(
          "User Login: New Password validation failed. Please enter a password with at 6 least characters (with at least 1 lowercase and 1 uppercase letter) and 2 numbers."
        );
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
      const B = await userRepository.save(user);
    } catch (error) {
      response.status(401).send("User Password Change: " + error);
    }

    response.status(204).send("User Password Change: Success");
    return;
  };
}
export default AuthController;

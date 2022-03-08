import { Request, Response } from "express";
import * as EmailValidator from "email-validator";
import { getRepository } from "typeorm";
import { User } from "../entity/User";
// import PQueue from "p-queue";
import { getLngLat } from "./GeoHelper";

/**
 * Validation error codes:
 * 0 - success
 * 1 - no email or invalid email
 * 2 - no name
 * 3 - email existed in the database
 * 4 - repetitive emails in request
 * 5 - Missing Address
 * 6 - Error while querying address
 * 7 - Missing Phone Number
 * 99 - Missing index
 */

/**
 * request: {users: [
 * {
 * index: ...,
 * email: ...,
 * name:  ...,
 * address: ...,
 * phone_number: ... },
 * {},
 * ...]};
 *
 * return: {users: [
 * {
 * index: ...,
 * email: ...,
 * name:  ...,
 * address: ...,
 * phone_number: ...,
 * error_code: [..., ...],
 * hint_uids: [..., ...], <only with error code 3>
 * hint_indices: [..., ...], <only with error code 4> },
 * {},
 * ...]};
 */

// TODO: add phone number valiation once we have the requiremnt
// const q = new PQueue({ intervalCap: 40, interval: 1000 });

export class BulkController {
  static validateUsers = async (request: Request, response: Response) => {
    const { users } = request.body;
    if (users == null || !Array.isArray(users)) {
      response
        .status(401)
        .send("No users sent or users not sent in the accepted format.");
      return;
    }

    let locationPromises = [];
    let existingEmailsInRequest = new Set<string>();
    let reptitieEmailsInRequest = new Set<string>();
    let emailIdxPair = {};

    let returnedUsers = { users: [] };
    for (var user of users) {
      let userToReturn = { ...user };
      // 99 - Missing Index, early termination
      if (user.index == null || user.index == undefined) {
        (userToReturn["error_code"] ?? (userToReturn["error_code"] = [])).push(
          99
        );
        returnedUsers.users.push(userToReturn);
        continue;
      }
      // 1 - Email Validation
      if (
        user.email == null ||
        user.email == undefined ||
        !EmailValidator.validate(user.email)
      ) {
        (userToReturn["error_code"] ?? (userToReturn["error_code"] = [])).push(
          1
        );
      }

      // 2 - Name Validation
      if (
        user.name == null ||
        user.name == undefined ||
        user.name.trim() == ""
      ) {
        (userToReturn["error_code"] ?? (userToReturn["error_code"] = [])).push(
          2
        );
      }

      // 3 - Existing Emails
      const reptitiveEntry = await getRepository(User)
        .createQueryBuilder("users")
        .select()
        .where("users.email = :email", { email: user.email })
        .getOne();

      if (reptitiveEntry != null) {
        (userToReturn["error_code"] ?? (userToReturn["error_code"] = [])).push(
          3
        );
        userToReturn = { ...userToReturn, hint_uids: [reptitiveEntry.uid] };
      }

      // 4 - repetitive emails in the form, details added later
      (emailIdxPair[user.email] ?? (emailIdxPair[user.email] = [])).push(
        user.index
      );
      if (existingEmailsInRequest.has(user.email)) {
        reptitieEmailsInRequest.add(user.email);
      } else {
        existingEmailsInRequest.add(user.email);
      }

      // 5 - Missing Address
      if (
        user.address == null ||
        user.address == undefined ||
        user.address.trim() == ""
      ) {
        (userToReturn["error_code"] ?? (userToReturn["error_code"] = [])).push(
          5
        );
      }

      // 6 - Geo
      // await q.add(async () => {
      let loc;
      try {
        loc = await getLngLat(user.address);
        console.log(loc);
        userToReturn = { ...userToReturn, loc };
      } catch (error) {
        console.log(`${user.email} failed to fetch location, error - ${error}`);
        (userToReturn["error_code"] ?? (userToReturn["error_code"] = [])).push(
          6
        );
      }
      // });

      // 7 - Missing phone number
      if (
        user.phone_number == null ||
        user.phone_number == undefined ||
        user.phone_number.trim() == ""
      ) {
        (userToReturn["error_code"] ?? (userToReturn["error_code"] = [])).push(
          7
        );
      }

      // 0 - Success
      if (userToReturn["error_code"] == null) {
        userToReturn["error_code"] = [0];
      }
      returnedUsers.users.push(userToReturn);
    }

    response.status(200).send(returnedUsers);
  };
}

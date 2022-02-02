import { getConnection, getRepository } from "typeorm";
import { User } from "../src/entity/User";
import * as bcrypt from "bcryptjs";

export async function createUser(
  email: string,
  firstName: string,
  lastName: string,
  password: string,
  address: string,
  longitue: number,
  latitude: number,
  isAdmin: boolean
) {
  const user = new User();
  user.email = email;
  user.firstName = firstName;
  user.lastName = lastName;
  user.password = await bcrypt.hash(password, 10);
  user.isAdmin = isAdmin;
  user.address = address;
  user.longitude = longitue;
  user.latitude = latitude;
  await getConnection().manager.save(user);
}

export async function createSampleUsers() {
  await createUser(
    "user1@potato.com",
    "User",
    "Potato",
    "User123",
    "11256 Palos Verdes Court, Cupertino, CA 95014",
    0,
    1,
    false
  );
  await createUser(
    "parent2@tomato.com",
    "Parent",
    "Tomato",
    "Parent456",
    "14524 Lodestar Drive, Grass Valley, CA 95949",
    1,
    2,
    false
  );
  await createUser(
    "player3@apple.com",
    "Player",
    "Apple",
    "Player789",
    "4329 Howe Street, Oakland, CA 94611",
    3,
    6,
    false
  );
  await createUser(
    "annoyed4@ginger.com",
    "Annoyed",
    "Ginger",
    "321Annoyed",
    "11 Eclipse Court, Alameda, CA 94501",
    2.5,
    4.5,
    false
  );
  await createUser(
    "empty5@coffee.com",
    "Empty",
    "Coffee",
    "987Empty",
    "775 47th Street, Oakland, CA 94609",
    9,
    8,
    false
  );
}

export async function createSampleAdmin() {
  await createUser(
    "admin@example.com",
    "Admin",
    "Example",
    "Admin123",
    "4920 Quonset Drive, Sacramento, CA 95820",
    1,
    2,
    true
  );
}

import { getConnection, getRepository } from "typeorm";
import { User } from "../src/entity/User";
import * as bcrypt from "bcryptjs";

export async function createUser(
  email: string,
  firstName: string,
  lastName: string,
  password: string,
  isAdmin: boolean
) {
  const firstAdmin = new User();
  firstAdmin.email = email;
  firstAdmin.firstName = firstName;
  firstAdmin.lastName = lastName;
  firstAdmin.password = await bcrypt.hash(password, 10);
  firstAdmin.isAdmin = isAdmin;
  await getConnection().manager.save(firstAdmin);
}

export async function createSampleUsers() {
  await createUser("user1@potato.com", "User", "Potato", "User123", false);
  await createUser(
    "parent2@tomato.com",
    "Parent",
    "Tomato",
    "Parent456",
    false
  );
  await createUser("player3@apple.com", "Player", "Apple", "Player789", false);
  await createUser(
    "annoyed4@ginger.com",
    "Annoyed",
    "Ginger",
    "321Annoyed",
    false
  );
  await createUser("empty5@coffee.com", "Empty", "Coffee", "987Empty", false);
}

export async function createSampleAdmin() {
  await createUser("admin@example.com", "Admin", "Example", "Admin123", true);
}

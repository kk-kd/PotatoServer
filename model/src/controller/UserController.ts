import { EntityRepository, Repository, getRepository } from "typeorm";
import { NextFunction, Request, Response } from "express";
import { User } from "../entity/User";

@EntityRepository(User)
export class UserController extends Repository<User> {
  private userRepository = getRepository(User);

  async all(request: Request, response: Response, next: NextFunction) {
    return this.userRepository.find();
  }

  async one(request: Request, response: Response, next: NextFunction) {
    return this.userRepository.findOne(request.params.id);
  }

  async saveUser(request: Request, response: Response, next: NextFunction) {
    return this.userRepository.save(request.body);
  }

  async deleteUser(request: Request, response: Response, next: NextFunction) {
    let userToRemove = await this.userRepository.findOne(request.params.id);
    await this.userRepository.remove(userToRemove);
  }
  findByUserID(uid: number) {
    return this.createQueryBuilder("users")
      .where("users.uid = :uid", { uid })
      .getOne();
  }
  findByUserName(firstName: string) {
    return this.createQueryBuilder("users")
      .where("users.firstName = :firstName", { firstName })
      .getOne();
  }
  updateUserName(
    uid: number,
    firstName: string,
    middleName: string,
    lastName: string
  ) {
    return this.createQueryBuilder("users")
      .update()
      .set({ firstName: firstName, middleName: middleName, lastName: lastName })
      .where("users.uid = :uid", { uid })
      .execute();
  }

}

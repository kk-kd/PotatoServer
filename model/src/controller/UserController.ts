import { EntityRepository, Repository, getRepository, getConnection } from "typeorm";
import { NextFunction, Request, Response } from "express";
import { User } from "../entity/User";

@EntityRepository(User)
export class UserController extends Repository<User> {
  private userRepository = getRepository(User);

  async allUsers(request: Request, response: Response, next: NextFunction) {
    try {
      // let {test} = request.body;
      // const users = this.userRepository.find();
      // const numberOfUsersToSkip = pagesToSkip * pageSize;
      // PAGE STARTS AT 0
      const skipNum: number = +request.params.page;
      const takeNum: number = +request.params.size;
      var sortSpecification;
      var sortDirSpec;
      if (request.params.sort == 'none') {
        sortSpecification = "users.uid";
      }
      else { //should error check instead of else
        sortSpecification = "users." + request.params.sort;
      }
      if ((request.params.sortDir == 'none') || (request.params.sortDir == 'ASC')) {
        sortDirSpec = "ASC";
      }
      else { //error check instead of else
        sortDirSpec = "DESC";
      }
      const usersQueryResult = await this.userRepository.createQueryBuilder("users").skip(skipNum).take(takeNum).orderBy(sortSpecification, sortDirSpec).getMany();
      response.status(200);
      return usersQueryResult;
    }
    catch (e) {
      response.status(401).send("Users were not found with error: " + e);
      return;
    }
  }
  async filterAllUsers(request: Request, response: Response, next: NextFunction) {
    try {
      // let {test} = request.body;
      // const users = this.userRepository.find();
      // const numberOfUsersToSkip = pagesToSkip * pageSize;
      // PAGE STARTS AT 0
      const skipNum: number = +request.params.page;
      const takeNum: number = +request.params.size;
      var sortSpecification;
      var sortDirSpec;
      if (request.params.sort == 'none') {
        sortSpecification = "users.uid";
      }
      else { //should error check instead of else
        sortSpecification = "users." + request.params.sort;
      }
      if ((request.params.sortDir == 'none') || (request.params.sortDir == 'ASC')) {
        sortDirSpec = "ASC";
      }
      else { //error check instead of else
        sortDirSpec = "DESC";
      }
      var filterSpecification;
      filterSpecification = "users." + request.params.sort;
      const queryFilterType = request.params.filterType;
      const queryFilterData = request.params.filterData;
      const usersQueryResult = await this.userRepository.createQueryBuilder("users").skip(skipNum).take(takeNum).orderBy(sortSpecification, sortDirSpec).having("users." + queryFilterType + " = :spec", { spec: queryFilterData }).groupBy("users.uid").getMany();
      response.status(200);
      return usersQueryResult;
    }
    catch (e) {
      response.status(401).send("Users were not found with error: " + e);
      return;
    }
  }

  async oneUser(request: Request, response: Response, next: NextFunction) {
    let { uid } = request.body;
    try {
      const uidNumber = request.params.uid; //needed for the await call / can't nest them
      const usersQueryResult = await this.userRepository.createQueryBuilder("users").where("users.uid = :uid", { uid: uidNumber }).getOneOrFail();
      //const user = this.userRepository.findOne(request.params.id); same call example
      response.status(200);
      return usersQueryResult;
    }
    catch (e) {
      response
        .status(401)
        .send("User ID: " + request.params.uid + " was not found.");
      return;
    }
  }
  async saveNewUser(request: Request, response: Response, next: NextFunction) {
    try {
      return this.userRepository.save(request.body);
    }
    catch (e) {
      response
        .status(401)
        .send("New User (" + request.body + ") couldn't be saved with error " + e);
      return;
    }
  }

  async updateUser(request: Request, response: Response, next: NextFunction) {
    try {
      const uidNumber = request.params.uid;
      await getConnection().createQueryBuilder().update(User).where("uid = :uid", { uid: uidNumber }).set(request.body).execute();
      response.status(200);
    }

    catch (e) {
      response
        .status(401)
        .send("User with UID " + request.params.uid + " and details(" + request.body + ") couldn't be updated with error " + e);
      return;
    }
  }

  async deleteUser(request: Request, response: Response, next: NextFunction) {
    try {

      const uidNumber = request.params.uid; //needed for the await call / can't nest them
      const userQuereyResult = await this.userRepository.createQueryBuilder("users").delete().where("users.uid = :uid", { uid: uidNumber }).execute();
      response.status(200);

    }
    catch (e) {
      response.status(401).send("User UID: " + request.params.uid + " was not found adn could not be deleted.")
    }
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
  getAssociatedStudents() {
    return this.createQueryBuilder('users')
      .leftJoinAndSelect("users.students", "students")
      .where("students.firstName = :firstName", { firstName: "firstStudentFirstName" })
      .getMany();
  }
}

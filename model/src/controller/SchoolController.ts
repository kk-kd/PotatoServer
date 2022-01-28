import {
  EntityRepository,
  Repository,
  getRepository,
  getConnection,
} from "typeorm";
import { NextFunction, Request, Response } from "express";
import { School } from "../entity/School";

@EntityRepository(School)
export class SchoolController extends Repository<School> {
  private schoolRepository = getRepository(School);

  async allSchools(request: Request, response: Response, next: NextFunction) {
    try {

      const pageNum: number = +request.params.page;
      const takeNum: number = +request.params.size;
      var skipNum = pageNum * takeNum;
      var sortSpecification;
      var sortDirSpec;
      if (request.params.sort == 'none') {
        sortSpecification = "schools.uid";
      }
      else { //should error check instead of else
        sortSpecification = "schools." + request.params.sort;
      }
      if ((request.params.sortDir == 'none') || (request.params.sortDir == 'ASC')) {
        sortDirSpec = "ASC";
      }
      else { //error check instead of else
        sortDirSpec = "DESC";
      }
      const schoolQueryResult = await this.schoolRepository.createQueryBuilder("schools").skip(skipNum).take(takeNum).orderBy(sortSpecification, sortDirSpec).getMany();
      response.status(200);
      return schoolQueryResult;
    }
    catch (e) {
      response.status(401).send("Schools were not found with error: " + e);
      return;
    }
  }
  async filterAllSchools(request: Request, response: Response, next: NextFunction) {
    try {
      const pageNum: number = +request.params.page;
      const takeNum: number = +request.params.size;
      var skipNum = pageNum * takeNum;
      var sortSpecification;
      var sortDirSpec;
      if (request.params.sort == 'none') {
        sortSpecification = "schools.uid";
      }
      else { //should error check instead of else
        sortSpecification = "schools." + request.params.sort;
      }
      if ((request.params.sortDir == 'none') || (request.params.sortDir == 'ASC')) {
        sortDirSpec = "ASC";
      }
      else { //error check instead of else
        sortDirSpec = "DESC";
      }
      var filterSpecification;
      filterSpecification = "schools." + request.params.sort;
      const queryFilterType = request.params.filterType;
      const queryFilterData = request.params.filterData;
      const usersQueryResult = await this.schoolRepository.createQueryBuilder("schools").skip(skipNum).take(takeNum).orderBy(sortSpecification, sortDirSpec).having("schools." + queryFilterType + " = :spec", { spec: queryFilterData }).groupBy("schools.uid").getMany();
      response.status(200);
      return usersQueryResult;
    }
    catch (e) {
      response.status(401).send("Users were not found with error: " + e);
      return;
    }
  }

  async oneSchool(request: Request, response: Response, next: NextFunction) {
    try {
      const uidNumber = request.params.uid; //needed for the await call / can't nest them
      const usersQueryResult = await this.schoolRepository.createQueryBuilder("schools").where("schools.uid = :uid", { uid: uidNumber }).getOneOrFail();
      response.status(200);
      return usersQueryResult;
    }
    catch (e) {
      response
        .status(401)
        .send("School with UID: " + request.params.uid + " was not found.");
      return;
    }
  }

  async saveNewSchool(request: Request, response: Response, next: NextFunction) {
    try {
      return this.schoolRepository.save(request.body);
    }
    catch (e) {
      response
        .status(401)
        .send("New School (" + request.body + ") couldn't be saved with error " + e);
      return;
    }
  }

  async updateSchool(request: Request, response: Response, next: NextFunction) {
    try {
      const uidNumber = request.params.uid;
      await getConnection().createQueryBuilder().update(School).where("uid = :uid", { uid: uidNumber }).set(request.body).execute();
      response.status(200);
    }

    catch (e) {
      response
        .status(401)
        .send("School with UID " + request.params.uid + " and details(" + request.body + ") couldn't be updated with error " + e);
      return;
    }
  }

  async deleteSchool(request: Request, response: Response, next: NextFunction) {
    try {

      const uidNumber = request.params.uid; //needed for the await call / can't nest them
      const schoolQueryResult = await this.schoolRepository.createQueryBuilder("schools").delete().where("schools.uid = :uid", { uid: uidNumber }).execute();
      response.status(200);
    }
    catch (e) {
      response.status(401).send("Schools UID: " + request.params.uid + " was not found adn could not be deleted.")
    }
  }
  findBySchoolID(uid: number) {
    return this.createQueryBuilder("schools")
      .where("schools.schoolId = :schoolId", { uid })
      .getOne();
  }
}
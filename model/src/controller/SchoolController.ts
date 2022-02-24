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
      const isAdmin = response.locals.jwtPayload.isAdmin;
      if (!isAdmin) {
        response.status(409).send("User is not an admin.")
        return;
      }
      const pageNum: number = +request.query.page;
      const takeNum: number = +request.query.size;
      var skipNum = pageNum * takeNum;
      var sortSpecification;
      var sortDirSpec;
      if (request.query.sort == 'none') {
        sortSpecification = "schools.uid";
      }
      else { //should error check instead of else
        sortSpecification = "schools." + request.query.sort;
      }
      if ((request.query.sortDir == 'none') || (request.query.sortDir == 'ASC')) {
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
      const isAdmin = response.locals.jwtPayload.isAdmin;
      if (!isAdmin) {
        response.status(409).send("User is not an admin.")
        return;
      }
      const pageNum: number = +request.query.page;
      if (pageNum <= -1) {
        response.status(401).send("Please specify a positive page number to view results.");
        return;
      }
      const takeNum: number = +request.query.size;
      var skipNum = pageNum * takeNum;

      var sortSpecification;
      var sortDirSpec;
      if (request.query.sort == 'none') {
        sortSpecification = "schools.uid";
      }
      else { //should error check instead of else
        sortSpecification = "schools." + request.query.sort;
      }
      if (request.query.sortDir == 'ASC') {
        sortDirSpec = "ASC";
      }
      else if (request.query.sortDir == 'DESC') { //error check instead of else
        sortDirSpec = "DESC";
      } else {
        sortDirSpec = "ASC";
        sortSpecification = "schools.uid";
      }
      var filterSpecification;
      filterSpecification = "schools." + request.query.sort;
      const queryFilterType = request.query.filterType;
      const queryFilterData = request.query.filterData;
      if (request.query.showAll && request.query.showAll === "true") {
        const [schoolsQueryResult, total] = await this.schoolRepository
          .createQueryBuilder("schools")
          .orderBy(sortSpecification, sortDirSpec)
          .where("schools.name ilike '%' || :name || '%'", { name: queryFilterData })
          .leftJoinAndSelect("schools.routes", "routes")
          .getManyAndCount();
        response.status(200);
        return {
          schools: schoolsQueryResult,
          total: total
        };
      } else {
        const [schoolsQueryResult, total] = await this.schoolRepository
          .createQueryBuilder("schools")
          .skip(skipNum)
          .take(takeNum)
          .orderBy(sortSpecification, sortDirSpec)
          .where("schools.name ilike '%' || :name || '%'", { name: queryFilterData })
          .leftJoinAndSelect("schools.routes", "routes")
          .getManyAndCount();
        response.status(200);
        return {
          schools: schoolsQueryResult,
          total: total
        };
      }
    }
    catch (e) {
      response.status(401).send("Users were not found with error: " + e);
      return;
    }
  }

  async oneSchool(request: Request, response: Response, next: NextFunction) {

    try {
      const isAdmin = response.locals.jwtPayload.isAdmin;
      if (!isAdmin) {
        response.status(409).send("User is not an admin.")
        return;
      }
      const uidNumber = request.params.uid; //needed for the await call / can't nest them
      const usersQueryResult = await this.schoolRepository
        .createQueryBuilder("schools")
        .where("schools.uid = :uid", { uid: uidNumber })
        .leftJoinAndSelect("schools.routes", "routes")
        .leftJoinAndSelect("routes.stops", "routeStops")
        .leftJoinAndSelect("schools.students", "students")
        .leftJoinAndSelect("students.inRangeStops", "studentInRangeStops")
        .leftJoinAndSelect("students.route", "route")
        .leftJoinAndSelect("routes.students", "routeStudents")
        .leftJoinAndSelect("routeStudents.inRangeStops", "inRangeStops")
        .getOneOrFail();
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

  async oneRoutePlanner(request: Request, response: Response, next: NextFunction) {
    try {
      const uidNumber = request.params.uid;
      const usersQueryResult = await this.schoolRepository
        .createQueryBuilder("schools")
        .where("schools.uid = :uid", { uid: uidNumber })
        .leftJoinAndSelect("schools.routes", "routes")
        .leftJoinAndSelect("routes.students", "routeStudents")
        .leftJoinAndSelect("schools.students", "students")
        .leftJoinAndSelect("students.parentUser", "parent")
        .leftJoinAndSelect("routes.stops", "stops")
        .leftJoinAndSelect("stops.inRangeStudents", "stopStudents")
        .getOneOrFail();
      response.status(200);
      return usersQueryResult;
    } catch (e) {
      response
        .status(401)
        .send("School with UID: " + request.params.uid + " was not found.");
      return;
    }
  }

  async saveNewSchool(request: Request, response: Response, next: NextFunction) {
    try {
      const isAdmin = response.locals.jwtPayload.isAdmin;
      if (!isAdmin) {
        response.status(409).send("User is not an admin.")
        return;
      }
      var queryData = request.body;
      queryData["uniqueName"] = request.body.name.toLowerCase().trim();
      const reptitiveEntry = await getRepository(School)
        .createQueryBuilder("schools")
        .select()
        .where("schools.uniqueName = :uniqueName", { uniqueName: queryData["uniqueName"] })
        .getOne();

      if (reptitiveEntry != null) {
        response.status(401).send("School Name is already taken.");
        return;
      }
      return await this.schoolRepository.save(queryData);
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
      var queryData = request.body;
      queryData["uniqueName"] = request.body.name.toLowerCase().trim();
      const reptitiveEntry = await getRepository(School)
        .createQueryBuilder("schools")
        .select()
        .where("schools.uniqueName = :uniqueName", { uniqueName: queryData["uniqueName"] })
        .getOne();

      if (reptitiveEntry != null) {
        response.status(401).send("School Name is already taken.");
        return;
      }
      return await this.schoolRepository.save(queryData);
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
      const isAdmin = response.locals.jwtPayload.isAdmin;
      if (!isAdmin) {
        response.status(409).send("User is not an admin.")
        return;
      }
      const uidNumber = request.params.uid; //needed for the await call / can't nest them
      const schoolQueryResult = await this.schoolRepository.createQueryBuilder("schools").delete().where("schools.uid = :uid", { uid: uidNumber }).execute();
      response.status(200);
      return schoolQueryResult;
    }
    catch (e) {
      response.status(401).send("Schools UID: " + request.params.uid + " was not found adn could not be deleted.");
      return;
    }
  }
  findBySchoolID(uid: number) {
    return this.createQueryBuilder("schools")
      .where("schools.uid = :uid", { uid })
      .getOne();
  }

}

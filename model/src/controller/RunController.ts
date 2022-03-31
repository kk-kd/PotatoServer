import {
  EntityRepository,
  Repository,
  getRepository,
  getConnection,
} from "typeorm";
import { NextFunction, Request, Response } from "express";
import { Route } from "../entity/Route";
import { Run } from "../entity/Run";
import { Student } from "../entity/Student";
import { User } from "../entity/User";

@EntityRepository(Route)
export class RunController extends Repository<Run> {
  private runRepository = getRepository(Run);
  private userRepository = getRepository(User);

  async filterAllRuns(
      request: Request,
      response: Response,
      next: NextFunction
  ) {
    try {
      const role = response.locals.jwtPayload.role;
      const pageNum: number = +request.query.page || 0;
      if (pageNum <= -1) {
        response.status(401).send("Please specify a positive page number to view results.");
        return;
      }
      const takeNum: number = +request.query.size || 10;
      var skipNum = pageNum * takeNum;
      var sortSpecification;
      var sortDirSpec;
      if (!request.query.sort || request.query.sort === "none") {
        sortSpecification = "runs.uid";
      }

      if (!request.query.sortDir || request.query.sortDir === "none") {
        sortDirSpec = "ASC";
        sortSpecification = "runs.uid";
      } else if (request.query.sortDir === "ASC") {
        sortDirSpec = "ASC";
      } else {
        sortDirSpec = "DESC";
      }
      const schoolFilter = request.query.schoolFilter || "";
      const driverFilter = request.query.driverFilter || "";
      const routeFilter = request.query.routeFilter || "";
      const busFilter = request.query.busFilter || "";
      if (request.query.showAll && request.query.showAll === "true") {
        if (role == "School Staff") {
          const userId = response.locals.jwtPayload.uid;
          const currentUser = await this.userRepository
            .createQueryBuilder("users")
            .where("users.uid = :uid", { uid: userId })
            .leftJoinAndSelect("users.attachedSchools", "attachedSchools")
            .getOneOrFail();
          const attachedSchools = currentUser.attachedSchools.map(school => school.uid);
          const [routeQueryResult, total] = await this.runRepository
            .createQueryBuilder("runs")
            .leftJoinAndSelect("runs.route", "route")
            .leftJoinAndSelect("route.school", "school")
            .leftJoinAndSelect("runs.driver", "driver")
            .orderBy(sortSpecification, sortDirSpec)
            .where("runs.busNumber ilike '%' || :busNumber || '%'", { busNumber: busFilter })
            .andWhere("route.name ilike '%' || :routeName || '%'", { routeName: routeFilter })
            .andWhere("school.name ilike '%' || :schoolName || '%'", { schoolName: schoolFilter })
            .andWhere("driver.name ilike '%' || :driverName || '%'", { driverName: driverFilter })
            .andWhere("school.uid = ANY(:uids)", { uids: attachedSchools })
            .getManyAndCount();
          response.status(200);
          return {
            routes: routeQueryResult,
            total: total
          };
        }
        const [routeQueryResult, total] = await this.runRepository
          .createQueryBuilder("runs")
          .leftJoinAndSelect("runs.route", "route")
          .leftJoinAndSelect("route.school", "school")
          .leftJoinAndSelect("runs.driver", "driver")
          .orderBy(sortSpecification, sortDirSpec)
          .where("runs.busNumber ilike '%' || :busNumber || '%'", { busNumber: busFilter })
          .andWhere("route.name ilike '%' || :routeName || '%'", { routeName: routeFilter })
          .andWhere("school.name ilike '%' || :schoolName || '%'", { schoolName: schoolFilter })
          .andWhere("driver.name ilike '%' || :driverName || '%'", { driverName: driverFilter })
          .getManyAndCount();
        response.status(200);
        return {
          routes: routeQueryResult,
          total: total
        };
      } else {
        if (role == "School Staff") {
          const userId = response.locals.jwtPayload.uid;
          const currentUser = await this.userRepository
            .createQueryBuilder("users")
            .where("users.uid = :uid", {uid: userId})
            .leftJoinAndSelect("users.attachedSchools", "attachedSchools")
            .getOneOrFail();
          const attachedSchools = currentUser.attachedSchools.map(school => school.uid);
          const [routeQueryResult, total] = await this.runRepository
            .createQueryBuilder("runs")
            .leftJoinAndSelect("runs.route", "route")
            .leftJoinAndSelect("route.school", "school")
            .leftJoinAndSelect("runs.driver", "driver")
            .orderBy(sortSpecification, sortDirSpec)
            .where("runs.busNumber ilike '%' || :busNumber || '%'", {busNumber: busFilter})
            .andWhere("route.name ilike '%' || :routeName || '%'", {routeName: routeFilter})
            .andWhere("school.name ilike '%' || :schoolName || '%'", {schoolName: schoolFilter})
            .andWhere("driver.name ilike '%' || :driverName || '%'", {driverName: driverFilter})
            .andWhere("school.uid = ANY(:uids)", {uids: attachedSchools})
            .getManyAndCount();
          response.status(200);
          return {
            routes: routeQueryResult,
            total: total
          };
        }
        const [routeQueryResult, total] = await this.runRepository
          .createQueryBuilder("runs")
          .leftJoinAndSelect("runs.route", "route")
          .leftJoinAndSelect("route.school", "school")
          .leftJoinAndSelect("runs.driver", "driver")
          .orderBy(sortSpecification, sortDirSpec)
          .where("runs.busNumber ilike '%' || :busNumber || '%'", { busNumber: busFilter })
          .andWhere("route.name ilike '%' || :routeName || '%'", { routeName: routeFilter })
          .andWhere("school.name ilike '%' || :schoolName || '%'", { schoolName: schoolFilter })
          .andWhere("driver.name ilike '%' || :driverName || '%'", { driverName: driverFilter })
          .getManyAndCount();
        response.status(200);
        return {
          routes: routeQueryResult,
          total: total
        };
      }
    } catch (e) {
      response.status(401).send("Routes were not found with error: " + e);
      return;
    }
  }

  async validateNewRun(request: Request, response: Response, next: NextFunction) {
    try {
      const driverUid = response.locals.jwtPayload.uid;
      var driverTaken = false;
      var busNumberTaken = false;
      var routeTaken = false;
      const driverRuns = await this.runRepository
        .createQueryBuilder("runs")
        .leftJoinAndSelect("runs.driver", "driver")
        .where("driver.uid = :uid", { uid: driverUid })
        .andWhere("runs.ongoing = true")
        .getMany();
      if (driverRuns.length > 0) {
        driverTaken = true;
      }
      const busNumberRuns = await this.runRepository
        .createQueryBuilder("runs")
        .where("runs.busNumber = :busNumber", { busNumber: request.query.busNumber })
        .andWhere("runs.ongoing = true")
        .getMany();
      if (busNumberRuns.length > 0) {
        busNumberTaken = true;
      }
      const routeRuns = await this.runRepository
        .createQueryBuilder("runs")
        .leftJoinAndSelect("runs.route", "route")
        .where("route.uid = :routeUid", { routeUid: request.query.routeUid })
        .andWhere("runs.ongoing = true")
        .getMany()
      if (routeRuns.length > 0) {
        routeTaken = true;
      }
      response.status(200);
      return {
        driverTaken: driverTaken,
        busNumberTaken: busNumberTaken,
        routeTaken: routeTaken,
      };
    } catch (e) {
      response
      .status(401)
      .send(
          "New Route (" + request.body + ") couldn't be saved with error " + e
      );
      return;
    }
  }

  async saveNewRun(request: Request, response: Response, next: NextFunction) {
    try {
      const currentTime = new Date();
      request.body.timeStarted = currentTime.toISOString()
      return await this.runRepository.save(request.body);
    } catch (e) {
      response
      .status(401)
      .send(
          "New Run (" + request.body + ") couldn't be saved with error " + e
      );
      return;
    }
  }
}

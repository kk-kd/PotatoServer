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

const EXPIRATION = 3 * 60 * 60 * 1000;

@EntityRepository(Route)
export class RunController extends Repository<Run> {
  private runRepository = getRepository(Run);
  private userRepository = getRepository(User);
  private routeRepository = getRepository(Route);

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
      } else if (request.query.sort === "route.school.name") {
        sortSpecification = "school.name";
      } else if (request.query.sort === "busNumber") {
        sortSpecification =
            "NULLIF(regexp_replace(runs.busNumber, '\\D', '', 'g'), '')::int";
      } else if (request.query.sort === "duration") {
        sortSpecification = "runs.duration";
      } else if (request.query.sort === "timeStarted") {
        sortSpecification = "runs.timeStarted";
      } else if (request.query.sort === "direction") {
        sortSpecification = "runs.direction";
      } else {
        sortSpecification = request.query.sort;
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
          const [runQueryResult, total] = await this.runRepository
            .createQueryBuilder("runs")
            .leftJoinAndSelect("runs.route", "route")
            .leftJoinAndSelect("route.school", "school")
            .leftJoinAndSelect("runs.driver", "driver")
            .orderBy(sortSpecification, sortDirSpec)
            .where("runs.busNumber ilike '%' || :busNumber || '%'", { busNumber: busFilter })
            .andWhere("route.name ilike '%' || :routeName || '%'", { routeName: routeFilter })
            .andWhere("school.name ilike '%' || :schoolName || '%'", { schoolName: schoolFilter })
            .andWhere("driver.fullName ilike '%' || :driverName || '%'", { driverName: driverFilter })
            .andWhere("school.uid = ANY(:uids)", { uids: attachedSchools })
            .getManyAndCount();
          const expiredRuns = await this.findExpiredRuns(runQueryResult);
          const currentTime = new Date();
          response.status(200);
          return {
            runs: runQueryResult.map(run => expiredRuns.some(expiredRun => expiredRun === run.uid) ?
                {...run, ongoing: false, timedOut: true, duration: EXPIRATION} :
                run
            ),
            total: total
          };
        }
        const [runQueryResult, total] = await this.runRepository
          .createQueryBuilder("runs")
          .leftJoinAndSelect("runs.route", "route")
          .leftJoinAndSelect("route.school", "school")
          .leftJoinAndSelect("runs.driver", "driver")
          .orderBy(sortSpecification, sortDirSpec)
          .where("runs.busNumber ilike '%' || :busNumber || '%'", { busNumber: busFilter })
          .andWhere("route.name ilike '%' || :routeName || '%'", { routeName: routeFilter })
          .andWhere("school.name ilike '%' || :schoolName || '%'", { schoolName: schoolFilter })
          .andWhere("driver.fullName ilike '%' || :driverName || '%'", { driverName: driverFilter })
          .getManyAndCount();
        const expiredRuns = await this.findExpiredRuns(runQueryResult);
        const currentTime = new Date();
        response.status(200);
        return {
          runs: runQueryResult.map(run => expiredRuns.some(expiredRun => expiredRun === run.uid) ?
              {...run, ongoing: false, timedOut: true, duration: EXPIRATION} :
              run
          ),
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
          const [runQueryResult, total] = await this.runRepository
            .createQueryBuilder("runs")
            .leftJoinAndSelect("runs.route", "route")
            .leftJoinAndSelect("route.school", "school")
            .leftJoinAndSelect("runs.driver", "driver")
            .offset(skipNum)
            .limit(takeNum)
            .orderBy(sortSpecification, sortDirSpec)
            .where("runs.busNumber ilike '%' || :busNumber || '%'", {busNumber: busFilter})
            .andWhere("route.name ilike '%' || :routeName || '%'", {routeName: routeFilter})
            .andWhere("school.name ilike '%' || :schoolName || '%'", {schoolName: schoolFilter})
            .andWhere("driver.fullName ilike '%' || :driverName || '%'", {driverName: driverFilter})
            .andWhere("school.uid = ANY(:uids)", {uids: attachedSchools})
            .getManyAndCount();
          const expiredRuns = await this.findExpiredRuns(runQueryResult);
          const currentTime = new Date();
          response.status(200);
          return {
            runs: runQueryResult.map(run => expiredRuns.some(expiredRun => expiredRun === run.uid) ?
                {...run, ongoing: false, timedOut: true, duration: EXPIRATION} :
                run
            ),
            total: total
          };
        }
        const [runQueryResult, total] = await this.runRepository
          .createQueryBuilder("runs")
          .leftJoinAndSelect("runs.route", "route")
          .leftJoinAndSelect("route.school", "school")
          .leftJoinAndSelect("runs.driver", "driver")
          .orderBy(sortSpecification, sortDirSpec)
          .offset(skipNum)
          .limit(takeNum)
          .where("runs.busNumber ilike '%' || :busNumber || '%'", { busNumber: busFilter })
          .andWhere("route.name ilike '%' || :routeName || '%'", { routeName: routeFilter })
          .andWhere("school.name ilike '%' || :schoolName || '%'", { schoolName: schoolFilter })
          .andWhere("driver.fullName ilike '%' || :driverName || '%'", { driverName: driverFilter })
          .getManyAndCount();
        const expiredRuns = await this.findExpiredRuns(runQueryResult);
        const currentTime = new Date();
        response.status(200);
        return {
          runs: runQueryResult.map(run => expiredRuns.some(expiredRun => expiredRun === run.uid) ?
              {...run, ongoing: false, timedOut: true, duration: EXPIRATION} :
              run
          ),
          total: total
        };
      }
    } catch (e) {
      response.status(401).send("Routes were not found with error: " + e);
      return;
    }
  }

  async getUserActiveRuns(request: Request, response: Response, next: NextFunction) {
    try {
      const driverUid = response.locals.jwtPayload.uid;
      const driverRuns = await this.runRepository
        .createQueryBuilder("runs")
        .leftJoinAndSelect("runs.driver", "driver")
        .where("driver.uid = :uid", { uid: driverUid })
        .andWhere("runs.ongoing = true")
        .getMany();
      response.status(200);
      return {
        runs: driverRuns,
      }
    } catch (e) {
      response
      .status(401)
      .send(
          "New Route (" + request.body + ") couldn't be saved with error " + e
      );
      return;
    }
  }

  async getRouteActiveRun(request: Request, response: Response, next: NextFunction) {
    try {
      const uidNumber = request.params.uid; //needed for the await call / can't nest them
      const runQueryResult = await this.runRepository
        .createQueryBuilder("runs")
        .leftJoinAndSelect("runs.route", "route")
        .where("route.uid = :uid", { uid: uidNumber })
        .andWhere("runs.ongoing = true")
        .getOneOrFail();
      response.status(200);
      return runQueryResult;
    } catch (e) {
      response
        .status(401)
        .send("Route with UID: " + request.params.uid + " does not have an active run.");
      return;
    }
  }

  async getSchoolActiveRuns(request: Request, response: Response, next: NextFunction) {
    try {
      const uidNumber = request.params.uid;
      const runQueryResult = await this.runRepository
        .createQueryBuilder("runs")
        .leftJoinAndSelect("runs.route", "route")
        .leftJoinAndSelect("route.school", "school")
        .where("school.uid = :uid", { uid: uidNumber })
        .andWhere("runs.ongoing = true")
        .getMany();
      response.status(200);
      return runQueryResult;
    } catch (e) {
      response
        .status(401)
        .send("School with UID: " + request.params.uid + " does not have any active runs");
      return;
    }
  }

  async getRouteRuns(request: Request, response: Response, next: NextFunction) {
    try {
      const routeUid = request.params.uid;
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
      } else if (request.query.sort === "route.school.name") {
        sortSpecification = "school.name";
      } else if (request.query.sort === "busNumber") {
        sortSpecification =
            "NULLIF(regexp_replace(runs.busNumber, '\\D', '', 'g'), '')::int";
      } else if (request.query.sort === "duration") {
        sortSpecification = "runs.duration";
      } else if (request.query.sort === "timeStarted") {
        sortSpecification = "runs.timeStarted";
      } else if (request.query.sort === "direction") {
        sortSpecification = "runs.direction";
      } else {
        sortSpecification = request.query.sort;
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
      const busFilter = request.query.busFilter || "";
      const [runQueryResult, total] = await this.runRepository
        .createQueryBuilder("runs")
        .leftJoinAndSelect("runs.route", "route")
        .leftJoinAndSelect("route.school", "school")
        .leftJoinAndSelect("runs.driver", "driver")
        .orderBy(sortSpecification, sortDirSpec)
        .offset(skipNum)
        .limit(takeNum)
        .where("runs.busNumber ilike '%' || :busNumber || '%'", { busNumber: busFilter })
        .andWhere("route.uid = :routeUid", { routeUid: routeUid })
        .andWhere("school.name ilike '%' || :schoolName || '%'", { schoolName: schoolFilter })
        .andWhere("driver.fullName ilike '%' || :driverName || '%'", { driverName: driverFilter })
        .getManyAndCount();
      const expiredRuns = await this.findExpiredRuns(runQueryResult);
      const currentTime = new Date();
      response.status(200);
      return {
        runs: runQueryResult.map(run => expiredRuns.some(expiredRun => expiredRun === run.uid) ?
            {...run, ongoing: false, timedOut: true, duration: EXPIRATION} :
            run
        ),
        total: total
      };
    } catch (e) {
      response.status(401).send("Routes were not found with error: " + e);
      return;
    }
  }

  async validateNewRun(request: Request, response: Response, next: NextFunction) {
    try {
      const driverUid = response.locals.jwtPayload.uid;
      const busNumber = request.query.busNumber;
      const routeUid = request.query.routeUid;
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
        const expiredDriverRuns = await this.findExpiredRuns(driverRuns);
        driverTaken = expiredDriverRuns.length !== driverRuns.length;
      }
      const busNumberRuns = await this.runRepository
        .createQueryBuilder("runs")
        .where("runs.busNumber = :busNumber", { busNumber: busNumber })
        .andWhere("runs.ongoing = true")
        .getMany();
      if (busNumberRuns.length > 0) {
        const expiredBusNumberRuns = await this.findExpiredRuns(busNumberRuns);
        busNumberTaken = expiredBusNumberRuns.length !== busNumberRuns.length;
      }
      const routeRuns = await this.runRepository
        .createQueryBuilder("runs")
        .leftJoinAndSelect("runs.route", "route")
        .where("route.uid = :routeUid", { routeUid: routeUid })
        .andWhere("runs.ongoing = true")
        .getMany()
      if (routeRuns.length > 0) {
        const expiredRouteRuns = await this.findExpiredRuns(routeRuns);
        routeTaken = expiredRouteRuns.length !== routeRuns.length;
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
      const driverUid = response.locals.jwtPayload.uid;
      const routeUid = request.body.routeUid;
      const busNumber = request.body.busNumber;
      const driverRuns = await this.runRepository
        .createQueryBuilder("runs")
        .leftJoinAndSelect("runs.driver", "driver")
        .where("driver.uid = :uid", { uid: driverUid })
        .andWhere("runs.ongoing = true")
        .getMany();
      const currentTime = new Date();
      if (driverRuns.length > 0) {
        driverRuns.forEach(async (run) => {
          await this.runRepository.createQueryBuilder("runs")
            .update()
            .set({ ongoing: false, timedOut: false, duration: currentTime.getTime() - new Date(run.timeStarted).getTime()})
            .where("runs.uid = :uid", { uid: run.uid })
            .execute();
        });
      }
      const busNumberRuns = await this.runRepository
        .createQueryBuilder("runs")
        .where("runs.busNumber = :busNumber", { busNumber: busNumber })
        .andWhere("runs.ongoing = true")
        .getMany();
      if (busNumberRuns.length > 0) {
        busNumberRuns.forEach(async (run) => {
          await this.runRepository.createQueryBuilder("runs")
            .update()
            .set({ ongoing: false, timedOut: false, duration: currentTime.getTime() - new Date(run.timeStarted).getTime()})
            .where("runs.uid = :uid", { uid: run.uid })
            .execute();
        });
      }
      const routeRuns = await this.runRepository
        .createQueryBuilder("runs")
        .leftJoinAndSelect("runs.route", "route")
        .where("route.uid = :routeUid", { routeUid: routeUid })
        .andWhere("runs.ongoing = true")
        .getMany()
      if (routeRuns.length > 0) {
        routeRuns.forEach(async (run) => {
          await this.runRepository.createQueryBuilder("runs")
            .update()
            .set({ ongoing: false, timedOut: false, duration: currentTime.getTime() - new Date(run.timeStarted).getTime()})
            .where("runs.uid = :uid", { uid: run.uid })
            .execute();
        });
      }
      const driver = await this.userRepository
        .createQueryBuilder("users")
        .where("users.uid = :uid", { uid: driverUid })
        .getOne();
      const route = await this.routeRepository
        .createQueryBuilder("routes")
        .where("routes.uid = :routeUid", { routeUid: routeUid })
        .getOne();
      const newRun = new Run();
      newRun.driver = driver;
      newRun.timeStarted = currentTime.toISOString();
      newRun.ongoing = true;
      newRun.busNumber = request.body.busNumber;
      newRun.direction = request.body.direction;
      newRun.route = route;
      return await this.runRepository.save(newRun);
    } catch (e) {
      response
      .status(401)
      .send(
          "New Run (" + request.body + ") couldn't be saved with error " + e
      );
      return;
    }
  }

  async endRun(request: Request, response: Response, next: NextFunction) {
    try {
      const uid = request.params.uid;
      const currentTime = new Date();
      const old = await this.runRepository.createQueryBuilder("runs")
        .where("runs.uid = :uid", { uid: uid })
        .getOne();
      return await this.runRepository.createQueryBuilder("runs")
        .update()
        .set({ ongoing: false, timedOut: false, duration: currentTime.getTime() - new Date(old.timeStarted).getTime()})
        .where("runs.uid = :uid", { uid: uid })
        .execute();
    } catch (e) {
      response.status(401)
        .send(
            "Update Run (" + request.body + ") couldn't be ended with error " + e
        );
      return;
    }
  }

  async findExpiredRuns(runs: Run[]) {
    const currentTime = new Date();
    const expired = runs
      .filter(run => currentTime.getTime() - new Date(run.timeStarted).getTime() > EXPIRATION && run.ongoing)
      .map(run => run.uid);
    if (expired.length > 0) {
      await this.runRepository
        .createQueryBuilder("runs")
        .update()
        .set({ ongoing: false, timedOut: true, duration: EXPIRATION })
        .where("runs.uid = ANY(:expired)", { expired: expired })
        .execute();
    }
    return expired;
  }
}

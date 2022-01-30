import {
  EntityRepository,
  Repository,
  getRepository,
  getConnection,
} from "typeorm";
import { NextFunction, Request, Response } from "express";
import { Route } from "../entity/Route";

@EntityRepository(Route)
export class RouteController extends Repository<Route> {
  private routeRepository = getRepository(Route);

  async allRoutes(request: Request, response: Response, next: NextFunction) {
    try {

      const pageNum: number = +request.query.page;
      const takeNum: number = +request.query.size;
      var skipNum = pageNum * takeNum;
      var sortSpecification;
      var sortDirSpec;
      if (request.query.sort == 'none') {
        sortSpecification = "routes.uid";
      }
      else { //should error check instead of else
        sortSpecification = "routes." + request.query.sort;
      }
      if ((request.query.sortDir == 'none') || (request.query.sortDir == 'ASC')) {
        sortDirSpec = "ASC";
      }
      else { //error check instead of else
        sortDirSpec = "DESC";
      }
      const routeQueryResult = await this.routeRepository.createQueryBuilder("routes").skip(skipNum).take(takeNum).orderBy(sortSpecification, sortDirSpec).getMany();
      response.status(200);
      return routeQueryResult;
    }
    catch (e) {
      response.status(401).send("Routes were not found with error: " + e);
      return;
    }
  }
  async filterAllRoutes(request: Request, response: Response, next: NextFunction) {
    try {
      const pageNum: number = +request.query.page;
      const takeNum: number = +request.query.size;
      var skipNum = pageNum * takeNum;
      var sortSpecification;
      var sortDirSpec;
      if (request.query.sort == 'none') {
        sortSpecification = "route.uid";
      }
      else { //should error check instead of else
        sortSpecification = "route." + request.query.sort;
      }
      if ((request.query.sortDir == 'none') || (request.query.sortDir == 'ASC')) {
        sortDirSpec = "ASC";
      }
      else { //error check instead of else
        sortDirSpec = "DESC";
      }
      var filterSpecification;
      filterSpecification = "route." + request.query.sort;
      const queryFilterType = request.query.filterType;
      const queryFilterData = request.query.filterData;
      const routeQueryResult = await this.routeRepository.createQueryBuilder("route").skip(skipNum).take(takeNum).orderBy(sortSpecification, sortDirSpec).having("route." + queryFilterType + " = :spec", { spec: queryFilterData }).groupBy("route.uid").getMany();
      response.status(200);
      return routeQueryResult;
    }
    catch (e) {
      response.status(401).send("Routes were not found with error: " + e);
      return;
    }
  }

  async oneRoute(request: Request, response: Response, next: NextFunction) {
    try {
      const uidNumber = request.query.uid; //needed for the await call / can't nest them
      const routeQueryResult = await this.routeRepository.createQueryBuilder("routes").where("routes.uid = :uid", { uid: uidNumber }).leftJoinAndSelect("routes.students", "student").getOneOrFail();
      response.status(200);
      return routeQueryResult;
    }
    catch (e) {
      response
        .status(401)
        .send("Route with UID: " + request.query.uid + " was not found.");
      return;
    }
  }

  async saveNewRoute(request: Request, response: Response, next: NextFunction) {
    const isAdmin = response.locals.jwtPayload.isAdmin;
    if (!isAdmin) {
      response.status(409).send("User is not an admin.")
      return;
    }
    try {
      return this.routeRepository.save(request.body);
    }
    catch (e) {
      response
        .status(401)
        .send("New Route (" + request.body + ") couldn't be saved with error " + e);
      return;
    }
  }

  async updateRoute(request: Request, response: Response, next: NextFunction) {
    const isAdmin = response.locals.jwtPayload.isAdmin;
    if (!isAdmin) {
      response.status(409).send("User is not an admin.")
      return;
    }
    try {
      const uidNumber = request.query.uid;
      await getConnection().createQueryBuilder().update(Route).where("uid = :uid", { uid: uidNumber }).set(request.body).execute();
      response.status(200);
      return;

    }

    catch (e) {
      response
        .status(401)
        .send("Route with UID " + request.query.uid + " and details(" + request.body + ") couldn't be updated with error " + e);
      return;
    }
  }

  async deleteRoute(request: Request, response: Response, next: NextFunction) {
    const isAdmin = response.locals.jwtPayload.isAdmin;
    if (!isAdmin) {
      response.status(409).send("User is not an admin.")
      return;
    }
    try {

      const uidNumber = request.query.uid; //needed for the await call / can't nest them
      const routeQueryResult = await this.routeRepository.createQueryBuilder("routes").delete().where("routes.uid = :uid", { uid: uidNumber }).execute();
      response.status(200);

    }
    catch (e) {
      response.status(401).send("Route UID: " + request.query.uid + " was not found adn could not be deleted.")
    }
  }
  findByRouteID(uid: number) {
    return this.createQueryBuilder("routes")
      .where("routes.uid = :uid", { uid })
      .getOne();
  }
}

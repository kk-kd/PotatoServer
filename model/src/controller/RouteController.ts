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

  async all(request: Request, response: Response, next: NextFunction) {
    return this.routeRepository.find();
  }

  async one(request: Request, response: Response, next: NextFunction) {
    return this.routeRepository.findOne(request.params.id);
  }

  async saveRoute(request: Request, response: Response, next: NextFunction) {
    return this.routeRepository.save(request.body);
  }

  async deleteRoute(request: Request, response: Response, next: NextFunction) {
    let routeToRemove = await this.routeRepository.findOne(request.params.id);
    await this.routeRepository.remove(routeToRemove);
  }
  findByRouteID(uid: number) {
    return this.createQueryBuilder("routes")
      .where("routes.uid = :uid", { uid })
      .getOne();
  }
}

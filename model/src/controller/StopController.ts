import {
    EntityRepository,
    Repository,
    getRepository,
    getConnection,
} from "typeorm";
import { NextFunction, Request, Response } from "express";
import { Stop } from "../entity/Stop";

@EntityRepository(Stop)
export class StopController extends Repository<Stop> {
    private stopRepository = getRepository(Stop);

    async allStops(request: Request, response: Response, next: NextFunction) {
        try {

            const pageNum: number = +request.query.page;
            const takeNum: number = +request.query.size;
            var skipNum = pageNum * takeNum;
            var sortSpecification;
            var sortDirSpec;
            if (request.query.sort == 'none') {
                sortSpecification = "stops.uid";
            }
            else { //should error check instead of else
                sortSpecification = "stops." + request.query.sort;
            }
            if ((request.query.sortDir == 'none') || (request.query.sortDir == 'ASC')) {
                sortDirSpec = "ASC";
            } else {
                //error check instead of else
                sortDirSpec = "DESC";
            }
            const stopQueryResult = await this.stopRepository
                .createQueryBuilder("stops")
                .skip(skipNum)
                .take(takeNum)
                .orderBy(sortSpecification, sortDirSpec)
                .getMany();
            response.status(200);
            return stopQueryResult;
        } catch (e) {
            response.status(401).send("Stops were not found with error: " + e);
            return;
        }
    }

    async filterAllStops(request: Request, response: Response, next: NextFunction) {
        try {
            const pageNum: number = +request.query.page;
            const takeNum: number = +request.query.size;
            var skipNum = pageNum * takeNum;

            var sortSpecification;
            var sortDirSpec;
            if (request.query.sort == 'none') {
                sortSpecification = "stops.uid";
            }
            else { //should error check instead of else
                sortSpecification = "stops." + request.query.sort;
            }
            if (request.query.sortDir == 'ASC') {
                sortDirSpec = "ASC";
            }
            else if (request.query.sortDir == 'DESC') { //error check instead of else
                sortDirSpec = "DESC";
            } else {
                sortDirSpec = "ASC";
                sortSpecification = "stops.uid";
            }
            var filterSpecification;
            filterSpecification = "stops." + request.query.sort;
            const queryFilterType = request.query.filterType;
            const queryFilterData = request.query.filterData;
            if (request.query.showAll && request.query.showAll === "true") {
                const [stopsQueryResult, total] = await this.stopRepository
                    .createQueryBuilder("stops")
                    .orderBy(sortSpecification, sortDirSpec)
                    .where("stops.name ilike '%' || :name || '%'", { name: queryFilterData })
                    .leftJoinAndSelect("stops.route", "route")
                    .getManyAndCount();
                response.status(200);
                return {
                    stops: stopsQueryResult,
                    total: total
                };
            } else {
                const [stopsQueryResult, total] = await this.stopRepository
                    .createQueryBuilder("stops")
                    .skip(skipNum)
                    .take(takeNum)
                    .orderBy(sortSpecification, sortDirSpec)
                    .where("stops.name ilike '%' || :name || '%'", { name: queryFilterData })
                    .leftJoinAndSelect("stops.route", "route")
                    .getManyAndCount();
                response.status(200);
                return {
                    stops: stopsQueryResult,
                    total: total
                };
            }
        }
        catch (e) {
            response.status(401).send("Users were not found with error: " + e);
            return;
        }
    }
    async oneStop(request: Request, response: Response, next: NextFunction) {
        try {
            const uidNumber = request.params.uid; //needed for the await call / can't nest them
            const stopQueryResult = await this.stopRepository
                .createQueryBuilder("stops")
                .where("stops.uid = :uid", { uid: uidNumber })
                .leftJoinAndSelect("stops.route", "route")
                .getOneOrFail();
            response.status(200);
            return stopQueryResult;
        } catch (e) {
            response
                .status(401)
                .send("Stop with UID: " + request.params.uid + " was not found.");
            return;
        }
    }

    async saveNewStop(request: Request, response: Response, next: NextFunction) {

        try {
            // const isAdmin = response.locals.jwtPayload.isAdmin;
            // if (!isAdmin) {
            //     response.status(409).send("User is not an admin.")
            //     return;

            return this.stopRepository.save(request.body);
        } catch (e) {
            response
                .status(401)
                .send(
                    "New Stop (" + request.body + ") couldn't be saved with error " + e
                );
            return;
        }
    }

    async updateStop(request: Request, response: Response, next: NextFunction) {

        try {
            //     // const isAdmin = response.locals.jwtPayload.isAdmin;
            //     // if (!isAdmin) {
            //     //     response.status(409).send("User is not an admin.")
            //     //     return;
            //     // }
            const uidNumber = request.params.uid;
            const updated = await getConnection().createQueryBuilder().update(Stop).where("uid = :uid", { uid: uidNumber }).set(request.body).execute();
            response.status(200);
            return updated;

        }

        catch (e) {
            response
                .status(401)
                .send("Stop with UID " + request.params.uid + " and details(" + request.body + ") couldn't be updated with error " + e);
            return;
        }
    }

    async deleteStop(request: Request, response: Response, next: NextFunction) {

        try {
            // const isAdmin = response.locals.jwtPayload.isAdmin;
            // if (!isAdmin) {
            //     response.status(409).send("User is not an admin.")
            //     return;
            // }
            const uidNumber = request.params.uid; //needed for the await call / can't nest them
            const stopQueryResult = await this.stopRepository.createQueryBuilder("stops").delete().where("stops.uid = :uid", { uid: uidNumber }).execute();
            response.status(200);
            return stopQueryResult;
        }
        catch (e) {
            response.status(401).send("Stop UID: " + request.params.uid + " was not found adn could not be deleted.")
        }
    }
    findByStopID(uid: number) {
        return this.createQueryBuilder("stops")
            .where("stops.uid = :uid", { uid })
            .getOne();
    }
}

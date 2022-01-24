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

  async all(request: Request, response: Response, next: NextFunction) {
    return this.schoolRepository.find();
  }

  async one(request: Request, response: Response, next: NextFunction) {
    return this.schoolRepository.findOne(request.params.id);
  }

  async saveschool(request: Request, response: Response, next: NextFunction) {
    return this.schoolRepository.save(request.body);
  }

  async deleteschool(request: Request, response: Response, next: NextFunction) {
    let schoolToRemove = await this.schoolRepository.findOne(request.params.id);
    await this.schoolRepository.remove(schoolToRemove);
  }
  findBySchoolID(uid: number) {
    return this.createQueryBuilder("schools")
      .where("schools.schoolId = :schoolId", { uid })
      .getOne();
  }
}

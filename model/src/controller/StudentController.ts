import {
  EntityRepository,
  Repository,
  getRepository,
  getConnection,
} from "typeorm";
import { NextFunction, Request, Response } from "express";
import { Student } from "../entity/Student";

@EntityRepository(Student)
export class StudentController extends Repository<Student> {
  private studentRepository = getRepository(Student);

  async all(request: Request, response: Response, next: NextFunction) {
    return this.studentRepository.find();
  }

  async one(request: Request, response: Response, next: NextFunction) {
    return this.studentRepository.findOne(request.params.id);
  }

  async savestudent(request: Request, response: Response, next: NextFunction) {
    return this.studentRepository.save(request.body);
  }

  async deletestudent(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    let studentToRemove = await this.studentRepository.findOne(
      request.params.id
    );
    await this.studentRepository.remove(studentToRemove);
  }
  findByStudentID(uid: number) {
    return this.createQueryBuilder("students")
      .where("students.studentId = :studentId", { uid })
      .getOne();
  }
  findByStudentName(firstName: string) {
    return this.createQueryBuilder("students")
      .where("students.firstName = :firstName", { firstName })
      .getOne();
  }
  updateStudentName(
    studentId: number,
    firstName: string,
    middleName: string,
    lastName: string
  ) {
    return this.createQueryBuilder("students")
      .update()
      .set({ firstName: firstName, middleName: middleName, lastName: lastName })
      .where("students.uid = :uid", { studentId })
      .execute();
  }
}

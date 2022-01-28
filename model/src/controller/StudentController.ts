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

  async allStudents(request: Request, response: Response, next: NextFunction) {
    try {
      const pageNum: number = +request.params.page;
      const takeNum: number = +request.params.size;
      var skipNum = pageNum * takeNum;
      var sortSpecification;
      var sortDirSpec;
      if (request.params.sort == 'none') {
        sortSpecification = "students.uid";
      }
      else { //should error check instead of else
        sortSpecification = "students." + request.params.sort;
      }
      if ((request.params.sortDir == 'none') || (request.params.sortDir == 'ASC')) {
        sortDirSpec = "ASC";
      }
      else { //error check instead of else
        sortDirSpec = "DESC";
      }
      const studentsQueryResult = await this.studentRepository.createQueryBuilder("students").skip(skipNum).take(takeNum).orderBy(sortSpecification, sortDirSpec).getMany();
      response.status(200);
      return studentsQueryResult;
    }
    catch (e) {
      response.status(401).send("Students were not found with error: " + e);
      return;
    }
  }
  async filterAllStudents(request: Request, response: Response, next: NextFunction) {
    try {
      const pageNum: number = +request.params.page;
      const takeNum: number = +request.params.size;
      var skipNum = pageNum * takeNum;
      var sortSpecification;
      var sortDirSpec;
      if (request.params.sort == 'none') {
        sortSpecification = "students.uid";
      }
      else { //should error check instead of else
        sortSpecification = "students." + request.params.sort;
      }
      if ((request.params.sortDir == 'none') || (request.params.sortDir == 'ASC')) {
        sortDirSpec = "ASC";
      }
      else { //error check instead of else
        sortDirSpec = "DESC";
      }
      var filterSpecification;
      filterSpecification = "students." + request.params.sort;
      const queryFilterType = request.params.filterType;
      const queryFilterData = request.params.filterData;
      const usersQueryResult = await this.studentRepository.createQueryBuilder("students").skip(skipNum).take(takeNum).orderBy(sortSpecification, sortDirSpec).having("students." + queryFilterType + " = :spec", { spec: queryFilterData }).groupBy("students.uid").getMany();
      response.status(200);
      return usersQueryResult;
    }
    catch (e) {
      response.status(401).send("Students were not found with error: " + e);
      return;
    }
  }
  async oneStudent(request: Request, response: Response, next: NextFunction) {
    try {
      const uidNumber = request.params.uid; //needed for the await call / can't nest them
      const usersQueryResult = await this.studentRepository.createQueryBuilder("students").where("students.uid = :uid", { uid: uidNumber }).getOneOrFail();
      //const user = this.userRepository.findOne(request.params.id); same call example
      response.status(200);
      return usersQueryResult;
    }
    catch (e) {
      response
        .status(401)
        .send("Student with UID: " + request.params.uid + " was not found.");
      return;
    }
  }

  async saveNewStudent(request: Request, response: Response, next: NextFunction) {
    try {
      return this.studentRepository.save(request.body);
    }
    catch (e) {
      response
        .status(401)
        .send("New Student (" + request.body + ") couldn't be saved with error " + e);
      return;
    }
  }

  async updateStudent(request: Request, response: Response, next: NextFunction) {
    try {
      const uidNumber = request.params.uid;
      await getConnection().createQueryBuilder().update(Student).where("uid = :uid", { uid: uidNumber }).set(request.body).execute();
      response.status(200);
    }

    catch (e) {
      response
        .status(401)
        .send("Student with UID " + request.params.uid + " and details(" + request.body + ") couldn't be updated with error " + e);
      return;
    }
  }

  async deleteStudent(request: Request, response: Response, next: NextFunction) {
    try {

      const uidNumber = request.params.uid; //needed for the await call / can't nest them
      const studentQueryResult = await this.studentRepository.createQueryBuilder("students").delete().where("students.uid = :uid", { uid: uidNumber }).execute();
      response.status(200);
    }
    catch (e) {
      response.status(401).send("Student UID: " + request.params.uid + " was not found adn could not be deleted.")
    }
  }
  findByStudentID(uid: number) {
    return this.createQueryBuilder("students")
      .where("students.uid = :uid", { uid })
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

import {
  EntityRepository,
  Repository,
  getRepository,
  getConnection,
} from "typeorm";
import { NextFunction, Request, Response } from "express";
import { Student } from "../entity/Student";
import { User } from "../entity/User";

@EntityRepository(Student)
export class StudentController extends Repository<Student> {
  private studentRepository = getRepository(Student);
  private userRepository = getRepository(User);

  async allStudents(request: Request, response: Response, next: NextFunction) {
    try {
      const pageNum: number = +request.query.page;
      const takeNum: number = +request.query.size;
      var skipNum = pageNum * takeNum;
      var sortSpecification;
      var sortDirSpec;
      if (request.query.sort == "none") {
        sortSpecification = "students.uid";
      } else {
        //should error check instead of else
        sortSpecification = "students." + request.query.sort;
      }
      if (request.query.sortDir == "none" || request.query.sortDir == "ASC") {
        sortDirSpec = "ASC";
      } else {
        //error check instead of else
        sortDirSpec = "DESC";
      }
      const studentsQueryResult = await this.studentRepository
        .createQueryBuilder("students")
        .skip(skipNum)
        .take(takeNum)
        .orderBy(sortSpecification, sortDirSpec)
        .getMany();
      response.status(200);
      return studentsQueryResult;
    } catch (e) {
      response.status(401).send("Students were not found with error: " + e);
      return;
    }
  }
  async filterAllStudents(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    try {
      const pageNum: number = +request.query.page;
      if (pageNum <= -1) {
        response
          .status(401)
          .send("Please specify a positive page number to view results.");
        return;
      }
      const takeNum: number = +request.query.size;
      var skipNum = pageNum * takeNum;

      var sortSpecification;
      var sortDirSpec;
      const role = response.locals.jwtPayload.role;
      if (request.query.sort == "none") {
        sortSpecification = "students.fullName";
      } else if (request.query.sort == "school.name") {
        sortSpecification = "school.name";
      } else {
        //should error check instead of else
        sortSpecification = "students." + request.query.sort;
      }
      if (sortSpecification == "students.id") {
        // Need to convert existing string id to number to be able to sort if they ask for student_id to be sorted
        sortSpecification =
          "NULLIF(regexp_replace(students.id, '\\D', '', 'g'), '')::int";
      }
      if (request.query.sortDir == "ASC") {
        sortDirSpec = "ASC";
      } else if (request.query.sortDir == "DESC") {
        //error check instead of else
        sortDirSpec = "DESC";
      } else {
        sortDirSpec = "ASC";
        sortSpecification = "students.fullName";
      }
      var filterSpecification;
      filterSpecification = "students." + request.query.sort;
      const queryIdFilter = request.query.idFilter;
      const queryFullNameFilter = request.query.fullNameFilter;
      if (queryIdFilter) {
        if (request.query.showAll && request.query.showAll === "true") {
          if (role == "School Staff") {
            const userId = response.locals.jwtPayload.uid;
            const currentUser = await this.userRepository
              .createQueryBuilder("users")
              .where("users.uid = :uid", { uid: userId })
              .leftJoinAndSelect("users.attachedSchools", "attachedSchools")
              .getOneOrFail();
            const attachedSchools = currentUser.attachedSchools.map(school => school.uid);
            const [studentsQueryResult, total] = await this.studentRepository
              .createQueryBuilder("students")
              .orderBy(sortSpecification, sortDirSpec)
              .where("students.id ilike '%' || :id || '%'", { id: queryIdFilter })
              .andWhere("students.fullName ilike '%' || :fullName || '%'", {
                fullName: queryFullNameFilter,
              })
              .andWhere("school.uid = ANY(:uids)", { uids: attachedSchools })
              .leftJoinAndSelect("students.route", "route")
              .leftJoinAndSelect("students.school", "school")
              .leftJoinAndSelect("students.inRangeStops", "stops")
              .getManyAndCount();
            response.status(200);
            return {
              students: studentsQueryResult,
              total: total,
            };
          }
          var [studentsQueryResult, total] = await this.studentRepository
            .createQueryBuilder("students")
            .orderBy(sortSpecification, sortDirSpec)
            .where("students.id ilike '%' || :id || '%'", { id: queryIdFilter })
            .andWhere("students.fullName ilike '%' || :fullName || '%'", {
              fullName: queryFullNameFilter,
            })
            .leftJoinAndSelect("students.route", "route")
            .leftJoinAndSelect("students.school", "school")
            .leftJoinAndSelect("students.inRangeStops", "stops")
            .getManyAndCount();
          response.status(200);
          return {
            students: studentsQueryResult,
            total: total,
          };
        } else {
          if (role == "School Staff") {
            const userId = response.locals.jwtPayload.uid;
            const currentUser = await this.userRepository
              .createQueryBuilder("users")
              .where("users.uid = :uid", { uid: userId })
              .leftJoinAndSelect("users.attachedSchools", "attachedSchools")
              .getOneOrFail();
            const attachedSchools = currentUser.attachedSchools.map(school => school.uid);
            const [studentsQueryResult, total] = await this.studentRepository
              .createQueryBuilder("students")
              .orderBy(sortSpecification, sortDirSpec)
              .where("students.id ilike '%' || :id || '%'", { id: queryIdFilter })
              .andWhere("students.fullName ilike '%' || :fullName || '%'", {
                fullName: queryFullNameFilter,
              })
              .andWhere("school.uid = ANY(:uids)", { uids: attachedSchools })
              .leftJoinAndSelect("students.route", "route")
              .leftJoinAndSelect("students.school", "school")
              .leftJoinAndSelect("students.inRangeStops", "stops")
              .offset(skipNum)
              .limit(takeNum)
              .getManyAndCount();
            response.status(200);
            return {
              students: studentsQueryResult,
              total: total,
            };
          }
          const [studentsQueryResult, total] = await this.studentRepository
            .createQueryBuilder("students")
            .orderBy(sortSpecification, sortDirSpec)
            .where("students.id ilike '%' || :id || '%'", { id: queryIdFilter })
            .andWhere("students.fullName ilike '%' || :fullName || '%'", {
              fullName: queryFullNameFilter,
            })
            .leftJoinAndSelect("students.route", "route")
            .leftJoinAndSelect("students.school", "school")
            .leftJoinAndSelect("students.inRangeStops", "stops")
            .offset(skipNum)
            .limit(takeNum)
            .getManyAndCount();
          response.status(200);
          return {
            students: studentsQueryResult,
            total: total,
          };
        }
      } else {
        if (request.query.showAll && request.query.showAll === "true") {
          if (role == "School Staff") {
            const userId = response.locals.jwtPayload.uid;
            const currentUser = await this.userRepository
              .createQueryBuilder("users")
              .where("users.uid = :uid", { uid: userId })
              .leftJoinAndSelect("users.attachedSchools", "attachedSchools")
              .getOneOrFail();
            const attachedSchools = currentUser.attachedSchools.map(school => school.uid);
            const [studentsQueryResult, total] = await this.studentRepository
              .createQueryBuilder("students")
              .orderBy(sortSpecification, sortDirSpec)
              .where("students.fullName ilike '%' || :fullName || '%'", {
                fullName: queryFullNameFilter,
              })
              .andWhere("school.uid = ANY(:uids)", { uids: attachedSchools })
              .leftJoinAndSelect("students.route", "route")
              .leftJoinAndSelect("students.school", "school")
              .leftJoinAndSelect("students.inRangeStops", "stops")
              .getManyAndCount();
            response.status(200);
            return {
              students: studentsQueryResult,
              total: total,
            };
          }
          const [studentsQueryResult, total] = await this.studentRepository
            .createQueryBuilder("students")
            .orderBy(sortSpecification, sortDirSpec)
            .where("students.fullName ilike '%' || :fullName || '%'", {
              fullName: queryFullNameFilter,
            })
            .leftJoinAndSelect("students.route", "route")
            .leftJoinAndSelect("students.school", "school")
            .leftJoinAndSelect("students.inRangeStops", "stops")
            .getManyAndCount();
          response.status(200);
          return {
            students: studentsQueryResult,
            total: total,
          };
        } else {
          if (role == "School Staff") {
            const userId = response.locals.jwtPayload.uid;
            const currentUser = await this.userRepository
              .createQueryBuilder("users")
              .where("users.uid = :uid", { uid: userId })
              .leftJoinAndSelect("users.attachedSchools", "attachedSchools")
              .getOneOrFail();
            const attachedSchools = currentUser.attachedSchools.map(school => school.uid);
            const [studentsQueryResult, total] = await this.studentRepository
              .createQueryBuilder("students")
              .orderBy(sortSpecification, sortDirSpec)
              .where("students.fullName ilike '%' || :fullName || '%'", {
                fullName: queryFullNameFilter,
              })
              .andWhere("school.uid = ANY(:uids)", { uids: attachedSchools })
              .leftJoinAndSelect("students.route", "route")
              .leftJoinAndSelect("students.school", "school")
              .leftJoinAndSelect("students.inRangeStops", "stops")
              .offset(skipNum)
              .limit(takeNum)
              .getManyAndCount();
            response.status(200);
            return {
              students: studentsQueryResult,
              total: total,
            };
          }
          const [studentsQueryResult, total] = await this.studentRepository
            .createQueryBuilder("students")
            .orderBy(sortSpecification, sortDirSpec)
            .where("students.fullName ilike '%' || :fullName || '%'", {
              fullName: queryFullNameFilter,
            })
            .leftJoinAndSelect("students.route", "route")
            .leftJoinAndSelect("students.school", "school")
            .leftJoinAndSelect("students.inRangeStops", "stops")
            .offset(skipNum)
            .limit(takeNum)
            .getManyAndCount();
          response.status(200);
          return {
            students: studentsQueryResult,
            total: total,
          };
        }
      }
    } catch (e) {
      response.status(401).send("Students were not found with error: " + e);
      return;
    }
  }
  async oneStudent(request: Request, response: Response, next: NextFunction) {
    try {
      const uidNumber = request.params.uid; //needed for the await call / can't nest them
      const usersQueryResult = await this.studentRepository
        .createQueryBuilder("students")
        .where("students.uid = :uid", { uid: uidNumber })
        .leftJoinAndSelect("students.route", "route")
        .leftJoinAndSelect("students.school", "school")
        .leftJoinAndSelect("students.parentUser", "user")
        .leftJoinAndSelect("students.inRangeStops", "inRangeStops")
        .getOneOrFail();
      response.status(200);
      return usersQueryResult;
    } catch (e) {
      response
        .status(401)
        .send("Student with UID: " + request.params.uid + " was not found.");
      return;
    }
  }

  async saveNewStudent(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    try {
      const existingStudent = await this.studentRepository
        .createQueryBuilder("students")
        .leftJoinAndSelect("students.school", "school")
        .leftJoinAndSelect("students.parentUser", "user")
        .leftJoinAndSelect("students.route", "route")
        .leftJoinAndSelect("students.inRangeStops", "inRangeStops")
        .where("school.uniqueName = :school", {
          school: request.body.school.uniqueName,
        })
        .andWhere("user.longitude = :longitude", {
          longitude: request.body.parentUser.longitude,
        })
        .andWhere("user.latitude = :latitude", {
          latitude: request.body.parentUser.latitude,
        })
        .getOne();

      if (existingStudent != undefined) {
        request.body.route = existingStudent.route;
        request.body.inRangeStops = existingStudent.inRangeStops;
      }
      const result = await this.studentRepository.save(request.body);
      response.status(200);
      return result;
    } catch (e) {
      response
        .status(401)
        .send(
          "New Student (" + request.body + ") couldn't be saved with error " + e
        );
      return;
    }
  }

  async updateStudent(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    try {
      const uidNumber = request.params.uid;
      const a = await getConnection()
        .createQueryBuilder()
        .update(Student)
        .where("uid = :uid", { uid: uidNumber })
        .set(request.body)
        .execute();
      response.status(200);
      return a;
    } catch (e) {
      response
        .status(401)
        .send(
          "Student with UID " +
            request.params.uid +
            " and details(" +
            request.body +
            ") couldn't be updated with error " +
            e
        );
      return;
    }
  }

  async deleteStudent(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    try {
      const uidNumber = request.params.uid; //needed for the await call / can't nest them
      const studentQueryResult = await this.studentRepository
        .createQueryBuilder("students")
        .delete()
        .where("students.uid = :uid", { uid: uidNumber })
        .execute();
      response.status(200);
      return studentQueryResult;
    } catch (e) {
      response
        .status(401)
        .send(
          "Student UID: " +
            request.params.uid +
            " was not found adn could not be deleted."
        );
      return;
    }
  }
  findByStudentID(uid: number) {
    return this.createQueryBuilder("students")
      .where("students.uid = :uid", { uid })
      .leftJoinAndSelect("students.route", "route")
      .getOne();
  }
  findByStudentName(fullName: string) {
    return this.createQueryBuilder("students")
      .where("students.fullName = :fullName", { fullName })
      .getOne();
  }
  updateStudentName(studentId: number, fullName: string) {
    return this.createQueryBuilder("students")
      .update()
      .set({ fullName: fullName })
      .where("students.uid = :uid", { studentId })
      .execute();
  }
}

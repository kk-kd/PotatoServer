import { createConnection, getConnection, getRepository } from "typeorm";
import * as dotenv from "dotenv";
import * as bcrypt from "bcryptjs";
import { User } from "../src/entity/User";
import { parse } from "csv-parse";
import * as path from "path";
import * as fs from "fs";
import PQueue from "p-queue";
import { School } from "../src/entity/School";
import { Student } from "../src/entity/Student";

// const suffix = ["Jr.", "Sr."];

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
createConnection().then(async (connection) => {
  //   // delete all data

  //   const entities = getConnection().entityMetadatas;

  //   for (const entity of entities) {
  //     const repository = getConnection().getRepository(entity.name);
  //     await repository.query(
  //       `TRUNCATE ${entity.tableName} RESTART IDENTITY CASCADE;`
  //     );
  //   }

  // // // create Admin
  //   const firstAdmin = new User();
  //   firstAdmin.email = "admin@example.com";
  //   firstAdmin.fullName = "Admin";
  //   firstAdmin.password = await bcrypt.hash("Potato458!", 10);
  //   firstAdmin.address = "1 Fake Street";
  //   firstAdmin.longitude = 0;
  //   firstAdmin.latitude = 0;
  //   firstAdmin.role = "Admin";
  //   firstAdmin.phoneNumber = "555555555";

  //   await connection.manager.save(firstAdmin);

  //   // /**
  //   //  * import parent data
  //   //  */
  //   var XMLHttpRequest = require("xhr2");

  //   const parents = [];
  //   const parents_filename = path.resolve(__dirname, "users-prepop-ev3.csv");
  //   const parents_file = fs.readFileSync(parents_filename, { encoding: "utf-8" });
  //   const parent_parser = parse(parents_file, {
  //     delimiter: ",",
  //     columns: ["email", "name", "address", "phone_number"],
  //   });

  //   parent_parser.on("readable", function () {
  //     let parent_record;
  //     parent_parser.read();
  //     while ((parent_record = parent_parser.read()) !== null) {
  //       parents.push(parent_record);
  //     }
  //   });

  //   const parent_queue = new PQueue({ intervalCap: 20, interval: 1000 });
  //   parent_parser.on("end", function () {
  //     parents.forEach(async (parent) => {
  //       let xhr = new XMLHttpRequest();
  //       const newUser = new User();
  //       newUser.email = parent.email;
  //       newUser.fullName = parent.name;
  //       newUser.role = "None";
  //       newUser.address = parent.address;
  //       newUser.phoneNumber = parent.phone_number;

  //       await parent_queue.add(() => {
  //         xhr.open(
  //           "GET",
  //           `https://maps.googleapis.com/maps/api/geocode/json?address=${parent.address
  //             .split(" ")
  //             .join("+")}&key=${process.env.GOOGLE_MAP_API_KEY}`
  //         );
  //         xhr.send();
  //         xhr.onload = async function () {
  //           if (xhr.status == 200) {
  //             const data = JSON.parse(xhr.responseText);
  //             if (data.results.length > 0) {
  //               const res = data.results[0].geometry.location;
  //               newUser.longitude = res.lng;
  //               newUser.latitude = res.lat;
  //               await connection.manager.save(newUser);
  //             } else {
  //               console.log(
  //                 parent.full_name +
  //                   " does not have a valid address " +
  //                   `https://maps.googleapis.com/maps/api/geocode/json?address=${parent.address
  //                     .split(" ")
  //                     .join("+")}&key=${process.env.GOOGLE_MAP_API_KEY}`
  //               );
  //             }
  //           } else {
  //             console.log("erro xhr: " + parent.full_name);
  //           }
  //         };
  //       });
  //     });
  //   });

  //   // /**
  //   //  * import school data
  //   //  */

  //   const schools = [];
  //   const schools_filename = path.resolve(__dirname, "schools.csv");

  //   const schools_file = fs.readFileSync(schools_filename, { encoding: "utf-8" });
  //   const school_parser = parse(schools_file, {
  //     delimiter: ",",
  //     columns: ["name", "address", "arrivalTime", "departureTime"],
  //   });

  //   school_parser.on("readable", function () {
  //     let record;
  //     school_parser.read();
  //     while ((record = school_parser.read()) !== null) {
  //       schools.push(record);
  //     }
  //   });

  //   const school_queue = new PQueue({ intervalCap: 20, interval: 1000 });
  //   school_parser.on("end", function () {
  //     schools.forEach(async (school) => {
  //       let xhr = new XMLHttpRequest();
  //       const newSchool = new School();
  //       newSchool.name = school.name;
  //       newSchool.uniqueName = school.name
  //         .toLowerCase()
  //         .trim()
  //         .replace(/\s\s+/g, " ");
  //       newSchool.address = school.address;
  //       newSchool.arrivalTime = school.arrivalTime;
  //       newSchool.departureTime = school.departureTime;

  //       await school_queue.add(() => {
  //         xhr.open(
  //           "GET",
  //           `https://maps.googleapis.com/maps/api/geocode/json?address=${school.address
  //             .split(" ")
  //             .join("+")}&key=${process.env.GOOGLE_MAP_API_KEY}`
  //         );
  //         xhr.send();
  //         xhr.onload = async function () {
  //           if (xhr.status == 200) {
  //             const data = JSON.parse(xhr.responseText);
  //             if (data.results.length > 0) {
  //               const res = data.results[0].geometry.location;
  //               newSchool.longitude = res.lng;
  //               newSchool.latitude = res.lat;
  //               await connection.manager.save(newSchool);
  //             } else {
  //               console.log(
  //                 school.full_name +
  //                   " does not have a valid address " +
  //                   `https://maps.googleapis.com/maps/api/geocode/json?address=${school.address
  //                     .split(" ")
  //                     .join("+")}&key=${process.env.GOOGLE_MAP_API_KEY}`
  //               );
  //             }
  //           } else {
  //             console.log("erro xhr: " + school.full_name);
  //           }
  //         };
  //       });
  //     });
  //   });

  //   /**
  //    * import student data
  //    */

  const students = [];
  const students_filename = path.resolve(__dirname, "students-prepop-ev3.csv");

  const students_file = fs.readFileSync(students_filename, {
    encoding: "utf-8",
  });
  const student_parser = parse(students_file, {
    delimiter: ",",
    columns: ["name", "parent_email", "student_id", "school_name"],
  });

  student_parser.on("readable", function () {
    let record;
    student_parser.read();
    while ((record = student_parser.read()) !== null) {
      students.push(record);
    }
  });

  student_parser.on("end", function () {
    students.forEach(async (student) => {
      const newStudent = new Student();
      newStudent.fullName = student.name;
      newStudent.id = student.student_id;

      let studentParent: User = await getRepository(User).findOne({
        where: { email: student.parent_email },
      });
      let studentSchool: School = await getRepository(School).findOne({
        where: {
          uniqueName: student.school_name
            .toLowerCase()
            .trim()
            .replace(/\s\s+/g, " "),
        },
      });

      newStudent.parentUser = studentParent;
      newStudent.school = studentSchool;
      await connection.manager.save(newStudent);
    });
  });
});

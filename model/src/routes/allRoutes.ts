import { UserController } from "../controller/UserController";
import { StudentController } from "../controller/StudentController";
import { RouteController } from "../controller/RouteController";
import { SchoolController } from "../controller/SchoolController";
import { StopController } from "../controller/StopController";

import { Stop } from "../entity/Stop";

/*

COPY PASTABLE DEAFULT CALLS:
GET ALL STUDENTS: all/page=0&size=0&sort=none&sortDir=none
FILTER ALL STUDENTS BY FIRST NAME: filter/page=0&size=0&sort=none&sortDir=none&filterType=firstName&filterData=first
*/

// ALL PARAMETERS MUST BE SPECIFIED IN THE CALL; IN THE WRAPPER CHECK FOR NULL/ABSENT DATA AND CONVERT TO 0
export const allRoutes = [
  /*
    Gets all Users.
    page: number, denotes the number page requested; starts at 0
    size: number, denotes the size of the page requested
    sort: str, denotes the sort rule; options are:
      - "none"
      - any user entity characteristic (firstName, middleName, lastName)
    sortDir: str, denotes the sort direction; options are:
      - "none"
      - "ASC"
      - "DESC"
  */
  {
    method: "get",
    route: "/api/users/all",
    controller: UserController,
    action: "allUsers",
  },
  {
    method: "get",
    route: "/api/stops/all",
    controller: StopController,
    action: "allStops",
  },
  {
    method: "get",
    route: "/api/stops/filter",
    controller: StopController,
    action: "filterAllStops",
  },


  /*
    TODO: CONTAINS is needed, not just having/where exactly
    
    Filters Users to grab less than all.
    page: number, denotes the number page requested; starts at 0
    size: number, denotes the size of the page requested
    sort: str, denotes the sort rule; options are:
      - "none"
      - any user entity column (firstName, middleName, lastName, etc.)
    sortDir: str, denotes the sort direction; options are:
      - "none"
      - "ASC"
      - "DESC"
    filterType: str, denotes what you want to filter by; options are:
      - "none"
      - any User entity column (firstName, middleName, lastName, etc.)
        Check out model/entities/User.ts for all options.
  */
  {
    method: "get",
    route: "/api/users/filter",
    controller: UserController,
    action: "filterAllUsers",
  },
  /*
   Returns one User by UID.
  */
  {
    method: "get",
    route: "/api/users/:uid",
    controller: UserController,
    action: "oneUser",
  },
  {
    method: "get",
    route: "/api/stops/:uid",
    controller: StopController,
    action: "oneStop",
  },
  {
    method: "get",
    route: "/api/user",
    controller: UserController,
    action: "currentUserJWT",
  },
  {
    method: "post",
    route: "/api/users/",
    controller: UserController,
    action: "saveNewUser",
  },
  {
    method: "post",
    route: "/api/stops/",
    controller: StopController,
    action: "saveNewStop",
  },
  {
    method: "put",
    route: "/api/users/:uid",
    controller: UserController,
    action: "updateUser",
  },
  {
    method: "put",
    route: "/api/stops/:uid",
    controller: StopController,
    action: "updateStop",
  },
  {
    method: "post",
    route: "/api/schools",
    controller: SchoolController,
    action: "saveNewSchool",
  },
  {
    method: "put",
    route: "/api/schools/:uid",
    controller: SchoolController,
    action: "updateSchool",
  },
  {
    method: "post",
    route: "/api/routes",
    controller: RouteController,
    action: "saveNewRoute",
  },
  {
    method: "put",
    route: "/api/routes/:uid",
    controller: RouteController,
    action: "updateRoute",
  },
  {
    method: "post",
    route: "/api/students",
    controller: StudentController,
    action: "saveNewStudent",
  },
  {
    method: "put",
    route: "/api/students/:uid",
    controller: StudentController,
    action: "updateStudent",
  },
  {
    method: "delete",
    route: "/api/users/:uid",
    controller: UserController,
    action: "deleteUser",
  },
  {
    method: "delete",
    route: "/api/stops/:uid",
    controller: StopController,
    action: "deleteStop",
  },
  {
    method: "delete",
    route: "/api/students/:uid",
    controller: StudentController,
    action: "deleteStudent",
  },
  {
    method: "delete",
    route: "/api/schools/:uid",
    controller: SchoolController,
    action: "deleteSchool",
  },
  {
    method: "delete",
    route: "/api/routes/:uid",
    controller: RouteController,
    action: "deleteRoute",
  },
  /*
    Gets all Students.
    page: number, denotes the number page requested; starts at 0
    size: number, denotes the size of the page requested
    sort: str, denotes the sort rule; options are:
      - "none"
      - any student entity characteristic (firstName, middleName, lastName, id)
    sortDir: str, denotes the sort direction; options are:
      - "none"
      - "ASC"
      - "DESC"
  */

  {
    method: "get",
    route: "/api/students/all",
    controller: StudentController,
    action: "allStudents",
  },
  /*    
    Filters Students to grab less than all.
    page: number, denotes the number page requested; starts at 0
    size: number, denotes the size of the page requested
    sort: str, denotes the sort rule; options are:
      - "none"
      - any student entity column (firstName, middleName, lastName, etc.)
    sortDir: str, denotes the sort direction; options are:
      - "none"
      - "ASC"
      - "DESC"
    filterType: str, denotes what you want to filter by; options are:
      - "none"
      - any User entity column (firstName, middleName, lastName, etc.)
        Check out model/entities/Student.ts for all options.
  */
  {
    method: "get",
    route: "/api/students/filter",
    controller: StudentController,
    action: "filterAllStudents",
  },
  /*
    Returns one student by UID (not non-unique ID).
  */
  {
    method: "get",
    route: "/api/students/:uid",
    controller: StudentController,
    action: "oneStudent",
  },
  {
    method: "get",
    route: "/api/routes",
    controller: RouteController,
    action: "all",
  },
  {
    method: "get",
    route: "/api/routes/planner/:uid",
    controller: SchoolController,
    action: "oneRoutePlanner"
  },
  /*
    Gets all Schools.
    page: number, denotes the number page requested; starts at 0
    size: number, denotes the size of the page requested
    sort: str, denotes the sort rule; options are:
      - "none"
      - any schools entity characteristic (name, address, etc)
    sortDir: str, denotes the sort direction; options are:
      - "none"
      - "ASC"
      - "DESC"
  */

  {
    method: "get",
    route: "/api/schools/all",
    controller: SchoolController,
    action: "allSchools",
  },
  /*    
    Filters Schools to grab less than all.
    page: number, denotes the number page requested; starts at 0
    size: number, denotes the size of the page requested
    sort: str, denotes the sort rule; options are:
      - "none"
      - any school entity column (name, address)
    sortDir: str, denotes the sort direction; options are:
      - "none"
      - "ASC"
      - "DESC"
    filterType: str, denotes what you want to filter by; options are:
      - "none"
      - any school entity column (name, address, etc.)
        Check out model/entities/School.ts for all options.
  */
  {
    method: "get",
    route: "/api/schools/filter",
    controller: SchoolController,
    action: "filterAllSchools",
  },
  /*
    Returns one school by UID.
  */
  {
    method: "get",
    route: "/api/schools/:uid",
    controller: SchoolController,
    action: "oneSchool",
  },
  /*
    Gets all Routes.
    page: number, denotes the number page requested; starts at 0
    size: number, denotes the size of the page requested
    sort: str, denotes the sort rule; options are:
      - "none"
      - any route entity characteristic (name, description)
    sortDir: str, denotes the sort direction; options are:
      - "none"
      - "ASC"
      - "DESC"
  */

  {
    method: "get",
    route: "/api/routes/all",
    controller: RouteController,
    action: "allRoutes",
  },
  /*    
    Filters Routes to grab less than all.
    page: number, denotes the number page requested; starts at 0
    size: number, denotes the size of the page requested
    sort: str, denotes the sort rule; options are:
      - "none"
      - any route entity column (name, address)
    sortDir: str, denotes the sort direction; options are:
      - "none"
      - "ASC"
      - "DESC"
    filterType: str, denotes what you want to filter by; options are:
      - "none"
      - any route entity column (name, descirption, etc)
        Check out model/entities/Route.ts for all options.
  */
  {
    method: "get",
    route: "/api/routes/filter",
    controller: RouteController,
    action: "filterAllRoutes",
  },
  /*
    Returns one school by UID.
  */
  {
    method: "get",
    route: "/api/routes/:uid",
    controller: RouteController,
    action: "oneRoute",
  },

  {
    method: "get",
    route: "/api/routes/sort/page=:page&size=:size&sort=:sort&sortDir=:sortDir",
    controller: RouteController,
    action: "sortAllRoutes",
  },
];

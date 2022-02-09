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

export const allRoutes = [
  /*
    Gets all from table.
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
    route: "/api/schools/all",
    controller: SchoolController,
    action: "allSchools",
  },
  {
    method: "get",
    route: "/api/students/all",
    controller: StudentController,
    action: "allStudents",
  },
  {
    method: "get",
    route: "/api/routes/all",
    controller: RouteController,
    action: "allRoutes",
  },

  // Saves, updates, or deletes a new entity to a table

  {
    method: "post",
    route: "/api/users/",
    controller: UserController,
    action: "saveNewUser",
  },
  {
    method: "put",
    route: "/api/users/:uid",
    controller: UserController,
    action: "updateUser",
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
    method: "post",
    route: "/api/stops",
    controller: StopController,
    action: "saveNewStop",
  },
  {
    method: "put",
    route: "/api/stops/:uid",
    controller: StopController,
    action: "updateStop",
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
    Returns one entity from Table.
  */
  {
    method: "get",
    route: "/api/schools/:uid",
    controller: SchoolController,
    action: "oneSchool",
  },
  {
    method: "get",
    route: "/api/students/:uid",
    controller: StudentController,
    action: "oneStudent",
  },
  {
    method: "get",
    route: "/api/routes/:uid",
    controller: RouteController,
    action: "oneRoute",
  },
  {
    method: "get",
    route: "/api/stops/:uid",
    controller: StopController,
    action: "oneStop",
  },
  {
    method: "get",
    route: "/api/users/:uid",
    controller: UserController,
    action: "oneUser",
  },
  /*    
    Filters table to grab less than all.
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
  {
    method: "get",
    route: "/api/schools/filter",
    controller: SchoolController,
    action: "filterAllSchools",
  },
  {
    method: "get",
    route: "/api/users/filter",
    controller: UserController,
    action: "filterAllUsers",
  },
  {
    method: "get",
    route: "/api/students/filter",
    controller: StudentController,
    action: "filterAllStudents",
  },


  // Random Specific API Calls for specific, non-generalizable functionality:
  {
    method: "get",
    route: "/api/user",
    controller: UserController,
    action: "currentUserJWT",
  },

  {
    method: "get",
    route: "/api/routes/sort/page=:page&size=:size&sort=:sort&sortDir=:sortDir",
    controller: RouteController,
    action: "sortAllRoutes",
  },
  {
    method: "get",
    route: "/api/routes/planner/:uid",
    controller: SchoolController,
    action: "oneRoutePlanner"
  },

];

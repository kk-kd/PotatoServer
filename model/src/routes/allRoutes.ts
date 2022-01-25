import { UserController } from "../controller/UserController";
import { StudentController } from "../controller/StudentController";
import { RouteController } from "../controller/RouteController";
import { SchoolController } from "../controller/SchoolController";

export const allRoutes = [
  {
    method: "get",
    route: "/api/users",
    controller: UserController,
    action: "all",
  },
  {
    method: "get",
    route: "/api/users/:id",
    controller: UserController,
    action: "one",
  },
  {
    method: "post",
    route: "/api/users",
    controller: UserController,
    action: "saveUser",
  },
  {
    method: "delete",
    route: "/api/users/:id",
    controller: UserController,
    action: "deleteUser",
  },
  {
    method: "get",
    route: "/api/students",
    controller: StudentController,
    action: "all",
  },
  {
    method: "get",
    route: "/api/routes",
    controller: RouteController,
    action: "all",
  },
  {
    method: "get",
    route: "/api/schools",
    controller: SchoolController,
    action: "all",
  },
];

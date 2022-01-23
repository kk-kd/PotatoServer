import { UserController } from "./controller/UserController";
import { StudentController } from "./controller/StudentController";
import { RouteController } from "./controller/RouteController";
import { SchoolController } from "./controller/SchoolController";

export const Routes = [
  {
    method: "get",
    route: "/users",
    controller: UserController,
    action: "all",
  },
  {
    method: "get",
    route: "/users/:id",
    controller: UserController,
    action: "one",
  },
  {
    method: "post",
    route: "/users",
    controller: UserController,
    action: "saveUser",
  },
  {
    method: "delete",
    route: "/users/:id",
    controller: UserController,
    action: "deleteUser",
  },
  {
    method: "get",
    route: "/students",
    controller: StudentController,
    action: "all",
  },
  {
    method: "get",
    route: "/routes",
    controller: RouteController,
    action: "all",
  },
  {
    method: "get",
    route: "/schools",
    controller: SchoolController,
    action: "all",
  },
];

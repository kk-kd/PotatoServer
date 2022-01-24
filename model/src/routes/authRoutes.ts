import { Router } from "express";
import { checkJwt } from "../middlewares/checkJwt";
import AuthController from "../controller/AuthController";

const authRoutes = Router();
//Login route
authRoutes.post("/login", AuthController.login);
authRoutes.post("register", AuthController.register);

//Change my password
authRoutes.post("/change-password", [checkJwt], AuthController.changePassword);

export default authRoutes;

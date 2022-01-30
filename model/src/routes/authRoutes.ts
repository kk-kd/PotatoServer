import { Router } from "express";
import { checkJwt } from "../middlewares/checkJwt";
import AuthController from "../controller/AuthController";

const authRoutes = Router();

authRoutes.post("/login", AuthController.login);
authRoutes.post("/register", AuthController.register);
authRoutes.post("/change-password", [checkJwt], AuthController.changePassword);
authRoutes.post("/make-admin", [checkJwt], AuthController.makeAdmin);

export default authRoutes;

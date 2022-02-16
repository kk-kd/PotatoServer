import { Router } from "express";
import { checkJwt } from "../middlewares/checkJwt";
import AuthController from "../controller/AuthController";

const authRoutes = Router();

authRoutes.post("/login", AuthController.login);
authRoutes.post("/register", AuthController.register);
authRoutes.post("/change-password", [checkJwt], AuthController.changePassword);
authRoutes.post("/reset-password/:token", AuthController.changePassword);
authRoutes.post(
  "/request-password-reset",
  [checkJwt],
  AuthController.changePassword
);

export default authRoutes;

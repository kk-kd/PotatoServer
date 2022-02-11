import * as express from "express";
import * as bodyParser from "body-parser";
import { Request, Response } from "express";
import { allRoutes } from "./routes/allRoutes";
import authRoutes from "./routes/authRoutes";
import { checkJwt } from "./middlewares/checkJwt";
require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` });

// create express app
const app = express();
app.use(bodyParser.json());
app.use("/api", authRoutes);
// var cors = require("cors"); //neeeded? cady: beaware - use cors cause potential security problems
// app.use(cors()); //etc ^
// // register all express routes from defined application routes
allRoutes.forEach((route) => {
  (app as any)[route.method](
    route.route,
    // [checkJwt],
    (req: Request, res: Response, next: Function) => {
      const result = new (route.controller as any)()[route.action](
        req,
        res,
        next
      );
      if (result instanceof Promise) {
        result.then((result) =>
          result !== null && result !== undefined ? res.send(result) : undefined
        );
      } else if (result !== null && result !== undefined) {
        res.json(result);
      }
    }
  );
});

// setup express app here
const path = require("path");
app.use(express.static(path.join(__dirname, "..", "..", "view", "build")));
app.get("/*", function (req, res) {
  res.sendFile(path.join(__dirname, "..", "..", "view", "build", "index.html"));
});

export default app;

import "reflect-metadata";
import { Connection, createConnection, getConnection } from "typeorm";
import * as express from "express";
import * as bodyParser from "body-parser";
import { Request, Response } from "express";
import { Routes } from "./routes";
import { User } from "./entity/User";
import { UserController } from "./controller/UserController";
import { School } from "./entity/School";


createConnection()
  .then(async (connection) => {
    // create express app
    const app = express();
    app.use(bodyParser.json());
    var cors = require('cors')
    app.use(cors())
    // register all express routes from defined application routes
    Routes.forEach((route) => {
      (app as any)[route.method](
        route.route,
        (req: Request, res: Response, next: Function) => {
          const result = new (route.controller as any)()[route.action](
            req,
            res,
            next
          );
          if (result instanceof Promise) {
            result.then((result) =>
              result !== null && result !== undefined
                ? res.send(result)
                : undefined
            );
          } else if (result !== null && result !== undefined) {
            res.json(result);
          }
        }
      );
    });

    // setup express app here
    // ...

    // start express server
    app.listen(3000);
    
    
    
    
    // Clean Database before creation:
    await getConnection()
    .createQueryBuilder()
    .delete()
    .from("users")
    .execute();


    const userRepository = connection.getCustomRepository(UserController);
    await userRepository.delete({uid: 2})

    let nameIter: string[] = ["first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth", "tenth"];
    var count = .1;
    var AdminBoolean = false;
    for (var userNumber in nameIter)
    {
      AdminBoolean = !AdminBoolean;
      count = count + 1;
      const userName = nameIter[userNumber] + "User";
      const newUser = new User();
      newUser.email =  userName + "Email@email.com";
      newUser.firstName = userName + "FirstName";
      newUser.middleName =  userName + "MiddleName";
      newUser.lastName = userName + "LastName";
      newUser.address = userName + " address Road";
      newUser.longitude = count;
      newUser.latitude = count - 1;
      newUser.isAdmin = AdminBoolean;
      await userRepository.save(newUser);
    }


    // Find the person we just saved to the database using the custom query
    // method we wrote in the person repository.
    const existingUser = await userRepository.findByUserName(
      "FirstUserFirstName"
    );

    // else{
    //   await userRepository.updateUserName(existingUser.uid, "Test 2 New First Name", "Test 2 New Middle Name", "Test 2 New Last Name");
    // }


    // // insert new users for test
    // await connection.manager.save(
    //   connection.manager.create(User, {
    //     email: "jdm109@duk.edu",
    //     firstName: "Jackson",
    //     lastName: "McNabb",
    //     address: "102 Example Lane",
    //     longitude: 32.5,
    //     latitude: 432.54,
    //     isAdmin: false,
    //   })
    // );

    // await connection.manager.save(
    //   connection.manager.create(School, {

    //   })
    // )

    console.log(
      "Express server has started on port 3000. Open http://localhost:3000/users to see results"
    );

    console.log();
  })
  .catch((error) => console.log(error));

import { createConnection, getConnection, getRepository } from "typeorm";
import { Geo } from "../entity/Geo";
require("dotenv").config({ path: `../.env.${process.env.NODE_ENV}` });

const test = async () => {
  const getLoc = async (timeCreated: string) => {
    return await getRepository(Geo).findOne({
      where: { timeCreated: timeCreated },
    });
  };

  const saveNewLoc = async () => {
    var newLoc = new Geo();
    newLoc.address = "a";

    newLoc.timeCreated = new Date().toISOString();
    newLoc.latitude = 0;
    newLoc.longitude = 0;

    await getRepository(Geo).save(newLoc);

    return newLoc.timeCreated;
  };

  const getTimeDiff = async () => {
    var loc = await getRepository(Geo).findOne({ where: { address: "a" } });

    console.log(loc.timeCreated);
    const timeThen = new Date(loc.timeCreated);
    const timeNow = new Date();
    console.log(timeNow);
    console.log(timeThen.getTime() - timeNow.getTime());
  };

  await createConnection();
  // const timeC = await saveNewLoc();
  // console.log("NewLoc: " + timeC);
  // console.log("getLoc: " + (await getLoc(timeC)));
  getTimeDiff();
};

test().then(() => {
  console.log("done");
});

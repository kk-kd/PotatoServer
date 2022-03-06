import { createConnection, getConnection, getRepository } from "typeorm";
import { Geo } from "../entity/Geo";
import { getLngLat } from "./GeoHelper";
require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` });

const databaseTest = async () => {
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
  // getTimeDiff();
};

const bulkCalling = async () => {
  await createConnection();
  const addressIter: string[] = [
    "4500 Margalo Avenue, Bakersfield, CA 93313",
    "7800 River Mist Avenue, Bakersfield, CA 93313",
    "21950 Arnold Center Road, Carson, CA 90810",
    "10202 Vista Drive, Cupertino, CA 95014",
    "5397 Wentworth Avenue, Oakland, CA 94601",
    "2708 Mabel Street, Berkeley, CA 94702",
    "26466 Mockingbird Lane, Hayward, CA 94544",
    "2443 Sierra Nevada Road, Mammoth Lakes, CA 93546",
    "3027 Badger Drive, Pleasanton, CA 94566",
  ];

  addressIter.map(async (addr) => {
    console.log(await getLngLat(addr));
  });
};

bulkCalling().then(() => {
  console.log("done");
});

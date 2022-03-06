import { getConnection, getRepository } from "typeorm";
import { Geo } from "../entity/Geo";
import fetch from "node-fetch";
// import PQueue from "p-queue";

const EXPIRATION_TIME = 24 * 60 * 60 * 1000;

export const getLngLat = async (address: string) => {
  const geoRepository = getRepository(Geo);
  const existingEntry = await geoRepository
    .createQueryBuilder("geo")
    .where("geo.address = :address", { address: address })
    .getOne();

  const currentTime = new Date();

  if (existingEntry != undefined) {
    if (
      currentTime.getTime() - new Date(existingEntry.timeCreated).getTime() <
      EXPIRATION_TIME
    ) {
      return {
        longitude: existingEntry.longitude,
        latitude: existingEntry.latitude,
      };
    } else {
      await geoRepository.delete(existingEntry.uid);
    }
  }

  var newLoc = new Geo();
  newLoc.address = address;
  newLoc.timeCreated = currentTime.toISOString();

  // const q = new PQueue({ intervalCap: 2, interval: 1000 });
  // await q.add(() => {

  // });
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${address
      .split(" ")
      .join("+")}&key=${process.env.GOOGLE_MAP_API_KEY}`
  );
  const data = await response.json();
  // console.log(data);
  newLoc.longitude = data.results[0].geometry.location.lng;
  newLoc.latitude = data.results[0].geometry.location.lat;
  await getConnection().manager.save(newLoc);

  return {
    longitude: newLoc.longitude.toString(),
    latitude: newLoc.latitude.toString(),
  };
};

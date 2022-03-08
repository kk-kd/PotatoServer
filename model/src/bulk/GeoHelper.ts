import { getConnection, getRepository } from "typeorm";
import { Geo } from "../entity/Geo";
import fetch from "node-fetch";

const EXPIRATION_TIME = 3 * 24 * 60 * 60 * 1000;

export const getLngLat = async (address: string) => {
  const geoRepository = getRepository(Geo);
  const existingEntry = await geoRepository
    .createQueryBuilder("geo")
    .where("geo.address = :address", { address: address })
    .getOne();

  const currentTime = new Date();

  try {
    if (existingEntry != undefined) {
      if (
        currentTime.getTime() - new Date(existingEntry.timeCreated).getTime() <
        EXPIRATION_TIME
      ) {
        console.log("Fetched from database.");
        return {
          longitude: existingEntry.longitude,
          latitude: existingEntry.latitude,
        };
      } else {
        await geoRepository.delete(existingEntry.uid);
      }
    }
  } catch (error) {
    console.log(error);
    throw "Failed to fetch address from cache.";
  }
  var newLoc = new Geo();
  newLoc.address = address;
  newLoc.timeCreated = currentTime.toISOString();

  try {
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
  } catch (error) {
    console.log(
      `Google Map Address Fetch Failed: ${error.name}, ${error.message}`
    );
    throw "Failed to fetch address from google api";
  }

  console.log("Called Google.");
  return {
    longitude: newLoc.longitude.toString(),
    latitude: newLoc.latitude.toString(),
  };
};

import { getConnection, getRepository } from "typeorm";
import { Geo } from "../entity/Geo";
import PQueue from "p-queue";
import XMLHttpRequest from "xhr2";

const EXPIRATION_TIME = 24 * 60 * 60 * 1000;

export const getLngLat = async (address: string) => {
  const geoRepository = getRepository(Geo);
  const existingEntry = await geoRepository
    .createQueryBuilder("geo")
    .where("geo.address = :address", { address: address })
    .getOne();

  const currentTime = new Date();

  if (
    existingEntry != undefined &&
    currentTime.getTime() - new Date(existingEntry.timeCreated).getTime() <
      EXPIRATION_TIME
  ) {
    return {
      longitude: existingEntry.longitude,
      latitude: existingEntry.latitude,
    };
  }

  var newLoc = new Geo();
  newLoc.address = address;
  newLoc.timeCreated = currentTime.toISOString();

  const q = new PQueue({ intervalCap: 40, interval: 1000 });
  let xhr = new XMLHttpRequest();
  await q.add(() => {
    xhr.open(
      "GET",
      `https://maps.googleapis.com/maps/api/geocode/json?address=${address
        .split(" ")
        .join("+")}&key=${process.env.GOOGLE_MAP_API_KEY}`
    );
    xhr.send();
    xhr.onload = async function () {
      if (xhr.status == 200) {
        const data = JSON.parse(xhr.responseText);
        if (data.results.length > 0) {
          const res = data.results[0].geometry.location;
          newLoc.longitude = res.lng;
          newLoc.latitude = res.lat;
          await getConnection().manager.save(newLoc);
        } else {
          console.log(
            address +
              " does not have a valid address " +
              `https://maps.googleapis.com/maps/api/geocode/json?address=${address
                .split(" ")
                .join("+")}&key=${process.env.GOOGLE_MAP_API_KEY}`
          );
        }
      }
    };
  });

  return {
    longitude: newLoc.longitude,
    latitude: newLoc.latitude,
  };
};

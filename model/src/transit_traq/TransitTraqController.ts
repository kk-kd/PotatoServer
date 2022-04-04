import { getConnection, getRepository } from "typeorm";
import { Request, Response } from "express";
import { Run } from "../entity/Run";
import { TransitTraqHelper } from "./TransitTraqHelper";
import fetch from "node-fetch";

const LOW_PRIORITY = 500;
const NEEDS_REFRESH = 1000;

export class TransitTraqController {
  async getBusLocation(request: Request, response: Response) {
    const { busNumber } = request.body;

    const existingEntry = await getRepository(Run)
      .createQueryBuilder("run")
      .where("run.busNumber = :busNumber", { busNumber: busNumber })
      .andWhere("run.ongoing = :ongoing", { ongoing: true })
      .getOne();

    if (existingEntry == undefined) {
      response.status(401).send("The bus requested is not running.");
      return;
    }

    const currentTime = new Date();

    if (existingEntry.lastFetchTime != null) {
      // fetch from database
      var timeElapsed =
        currentTime.getTime() - new Date(existingEntry.lastFetchTime).getTime();

      if (timeElapsed < NEEDS_REFRESH) {
        console.log(`Bus location ${busNumber} fetched from database.`);
        response.status(200).send({ ...existingEntry, latest: true });

        if (timeElapsed > LOW_PRIORITY) {
          console.log("Job fetching location added to queue");
          TransitTraqHelper.addRequestedBus(busNumber);
        }
        return;
      }
    }

    // fetch from transit traq
    const newLoc = await this.fetchBusLocationFromTransitTraq(
      existingEntry.busNumber
    );

    // if overtime and failed to fetch from transit traq
    if (
      !("bus" in newLoc) ||
      !("lat" in newLoc) ||
      !("lng" in newLoc) ||
      newLoc.bus != existingEntry.busNumber
    ) {
      TransitTraqHelper.addOutdatedBus(busNumber);
      response
        .status(200)
        .send({ ...existingEntry, latest: false, timeElapsed: timeElapsed });
    }

    // if successfully fetched, return and save
    try {
      existingEntry.longitude = newLoc.lng;
      existingEntry.latitude = newLoc.lat;
      existingEntry.lastFetchTime = currentTime.toISOString();

      await getConnection().manager.save(existingEntry);
    } catch (e) {
      console.log("RunController: failed to save new location to the database");
    }

    response.status(200).send({ ...existingEntry, latest: true });
  }

  async fetchBusLocationFromTransitTraq(busId) {
    const response = await fetch(
      `http://tranzit.colab.duke.edu:8000/get?bus=${busId}`
    );
    const responseJson = await response.json();
    return responseJson;
  }
}

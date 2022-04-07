import fetch from "node-fetch";
import { getConnection, getRepository } from "typeorm";
import { Run } from "../entity/Run";
import { LOW_PRIORITY } from "./TransitTraqController";
const Queue = require("bull");

const DEBUG = true;
const LOWEST_PRIORITY = 20;
const PRIORITY_OUTDATED = LOWEST_PRIORITY - 2;
const PRIORITY_REQUESTED = LOWEST_PRIORITY - 1;

const ABORT_MESSAGE = "abort";
const NO_RECORD_MESSAGE = "no record";

export class TransitTraqHelper {
  static busQueue = new Queue("bus", "redis://127.0.0.1:6379", {
    limiter: {
      max: 10,
      duration: 1000,
    },
  });

  static async initQueue() {
    TransitTraqHelper.busQueue.process(5, async (job) => {
      const existingEntry = await getRepository(Run)
        .createQueryBuilder("run")
        .where("run.busNumber = :busNumber", { busNumber: job.data.busId })
        .andWhere("run.ongoing = :ongoing", { ongoing: true })
        .getOne();

      if (existingEntry == undefined) {
        return NO_RECORD_MESSAGE;
      }

      // TODO: check the logic here
      if (
        job.data.requestedTime -
          new Date(existingEntry.lastFetchTime).getTime() <
        LOW_PRIORITY
      ) {
        return ABORT_MESSAGE;
      }

      const dst = `http://tranzit.colab.duke.edu:8000/get?bus=${job.data.busId}`;
      console.log(`fetching from ${dst}`);

      const response = await fetch(dst);
      const responseJson = await response.json();
      return responseJson;
    });

    if (DEBUG) {
      TransitTraqHelper.busQueue.on("progress", (job, progress) => {
        console.log(`Job ${job.json} in progress: ${progress.json}`);
      });

      TransitTraqHelper.busQueue.on("waiting", (job) => {
        console.log(`Job ${job.json} waiting`);
      });
    }

    // If failed, result = 'unknown bus'
    // If succeede, result = { bus: '7000', lat: 26.89855408395368, lng: -101.5380859375 }
    TransitTraqHelper.busQueue.on("completed", async (job, result) => {
      console.log(`TransitTraqHelper: Retrieve bus location, job completed`);
      console.log(result);

      if (
        typeof result != "object" ||
        !("bus" in result) ||
        !("lat" in result) ||
        !("lng" in result)
      ) {
        console.log("Seems like an invalid response");
        if (!(result === NO_RECORD_MESSAGE || result === ABORT_MESSAGE)) {
          var saveStatus = this.saveNewBusLocationToDatabase(result, false);
        }
      } else {
        saveStatus = this.saveNewBusLocationToDatabase(result, true);
      }

      if (!saveStatus) {
        console.log("Something's wrong when saving to the database");
      }
    });
  }

  private static async saveNewBusLocationToDatabase(
    response,
    isValidResponse: boolean
  ) {
    const existingEntry = await getRepository(Run)
      .createQueryBuilder("run")
      .where("run.busNumber = :busNumber", { busNumber: response.bus })
      .andWhere("run.ongoing = :ongoing", { ongoing: true })
      .getOne();

    if (existingEntry == undefined) {
      return false;
    }

    if (isValidResponse) {
      await saveValidResponse(existingEntry, response);
      return false;
    } else {
      await getConnection().manager.save({ ...existingEntry, TTErroro: true });
      return true;
    }
  }

  static addOutdatedBus(data) {
    this.addBusNumberToQueueWithPriority(data, PRIORITY_OUTDATED);
  }

  static addRequestedBus(data) {
    this.addBusNumberToQueueWithPriority(data, PRIORITY_REQUESTED);
  }

  static addBusNumberToQueueWithPriority(data, p) {
    TransitTraqHelper.busQueue.add(
      { busId: data, requestedTime: new Date().getTime() },
      {
        priority: p,
        timeout: 2000,
        attempts: 3,
      }
    );
  }
}

async function saveValidResponse(existingEntry: Run, response) {
  let newEntry = {
    ...existingEntry,
    longitude: response.lng,
    latitude: response.lat,
    lastFetchTime: new Date().toISOString(),
    TTErroro: false,
    latest: true,
  };
  try {
    await getRepository(Run).save(newEntry);
  } catch (e) {
    console.log(
      "TransitTraqHelper: failed to save new location to the database: " + e
    );

    try {
      existingEntry.TTErroro = true;
      await getRepository(Run).save(existingEntry);
    } catch (e) {
      console.log(
        "TransitTraqHelper: save failed again. Please insepct the database."
      );
    }
  }
}
// TransitTraqHelper.initQueue();
// TransitTraqHelper.addBusNumberToQueue({ busId: 7000 });

import fetch from "node-fetch";
import { getConnection, getRepository } from "typeorm";
import { Run } from "../entity/Run";
const Queue = require("bull");
const DEBUG = true;
const LOWEST_PRIORITY = 20;
const PRIORITY_OUTDATED = LOWEST_PRIORITY - 2;
const PRIORITY_REQUESTED = LOWEST_PRIORITY - 1;

export class TransitTraqHelper {
  static busQueue = new Queue("bus", "redis://127.0.0.1:6379", {
    limiter: {
      max: 10,
      duration: 1000,
    },
  });

  static async initQueue() {
    TransitTraqHelper.busQueue.process(async (job) => {
      // console.log(job);
      const response = await fetch(
        `http://tranzit.colab.duke.edu:8000/get?bus=${job.data.busId}`
      );
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

      if (!("bus" in result) || !("lat" in result) || !("lng" in result)) {
        console.log("Seems like an invalid response");
      }

      const saveStatus = this.saveNewBusLocationToDatabase(result);
      if (!saveStatus) {
        console.log("Something's wrong when saving to the database");
      }
    });
  }

<<<<<<< HEAD
  private static async saveNewBusLocationToDatabase(response) {
    const existingEntry = await getRepository(Run)
      .createQueryBuilder("run")
      .where("run.busNumber = :busNumber", { busNumber: response.bus })
      .andWhere("run.ongoing = :ongoing", { ongoing: true })
      .getOne();

    if (existingEntry == undefined) {
      return false;
    }
    try {
      existingEntry.longitude = response.lng;
      existingEntry.latitude = response.lat;
      existingEntry.lastFetchTime = new Date().toISOString();
      await getConnection().manager.save(existingEntry);
    } catch (e) {
      console.log(
        "TransitTraqHelper: failed to save new location to the database"
      );
      return false;
    }

    return true;
  }

=======
>>>>>>> 9a5eb921d532e295d834eaad95b688c348c61e49
  static addOutdatedBus(data) {
    this.addBusNumberToQueueWithPriority(data, PRIORITY_OUTDATED);
  }

  static addRequestedBus(data) {
    this.addBusNumberToQueueWithPriority(data, PRIORITY_REQUESTED);
  }
<<<<<<< HEAD
=======
  s;
>>>>>>> 9a5eb921d532e295d834eaad95b688c348c61e49

  static addBusNumberToQueueWithPriority(data, p) {
    TransitTraqHelper.busQueue.add(data, {
      priority: p,
      timeout: 2000,
      attempts: 3,
    });
  }
}

// TransitTraqHelper.initQueue();
// TransitTraqHelper.addBusNumberToQueue({ busId: 7000 });

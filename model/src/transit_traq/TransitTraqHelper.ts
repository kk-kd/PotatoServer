import fetch from "node-fetch";
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

  static initQueue() {
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
    TransitTraqHelper.busQueue.on("completed", (job, result) => {
      console.log(`Job completed`);
      console.log(result);
    });
  }

  static addOutdatedBus(data) {
    this.addBusNumberToQueueWithPriority(data, PRIORITY_OUTDATED);
  }

  static addRequestedBus(data) {
    this.addBusNumberToQueueWithPriority(data, PRIORITY_REQUESTED);
  }
  s;

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

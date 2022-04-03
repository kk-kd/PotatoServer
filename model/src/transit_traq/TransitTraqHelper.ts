import { connect } from "http2";
import fetch from "node-fetch";
const Queue = require("bull");
const DEBUG = false;

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
        console.log(`Job ${job} in progress: ${progress}`);
      });

      TransitTraqHelper.busQueue.on("waiting", (job) => {
        console.log(`Job ${job} waiting`);
      });
    }

    // If failed, result = 'unknown bus'
    // If succeede, result = { bus: '7000', lat: 26.89855408395368, lng: -101.5380859375 }
    TransitTraqHelper.busQueue.on("completed", (job, result) => {
      console.log(`Job completed`);
      console.log(result);
    });
  }

  static addBusNumberToQueue(data) {
    TransitTraqHelper.busQueue.add(data);
  }
}

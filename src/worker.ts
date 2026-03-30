import {
  getNextJob,
  markJobAsCompleted,
  markJobAsFailed,
  getSubscribers,
  markDelivered,
  markFailed,
  deliveryAttempts,
} from "./db/queries.js";
import { addData, transformData, filterData } from "./actions.js";

const POLL_INTERVAL = 0.5 * 60 * 1000;

async function pollTask() {
  try {
    console.log("Running query script...");

    // Perform async task (e.g., DB query)
    let job = await getNextJob();

    if (!job) {
      console.log("No jobs found");
      return;
    }
    console.log(`Processing job ${job.id} with action ${job.actions}`);
    try {
      const resultData = await runPipeline(job);

      if (!resultData || Object.keys(resultData).length === 0) {
        await markJobAsFailed(job.id, "Filtered out or no result");
        return;
      }

      job = await markJobAsCompleted(job.id, resultData);
      const subscribers = await getSubscribers(job.pipeline_id);
      console.log(subscribers);
      if (!subscribers || subscribers.length === 0) {
        return;
      } else {
        await deliverJob(subscribers, job);
      }
    } catch (err: any) {
      job = await markJobAsFailed(job.id, err.message);
    }
  } catch (err) {
    console.error("Worker error:", err);
  } finally {
    // Schedule next run only after this one finishes
    setTimeout(pollTask, POLL_INTERVAL);
  }
}

// Start the first poll
setTimeout(pollTask, POLL_INTERVAL);

// Start immediately
// pollTask();

async function runPipeline(job: any): Promise<any> {
  let data = job.payload;

  if (!job.actions || job.actions.length === 0) {
    console.log("No actions defined for pipeline");
    return data;
  }

  for (const action of job.actions) {
    switch (action) {
      case "filter":
        data = filterData(data);
        break;
      case "transform":
        data = transformData(data);
        break;
      case "add":
        data = addData(data);
        break;
    }
  }
  return data;
}

async function deliverJob(subscribers: any, job: any) {
  const failedSubscribers: any[] = [];

  for (const subscriber of subscribers) {
    try {
      const res = await sendHttpReq(subscriber, job.result);
      const delivery = await deliveryAttempts(job.id, subscriber.id);

      if (res.ok) {
        console.log(`Delivered to subscriber ${subscriber.id}`);
        await markDelivered(job.id, subscriber.id);
      } else {
        console.log(
          `Failed delivery to subscriber ${subscriber.id}, attempt ${delivery.attempts}`,
        );

        if (delivery.attempts >= 3) {
          await markFailed(job.id, subscriber.id);
        } else {
          failedSubscribers.push(subscriber);
        }
      }
    } catch (err: any) {
      console.error(`Error for subscriber ${subscriber.id}: ${err.message}`);

      const delivery = await deliveryAttempts(job.id, subscriber.id);

      if (delivery.attempts >= 3) {
        await markFailed(job.id, subscriber.id);
      } else {
        failedSubscribers.push(subscriber);
      }
    }
  }

  // retry
  console.log(`failedSubscribers:`, failedSubscribers);
  if (failedSubscribers.length > 0) {
    console.log(`Retrying ${failedSubscribers.length} subscribers...`);
    await sleep(2000);
    await deliverJob(failedSubscribers, job);
  }
}

async function sendHttpReq(subscriber: any, result: any) {
  const res = await fetch(subscriber.subscriber_url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(result),
  });
  return res;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

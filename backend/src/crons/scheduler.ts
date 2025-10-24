import cron from "node-cron";
import { processRecurringTransactions } from "./jobs/transaction.job.js";
import { processReportJob } from "./jobs/report.job.js";

const scheduleJob = (name: string, time: string, job: Function) => {
  console.log(`Scheduling ${name} at ${time}`);

  return cron.schedule(
    time,
    async () => {
      try {
        await job();
      } catch (error) {
        console.log(`${name} failed`, error);
      }
    },
    { timezone: "UTC" }
  );
};

export const startJobs = () => {
  return [
    scheduleJob("Transactions", "5 0 * * *", processRecurringTransactions),

    // run 2:30am Every 1st of the month
    scheduleJob("Reports", "30 2 1 * *", processReportJob),
  ];
};

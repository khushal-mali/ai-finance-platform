import { startJobs } from "./scheduler.js";

export const initializeCrons = async () => {
  try {
    const jobs = startJobs();
    console.log(`${jobs.length} cron job initialized.`);
    return jobs;
  } catch (error) {
    console.log("CRON INIT ERROR:", error);
    return [];
  }
};

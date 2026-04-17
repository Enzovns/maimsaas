/**
 * Standalone cron script for running outside of Vercel (e.g. with node-cron on a VPS).
 * Run: npx ts-node src/scripts/cron-sender.ts
 *
 * For Vercel deployments, use the vercel.json cron job instead (see /api/cron/send).
 */

import cron from "node-cron";
import { sendDailyCVs } from "../lib/cv-sender";

// 8am AWST = UTC+8 = 0:00 UTC
const CRON_SCHEDULE = "0 0 * * *";

console.log("MineApply cron sender started. Scheduled for 8am AWST daily.");

cron.schedule(CRON_SCHEDULE, async () => {
  console.log(`[${new Date().toISOString()}] Running daily CV send...`);
  try {
    const result = await sendDailyCVs();
    console.log(
      `[${new Date().toISOString()}] Done. Processed: ${result.processed} users.`
    );
    if (result.errors.length > 0) {
      console.error("Errors:", result.errors);
    }
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Fatal error:`, err);
  }
}, {
  timezone: "UTC",
});

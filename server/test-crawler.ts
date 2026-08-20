/**
 * Standalone crawler test — run with:
 *   npx tsx test-crawler.ts
 */

import { crawlAllHackathons } from "./src/crawler/hackathonCrawler";

async function main() {
  console.log("=".repeat(60));
  console.log(" SKILLVERSE HACKATHON CRAWLER — TEST RUN");
  console.log("=".repeat(60));

  const t = Date.now();
  const hackathons = await crawlAllHackathons();
  const elapsed = Date.now() - t;

  console.log(`\n✅  ${hackathons.length} hackathons fetched in ${elapsed}ms\n`);

  hackathons.forEach((h, i) => {
    console.log(`[${String(i + 1).padStart(2, "0")}] ${h.title}`);
    console.log(`      Source      : ${h.source}`);
    console.log(`      Organizer   : ${h.organizer ?? "—"}`);
    console.log(`      URL         : ${h.eventUrl}`);
    console.log(`      Location    : ${h.location ?? "—"}`);
    console.log(`      Online      : ${h.isOnline}`);
    console.log(`      Dates       : ${h.startDate ? new Date(h.startDate).toDateString() : "—"} → ${h.endDate ? new Date(h.endDate).toDateString() : "—"}`);
    console.log(`      Deadline    : ${h.registrationDeadline ? new Date(h.registrationDeadline).toDateString() : "—"}`);
    console.log(`      Description : ${h.description ?? "—"}`);
    if (h.technologies.length > 0) {
      console.log(`      Technologies: ${h.technologies.join(", ")}`);
    }
    console.log();
  });

  console.log("=".repeat(60));
  console.log(` DONE — ${hackathons.length} hackathons`);
  console.log("=".repeat(60));
}

main().catch(console.error);

import axios from "axios";
import * as cheerio from "cheerio";

export type HackathonData = {
  title: string;
  organizer: string | null;
  description: string | null;
  registrationUrl: string | null;
  eventUrl: string;
  startDate: string | null;
  endDate: string | null;
  registrationDeadline: string | null;
  location: string | null;
  isOnline: boolean;
  technologies: string[];
  source: string;
};

const USER_AGENT =
  "SkillVerse Hackathon Crawler/1.0 (+student-project)";


// ============================================
// GENERIC PAGE FETCHER
// ============================================

async function fetchPage(url: string) {
  const response = await axios.get(url, {
    timeout: 15000,

    headers: {
      "User-Agent": USER_AGENT,
      Accept:
        "text/html,application/xhtml+xml",
    },
  });

  return response.data;
}


// ============================================
// HACKEREARTH CRAWLER
// ============================================

export async function crawlHackerEarth(): Promise<
  HackathonData[]
> {
  const url =
    "https://www.hackerearth.com/challenges/hackathon/";

  const html = await fetchPage(url);

  const $ = cheerio.load(html);

  const results: HackathonData[] = [];

  $("a").each((_, element) => {
    const link = $(element);

    let href = link.attr("href");

    const title = link
      .text()
      .replace(/\s+/g, " ")
      .trim();

    if (!href || !title) {
      return;
    }

    // Convert relative URL to absolute URL
    if (href.startsWith("/")) {
      href = `https://www.hackerearth.com${href}`;
    }

    // Only HackerEarth links
    if (!href.includes("hackerearth.com")) {
      return;
    }

    // Only challenge/hackathon pages
    if (
      !href.includes("/challenge/") &&
      !href.includes("/challenges/")
    ) {
      return;
    }

    if (
      title.length < 4 ||
      title.length > 200
    ) {
      return;
    }

    // Remove duplicates
    if (
      results.some(
        (item) => item.eventUrl === href
      )
    ) {
      return;
    }

    results.push({
      title,

      organizer: null,

      description: null,

      registrationUrl: href,

      eventUrl: href,

      startDate: null,

      endDate: null,

      registrationDeadline: null,

      location: null,

      isOnline: true,

      technologies: [],

      source: "HackerEarth",
    });
  });

  console.log(
    `HackerEarth: found ${results.length} hackathons`
  );

  return results.slice(0, 50);
}


// ============================================
// UNSTOP CRAWLER
// ============================================

export async function crawlUnstop(): Promise<
  HackathonData[]
> {
  const url =
    "https://unstop.com/hackathons";

  const html = await fetchPage(url);

  const $ = cheerio.load(html);

  const results: HackathonData[] = [];

  $("a").each((_, element) => {
    const link = $(element);

    let href = link.attr("href");

    const title = link
      .text()
      .replace(/\s+/g, " ")
      .trim();

    if (!href || !title) {
      return;
    }

    // Convert relative URL to absolute URL
    if (href.startsWith("/")) {
      href = `https://unstop.com${href}`;
    }

    // Only Unstop links
    if (!href.includes("unstop.com")) {
      return;
    }

    // Only hackathon pages
    if (!href.includes("/hackathons/")) {
      return;
    }

    if (
      title.length < 4 ||
      title.length > 200
    ) {
      return;
    }

    // Remove duplicates
    if (
      results.some(
        (item) => item.eventUrl === href
      )
    ) {
      return;
    }

    results.push({
      title,

      organizer: null,

      description: null,

      registrationUrl: href,

      eventUrl: href,

      startDate: null,

      endDate: null,

      registrationDeadline: null,

      location: null,

      isOnline: true,

      technologies: [],

      source: "Unstop",
    });
  });

  console.log(
    `Unstop: found ${results.length} hackathons`
  );

  return results.slice(0, 50);
}


// ============================================
// MAIN CRAWLER
// ONLY HACKEREARTH + UNSTOP
// ============================================

export async function crawlAllHackathons(): Promise<
  HackathonData[]
> {
  const allResults: HackathonData[] = [];

  // ==========================================
  // HACKEREARTH
  // ==========================================

  try {
    const hackerEarth =
      await crawlHackerEarth();

    allResults.push(...hackerEarth);

  } catch (error) {
    console.error(
      "HackerEarth crawler failed:",
      error
    );
  }


  // ==========================================
  // UNSTOP
  // ==========================================

  try {
    const unstop =
      await crawlUnstop();

    allResults.push(...unstop);

  } catch (error) {
    console.error(
      "Unstop crawler failed:",
      error
    );
  }


  // ==========================================
  // SAFETY FILTER
  // ONLY ALLOW TWO SOURCES
  // ==========================================

  const allowedSources = [
    "HackerEarth",
    "Unstop",
  ];

  const filtered =
    allResults.filter((item) =>
      allowedSources.includes(item.source)
    );


  // ==========================================
  // REMOVE DUPLICATE URLS
  // ==========================================

  const unique =
    Array.from(
      new Map(
        filtered.map((item) => [
          item.eventUrl,
          item,
        ])
      ).values()
    );


  console.log(
    `Total allowed hackathons: ${unique.length}`
  );

  return unique;
}
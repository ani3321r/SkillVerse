import axios from "axios";

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


// ============================================
// HELPERS
// ============================================

/**
 * Strip HTML tags from prize strings like:
 *   "$<span data-currency-value>1,700</span>"
 * → "$1,700"
 */
function stripHtml(str: string): string {
  return str.replace(/<[^>]+>/g, "").trim();
}

/**
 * Parse "Aug 20 - 22, 2026" or "Aug 12 - Sep 05, 2026"
 * into { startDate, endDate } ISO strings.
 * Returns nulls if parsing fails.
 */
function parseDateRange(str: string): {
  startDate: string | null;
  endDate: string | null;
} {
  if (!str) return { startDate: null, endDate: null };

  try {
    // "Aug 20 - 22, 2026"  or  "Aug 12 - Sep 05, 2026"
    const parts = str.trim().split(" - ");
    if (parts.length !== 2) return { startDate: null, endDate: null };

    const left = parts[0].trim();   // "Aug 20"
    const right = parts[1].trim();  // "22, 2026" or "Sep 05, 2026"

    // Extract year from the right side
    const yearMatch = right.match(/(\d{4})$/);
    const year = yearMatch ? yearMatch[1] : new Date().getFullYear().toString();

    const startRaw = `${left} ${year}`;

    // If right side already has a month name, use it as-is; otherwise prepend
    // the month from the left side
    const hasMonth = /^[A-Za-z]/.test(right);
    const endRaw = hasMonth ? right : `${left.split(" ")[0]} ${right}`;

    const start = new Date(startRaw);
    const end   = new Date(endRaw);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { startDate: null, endDate: null };
    }

    return {
      startDate: start.toISOString(),
      endDate:   end.toISOString(),
    };
  } catch {
    return { startDate: null, endDate: null };
  }
}


// ============================================
// DEVPOST CRAWLER
// Uses Devpost's public JSON API — no key needed.
// Docs: https://devpost.com/api/hackathons
// ============================================

export async function crawlDevpost(
  perPage = 50
): Promise<HackathonData[]> {

  const response = await axios.get(
    "https://devpost.com/api/hackathons",
    {
      params: {
        "status[]": ["upcoming", "open"],
        order_by:   "recently-added",
        per_page:   perPage,
      },
      headers: {
        "User-Agent": "SkillVerse Hackathon Crawler/2.0",
        Accept:       "application/json",
      },
      timeout: 15000,
    }
  );

  const hackathons = response.data?.hackathons ?? [];
  const results: HackathonData[] = [];

  for (const h of hackathons) {

    const location: string = h.displayed_location?.location ?? "";
    const isOnline = location.toLowerCase() === "online" ||
                     h.displayed_location?.icon === "globe";

    const { startDate, endDate } = parseDateRange(
      h.submission_period_dates ?? ""
    );

    // Map Devpost "themes" → our technologies array
    const technologies: string[] = (h.themes ?? [])
      .map((t: any) => t.name as string)
      .filter(Boolean);

    // Clean up the prize_amount HTML
    const prizeRaw = stripHtml(h.prize_amount ?? "").replace(/^[$₹€£]?\s*0$/, "").trim();

    results.push({
      title:                h.title,
      organizer:            h.organization_name ?? null,
      description:          prizeRaw ? `Prize: ${prizeRaw}  ·  ${h.registrations_count ?? 0} registered` : `${h.registrations_count ?? 0} registered`,
      registrationUrl:      h.url,
      eventUrl:             h.url,
      startDate,
      endDate,
      registrationDeadline: endDate,   // Devpost end date = submission deadline
      location:             location || null,
      isOnline,
      technologies,
      source:               "Devpost",
    });
  }

  console.log(`Devpost: found ${results.length} hackathons`);
  return results;
}


// ============================================
// MAIN — combine all sources
// ============================================

export async function crawlAllHackathons(): Promise<HackathonData[]> {

  const allResults: HackathonData[] = [];

  try {
    const devpost = await crawlDevpost(50);
    allResults.push(...devpost);
  } catch (error) {
    console.error("Devpost crawler failed:", error);
  }

  // Deduplicate by eventUrl
  const unique = Array.from(
    new Map(allResults.map(h => [h.eventUrl, h])).values()
  );

  console.log(`Total unique hackathons: ${unique.length}`);
  return unique;
}


// ============================================
// KEEP legacy named exports so existing
// import sites don't break
// ============================================

export async function crawlHackerEarth(): Promise<HackathonData[]> {
  console.log("crawlHackerEarth: redirected to Devpost (HackerEarth is JS-rendered)");
  return [];
}

export async function crawlUnstop(): Promise<HackathonData[]> {
  console.log("crawlUnstop: redirected to Devpost (Unstop is JS-rendered)");
  return [];
}

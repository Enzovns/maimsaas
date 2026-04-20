import { prisma } from "@/lib/prisma";

const BASE_URL = "https://api.adzuna.com/v1/api/jobs/au/search";

interface AdzunaLocation {
  display_name: string;
  area: string[];
}

interface AdzunaCompany {
  display_name: string;
}

interface AdzunaJob {
  id: string;
  title: string;
  company: AdzunaCompany;
  location: AdzunaLocation;
  description: string;
  salary_min?: number;
  salary_max?: number;
  redirect_url: string;
  created: string;
}

interface AdzunaResponse {
  results: AdzunaJob[];
  count: number;
}

const STATE_MAP: Record<string, string> = {
  "Western Australia": "WA",
  "Queensland": "QLD",
  "New South Wales": "NSW",
  "Victoria": "VIC",
  "South Australia": "SA",
  "Northern Territory": "NT",
  "Tasmania": "TAS",
  "Australian Capital Territory": "ACT",
};

function extractState(area: string[]): string | null {
  for (const a of area) {
    if (STATE_MAP[a]) return STATE_MAP[a];
  }
  return null;
}

async function fetchAdzunaPage(page: number): Promise<AdzunaJob[]> {
  const appId = process.env.ADZUNA_APP_ID;
  const apiKey = process.env.ADZUNA_API_KEY;

  const url = new URL(`${BASE_URL}/${page}`);
  url.searchParams.set("app_id", appId!);
  url.searchParams.set("app_key", apiKey!);
  url.searchParams.set("results_per_page", "50");
  url.searchParams.set("what", "mining");
  url.searchParams.set("content-type", "application/json");

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Adzuna API error: ${res.status} ${await res.text()}`);
  }

  const data: AdzunaResponse = await res.json();
  return data.results ?? [];
}

export async function syncAdzunaJobs(): Promise<{ synced: number; errors: string[] }> {
  let synced = 0;
  const errors: string[] = [];

  for (let page = 1; page <= 4; page++) {
    try {
      const jobs = await fetchAdzunaPage(page);
      if (jobs.length === 0) break;

      for (const job of jobs) {
        try {
          const salary =
            job.salary_min
              ? `$${Math.round(job.salary_min).toLocaleString()}–$${Math.round(job.salary_max ?? job.salary_min).toLocaleString()}`
              : null;

          await prisma.jobListing.upsert({
            where: { url: job.redirect_url },
            create: {
              title: job.title,
              company: job.company.display_name,
              location: job.location.display_name,
              state: extractState(job.location.area),
              description: job.description,
              salary,
              url: job.redirect_url,
              source: "adzuna",
              postedDate: new Date(job.created),
            },
            update: {
              scrapedAt: new Date(),
            },
          });
          synced++;
        } catch (err) {
          errors.push(`Job ${job.id}: ${err instanceof Error ? err.message : String(err)}`);
        }
      }

      // Respect rate limits
      if (page < 4) await new Promise((r) => setTimeout(r, 300));
    } catch (err) {
      errors.push(`Page ${page}: ${err instanceof Error ? err.message : String(err)}`);
      break;
    }
  }

  return { synced, errors };
}

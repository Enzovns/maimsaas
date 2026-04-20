import { NextRequest, NextResponse } from "next/server";
import { syncAdzunaJobs } from "@/lib/adzuna";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("authorization");
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await syncAdzunaJobs();
    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error("fetch-jobs cron error:", err);
    return NextResponse.json(
      { error: "Failed to fetch jobs", details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}

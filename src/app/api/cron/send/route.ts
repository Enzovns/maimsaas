import { NextRequest, NextResponse } from "next/server";
import { sendDailyCVs } from "@/lib/cv-sender";

export const dynamic = "force-dynamic";

// This endpoint is called by the cron job (Vercel Cron or external scheduler)
// Secure it with a secret header
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await sendDailyCVs();
    return NextResponse.json({
      success: true,
      processed: result.processed,
      errors: result.errors,
    });
  } catch (err: any) {
    console.error("Cron send error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Also support GET for Vercel Cron Jobs
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await sendDailyCVs();
    return NextResponse.json({
      success: true,
      processed: result.processed,
      errors: result.errors,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

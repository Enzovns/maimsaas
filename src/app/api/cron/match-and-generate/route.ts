import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { matchJobsToUser } from "@/lib/job-matcher";
import { generateApplication } from "@/lib/ai-generator";
import { extractCvText } from "@/lib/cv-parser";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("authorization");
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let processed = 0;
  let generated = 0;
  const errors: string[] = [];

  try {
    const activeUsers = await prisma.user.findMany({
      where: {
        subscriptionStatus: "active",
        cvPath: { not: null },
      },
    });

    const allJobs = await prisma.jobListing.findMany({
      where: { isActive: true },
    });

    for (const user of activeUsers) {
      try {
        processed++;

        const existingApps = await prisma.generatedApplication.findMany({
          where: { userId: user.id },
          select: { jobListingId: true },
        });
        const alreadyAppliedIds = new Set(existingApps.map((a) => a.jobListingId));

        const matched = matchJobsToUser(allJobs, user, alreadyAppliedIds);
        if (matched.length === 0) continue;

        let cvText: string;
        try {
          cvText = await extractCvText(user.cvPath!);
        } catch {
          errors.push(`User ${user.id}: failed to parse CV`);
          continue;
        }

        for (const job of matched.slice(0, 10)) {
          try {
            const { coverLetter, cvSummary } = await generateApplication(
              {
                title: job.title,
                company: job.company,
                description: job.description,
                location: job.location,
              },
              cvText,
              user.name ?? "Candidate"
            );

            await prisma.generatedApplication.create({
              data: {
                userId: user.id,
                jobListingId: job.id,
                coverLetter,
                cvSummary,
              },
            });

            generated++;
            // Avoid hammering Anthropic API
            await new Promise((r) => setTimeout(r, 500));
          } catch (err) {
            errors.push(
              `User ${user.id} / job ${job.id}: ${err instanceof Error ? err.message : String(err)}`
            );
          }
        }
      } catch (err) {
        errors.push(`User ${user.id}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    return NextResponse.json({ processed, generated, errors });
  } catch (err: unknown) {
    console.error("match-and-generate cron error:", err);
    return NextResponse.json(
      { error: "Failed to run match-and-generate", details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}

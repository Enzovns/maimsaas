import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";

export const dynamic = "force-dynamic";

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

function buildDigestHtml(
  userName: string,
  applications: Array<{ jobListing: { title: string; company: string; location: string; url: string } }>
): string {
  const rows = applications
    .map(
      (a) =>
        `<tr>
          <td style="padding:8px 0;border-bottom:1px solid #F3F4F6;">
            <strong style="color:#111827;">${a.jobListing.title}</strong><br>
            <span style="color:#6B7280;font-size:13px;">${a.jobListing.company} · ${a.jobListing.location}</span>
          </td>
          <td style="padding:8px 0;border-bottom:1px solid #F3F4F6;text-align:right;vertical-align:middle;">
            <a href="${a.jobListing.url}" style="color:#EAB308;font-size:13px;text-decoration:none;">View job →</a>
          </td>
        </tr>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#F9FAFB;margin:0;padding:24px;">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;padding:32px;border:1px solid #E5E7EB;">
    <div style="margin-bottom:24px;">
      <span style="background:#EAB308;color:#fff;font-weight:700;font-size:14px;padding:6px 12px;border-radius:8px;">MineApply</span>
    </div>
    <h1 style="font-size:22px;color:#111827;margin:0 0 8px;">Good morning, ${userName}!</h1>
    <p style="color:#6B7280;font-size:15px;margin:0 0 24px;">
      You have <strong style="color:#111827;">${applications.length} new job ${applications.length === 1 ? "match" : "matches"}</strong> with AI-generated cover letters ready to use.
    </p>
    <table style="width:100%;border-collapse:collapse;">${rows}</table>
    <div style="margin-top:24px;text-align:center;">
      <a href="${process.env.NEXTAUTH_URL ?? "https://mineapply.com.au"}/jobs" style="display:inline-block;background:#EAB308;color:#fff;font-weight:600;text-decoration:none;padding:12px 28px;border-radius:10px;font-size:15px;">View All Matches</a>
    </div>
    <p style="margin-top:24px;font-size:12px;color:#9CA3AF;text-align:center;">
      MineApply · Daily mining jobs for Australians<br>
      <a href="${process.env.NEXTAUTH_URL ?? "https://mineapply.com.au"}/settings" style="color:#9CA3AF;">Unsubscribe from daily emails</a>
    </p>
  </div>
</body>
</html>`;
}

export async function POST(req: Request) {
  const secret = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const users = await prisma.user.findMany({
    where: {
      subscriptionStatus: "active",
      emailNotifications: true,
      email: { not: null },
    },
    select: { id: true, name: true, email: true },
  });

  const transporter = getTransporter();
  let sent = 0;
  const errors: string[] = [];

  for (const user of users) {
    try {
      const applications = await prisma.generatedApplication.findMany({
        where: { userId: user.id, createdAt: { gte: todayStart }, status: "generated" },
        include: { jobListing: { select: { title: true, company: true, location: true, url: true } } },
        take: 10,
      });

      if (applications.length === 0) continue;

      await transporter.sendMail({
        from: `MineApply <${process.env.SMTP_USER}>`,
        to: user.email!,
        subject: `${applications.length} new mining job ${applications.length === 1 ? "match" : "matches"} today`,
        html: buildDigestHtml(user.name ?? "there", applications),
      });
      sent++;
    } catch (err: unknown) {
      errors.push(`${user.email}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return NextResponse.json({ sent, errors });
}

export async function GET(req: Request) {
  return POST(req);
}

import { NextResponse } from "next/server";
import { randomBytes, createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";

export const dynamic = "force-dynamic";

// In-memory rate limiter: max 5 requests per IP per 15 minutes
const rateLimitMap = new Map<string, { count: number; windowStart: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 5;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now - entry.windowStart > WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, windowStart: now });
    return false;
  }
  if (entry.count >= MAX_REQUESTS) return true;
  entry.count++;
  return false;
}

function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

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

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a few minutes and try again." },
      { status: 429 }
    );
  }

  let email: string;
  try {
    const body = await req.json();
    email = (body.email ?? "").toLowerCase().trim();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  }

  // Always respond 200 to avoid revealing whether email exists
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.password) {
    // No account, or Google-only account — silent success
    return NextResponse.json({ ok: true });
  }

  // Invalidate any existing unused tokens for this user
  await prisma.passwordResetToken.updateMany({
    where: { userId: user.id, used: false },
    data: { used: true },
  });

  // Generate a cryptographically random token
  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.passwordResetToken.create({
    data: { userId: user.id, tokenHash, expiresAt },
  });

  const resetUrl = `${process.env.NEXTAUTH_URL ?? "https://mineapply.com.au"}/auth/reset-password?token=${rawToken}`;

  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: `MineApply <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Reset your MineApply password",
      html: `
<!DOCTYPE html>
<html>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#F9FAFB;margin:0;padding:24px;">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:16px;padding:32px;border:1px solid #E5E7EB;">
    <div style="margin-bottom:24px;">
      <span style="background:#EAB308;color:#fff;font-weight:700;font-size:14px;padding:6px 12px;border-radius:8px;">MineApply</span>
    </div>
    <h1 style="font-size:22px;color:#111827;margin:0 0 12px;">Reset your password</h1>
    <p style="color:#6B7280;font-size:15px;margin:0 0 24px;line-height:1.6;">
      We received a request to reset the password for your MineApply account.
      Click the button below to choose a new password.
    </p>
    <a href="${resetUrl}" style="display:inline-block;background:#EAB308;color:#fff;font-weight:600;text-decoration:none;padding:14px 28px;border-radius:10px;font-size:15px;margin-bottom:24px;">
      Reset my password
    </a>
    <p style="color:#9CA3AF;font-size:13px;margin:0 0 8px;">
      This link expires in <strong>1 hour</strong>. If you didn&apos;t request a password reset, you can safely ignore this email.
    </p>
    <p style="color:#D1D5DB;font-size:12px;margin:0;word-break:break-all;">
      ${resetUrl}
    </p>
  </div>
</body>
</html>`,
    });
  } catch (err) {
    // Log but don't reveal the error to the client
    console.error("forgot-password email error:", err);
  }

  return NextResponse.json({ ok: true });
}

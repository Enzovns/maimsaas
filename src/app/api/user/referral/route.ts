import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

export const dynamic = "force-dynamic";

type SessionUser = { id?: string };

function generateCode(): string {
  return randomBytes(4).toString("hex").toUpperCase();
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as SessionUser).id!;

  let user = await prisma.user.findUnique({
    where: { id: userId },
    select: { referralCode: true, freeWeeksEarned: true },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (!user.referralCode) {
    let code = generateCode();
    let attempts = 0;
    while (attempts < 5) {
      const existing = await prisma.user.findUnique({ where: { referralCode: code } });
      if (!existing) break;
      code = generateCode();
      attempts++;
    }
    user = await prisma.user.update({
      where: { id: userId },
      data: { referralCode: code },
      select: { referralCode: true, freeWeeksEarned: true },
    });
  }

  const referralCount = await prisma.user.count({
    where: { referredBy: user.referralCode! },
  });

  return NextResponse.json({
    referralCode: user.referralCode,
    freeWeeksEarned: user.freeWeeksEarned,
    referralCount,
  });
}

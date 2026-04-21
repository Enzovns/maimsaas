import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type SessionUser = { id?: string };

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as SessionUser).id!;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      subscriptionStatus: true,
      subscriptionTier: true,
      gmailRefreshToken: true,
      cvPath: true,
      cvOriginalName: true,
      isActive: true,
      preferredRoles: true,
      preferredStates: true,
      preferredRoster: true,
      experienceLevel: true,
      emailNotifications: true,
      language: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayMatchCount = await prisma.generatedApplication.count({
    where: {
      userId,
      createdAt: { gte: todayStart },
    },
  });

  return NextResponse.json({
    user: {
      ...user,
      gmailConnected: !!user.gmailRefreshToken,
    },
    todayMatchCount,
  });
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      subscriptionStatus: true,
      gmailRefreshToken: true,
      cvPath: true,
      cvOriginalName: true,
      isActive: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const sendLogs = await prisma.sendLog.findMany({
    where: {
      userId,
      createdAt: { gte: sevenDaysAgo },
    },
    orderBy: { createdAt: "desc" },
    take: 7,
  });

  const todayLog = sendLogs.find((log) => {
    const today = new Date();
    const logDate = new Date(log.createdAt);
    return (
      logDate.getDate() === today.getDate() &&
      logDate.getMonth() === today.getMonth() &&
      logDate.getFullYear() === today.getFullYear()
    );
  });

  const activeCompanyCount = await prisma.miningCompany.count({
    where: { isActive: true },
  });

  return NextResponse.json({
    user: {
      ...user,
      gmailConnected: !!user.gmailRefreshToken,
    },
    todayCount: todayLog?.recipientCount || 0,
    sendLogs,
    activeCompanyCount,
  });
}

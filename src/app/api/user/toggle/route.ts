import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id?: string }).id!;
  const { isActive } = await req.json();

  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (isActive) {
    if (user.subscriptionStatus !== "active") {
      return NextResponse.json(
        { error: "Active subscription required" },
        { status: 400 }
      );
    }
    if (!user.gmailRefreshToken) {
      return NextResponse.json({ error: "Gmail not connected" }, { status: 400 });
    }
    if (!user.cvPath) {
      return NextResponse.json({ error: "CV not uploaded" }, { status: 400 });
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: { isActive },
  });

  return NextResponse.json({ isActive });
}

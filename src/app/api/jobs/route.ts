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

  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const applications = await prisma.generatedApplication.findMany({
    where: {
      userId,
      createdAt: { gte: cutoff },
    },
    include: {
      jobListing: {
        select: {
          id: true,
          title: true,
          company: true,
          location: true,
          state: true,
          salary: true,
          url: true,
          source: true,
          postedDate: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ applications });
}

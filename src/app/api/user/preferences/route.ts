import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type SessionUser = { id?: string };

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as SessionUser).id!;
  const body = await req.json();

  const { preferredRoles, preferredStates, preferredRoster, experienceLevel } = body as {
    preferredRoles: string[];
    preferredStates: string[];
    preferredRoster: string | null;
    experienceLevel: string | null;
  };

  await prisma.user.update({
    where: { id: userId },
    data: {
      preferredRoles: preferredRoles ?? [],
      preferredStates: preferredStates ?? [],
      preferredRoster: preferredRoster ?? null,
      experienceLevel: experienceLevel ?? null,
    },
  });

  return NextResponse.json({ ok: true });
}

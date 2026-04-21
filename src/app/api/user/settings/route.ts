import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type SessionUser = { id?: string };

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as SessionUser).id!;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { emailNotifications: true, language: true },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  return NextResponse.json(user);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as SessionUser).id!;

  const body = await req.json();
  const emailNotifications = typeof body.emailNotifications === "boolean" ? body.emailNotifications : true;
  const language = ["en", "fr"].includes(body.language) ? body.language : "en";

  await prisma.user.update({
    where: { id: userId },
    data: { emailNotifications, language },
  });

  return NextResponse.json({ ok: true });
}

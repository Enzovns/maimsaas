import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createBillingPortalSession } from "@/lib/stripe";

export const dynamic = "force-dynamic";

type SessionUser = { id?: string };

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as SessionUser).id!;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user?.stripeCustomerId) {
      return NextResponse.json({ error: "No subscription found" }, { status: 400 });
    }

    const portalSession = await createBillingPortalSession(
      user.stripeCustomerId,
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
    );

    return NextResponse.json({ url: portalSession.url });
  } catch {
    return NextResponse.json({ error: "Failed to open billing portal" }, { status: 500 });
  }
}

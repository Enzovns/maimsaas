import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createStripeCustomer, createCheckoutSession } from "@/lib/stripe";

export const dynamic = "force-dynamic";

type SessionUser = { id?: string; email?: string | null; name?: string | null };

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const tier: "standard" | "pro" =
      body.tier === "pro" ? "pro" : "standard";

    const userId = (session.user as SessionUser).id!;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await createStripeCustomer(
        user.email!,
        user.name || user.email!
      );
      customerId = customer.id;
      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customerId },
      });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    const checkoutSession = await createCheckoutSession(
      customerId,
      userId,
      tier,
      `${appUrl}/onboarding/preferences`,
      `${appUrl}/onboarding/payment?canceled=true`
    );

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err: unknown) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json(
      { error: "Failed to create checkout", details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

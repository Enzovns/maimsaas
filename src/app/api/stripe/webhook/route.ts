import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Webhook Error: ${msg}` }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode === "subscription" && session.subscription) {
        await prisma.user.updateMany({
          where: { stripeCustomerId: session.customer as string },
          data: {
            stripeSubscriptionId: session.subscription as string,
            subscriptionStatus: "active",
          },
        });
      }
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      await prisma.user.updateMany({
        where: { stripeSubscriptionId: sub.id },
        data: {
          subscriptionStatus: sub.status,
          isActive: sub.status === "active",
        },
      });
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await prisma.user.updateMany({
        where: { stripeSubscriptionId: sub.id },
        data: {
          subscriptionStatus: "canceled",
          isActive: false,
        },
      });
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice & {
        subscription?: string;
      };
      if (invoice.subscription) {
        await prisma.user.updateMany({
          where: { stripeSubscriptionId: invoice.subscription },
          data: {
            subscriptionStatus: "past_due",
            isActive: false,
          },
        });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}

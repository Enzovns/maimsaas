import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type SessionUser = { id?: string };

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as SessionUser).id!;

    const formData = await req.formData();
    const file = formData.get("cv") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");

    await prisma.user.update({
      where: { id: userId },
      data: {
        cvData: base64,
        cvOriginalName: file.name,
        cvPath: file.name, // kept for backward compat — now just stores the filename
      },
    });

    return NextResponse.json({ name: file.name });
  } catch (err: unknown) {
    console.error("CV upload error:", err);
    return NextResponse.json(
      { error: "Upload failed", details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

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

    const uploadDir = path.join(process.cwd(), "public", "uploads", "cvs");
    await mkdir(uploadDir, { recursive: true });

    const fileName = `${userId}-${Date.now()}.pdf`;
    const filePath = path.join(uploadDir, fileName);
    const relativePath = `/uploads/cvs/${fileName}`;

    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    await prisma.user.update({
      where: { id: userId },
      data: {
        cvPath: relativePath,
        cvOriginalName: file.name,
      },
    });

    return NextResponse.json({ path: relativePath, name: file.name });
  } catch (err: any) {
    console.error("CV upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

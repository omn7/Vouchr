import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idWithExt } = await params;
    
    // Extract actual database ID by removing extension if present
    const id = idWithExt.split(".")[0];

    const attachment = await prisma.attachment.findUnique({
      where: { id },
    });

    if (!attachment) {
      return new Response("File not found", { status: 404 });
    }

    // Return binary file with correct content type
    return new Response(attachment.data, {
      headers: {
        "Content-Type": attachment.type,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error: any) {
    console.error("File download error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

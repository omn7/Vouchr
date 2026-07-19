import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File exceeds 5MB size limit" }, { status: 400 });
    }

    // Validate format (JPG, PNG, PDF)
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Only JPG, PNG, and PDF files are allowed" }, { status: 400 });
    }

    // Create unique filename
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const originalName = file.name;
    const ext = originalName.split(".").pop();
    const uniqueFilename = `${crypto.randomUUID()}.${ext}`;

    // Target directory: public/uploads
    const uploadDir = join(process.cwd(), "public", "uploads");
    
    // Ensure the directory exists
    await mkdir(uploadDir, { recursive: true });

    // Save file
    const filePath = join(uploadDir, uniqueFilename);
    await writeFile(filePath, buffer);

    // Return the relative URL
    const relativeUrl = `/uploads/${uniqueFilename}`;
    return NextResponse.json({ success: true, url: relativeUrl });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed: " + error.message }, { status: 500 });
  }
}

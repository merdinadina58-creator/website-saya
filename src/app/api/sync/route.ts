import { NextRequest, NextResponse } from "next/server";
import { readCloudData, writeCloudData, isCloudSyncAvailable } from "@/lib/cloud-store";
import { verifyAdminFromHeader, setAdminUsername, setAdminPassword } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    if (!isCloudSyncAvailable()) {
      return NextResponse.json({ available: false });
    }

    const cloudData = await readCloudData();

    if (!cloudData) {
      // Cloud sync available but no data found yet
      return NextResponse.json({ available: true, data: null });
    }

    // Check if request is authenticated — only return credentials to admins
    const isAdmin = await verifyAdminFromHeader(request);

    // Build safe response — strip credentials for unauthenticated requests
    const safeData = {
      content: cloudData.content,
      credentials: isAdmin ? cloudData.credentials : undefined,
      logo: cloudData.logo,
      aboutPhoto: cloudData.aboutPhoto,
      heroBg: cloudData.heroBg,
      updatedAt: cloudData.updatedAt,
    };

    return NextResponse.json({
      available: true,
      data: safeData,
      updatedAt: cloudData.updatedAt,
    });
  } catch (error) {
    console.error("Error reading cloud data:", error);
    return NextResponse.json({ available: false });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin auth
    const isAdmin = await verifyAdminFromHeader(request);
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { content, credentials, logo, aboutPhoto, heroBg } = body;

    // Add updatedAt timestamp
    const updatedAt = new Date().toISOString();

    // Attempt to write to cloud
    const writeResult = await writeCloudData({
      content: content || {},
      credentials,
      logo,
      aboutPhoto,
      heroBg,
      updatedAt,
    });

    if (!writeResult) {
      // Cloud sync not available or write failed
      return NextResponse.json({
        success: false,
        error: "Cloud sync tidak tersedia",
      });
    }

    // Try to save credentials to database if provided
    if (credentials) {
      try {
        if (credentials.username) {
          await setAdminUsername(credentials.username);
        }
        if (credentials.password) {
          await setAdminPassword(credentials.password);
        }
      } catch (dbError) {
        console.error("Error saving credentials to database:", dbError);
        // Continue even if DB save fails — cloud write already succeeded
      }
    }

    return NextResponse.json({
      success: true,
      updatedAt,
    });
  } catch (error) {
    console.error("Error writing cloud data:", error);
    return NextResponse.json({
      success: false,
      error: "Gagal menyimpan ke cloud",
    });
  }
}

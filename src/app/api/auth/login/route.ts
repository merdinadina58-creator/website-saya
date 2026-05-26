import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_USERNAME, DEFAULT_PASSWORD } from "@/lib/auth";
import { getCloudCredentials } from "@/lib/cloud-store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const username = (body.username || "").trim();
    const password = body.password || "";

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username dan password wajib diisi" },
        { status: 400 }
      );
    }

    let hasCustomCredentials = false;

    // 1. Check cloud credentials first (persists across deployments)
    try {
      const cloudCreds = await getCloudCredentials();
      if (cloudCreds) {
        hasCustomCredentials = true;
        if (username === cloudCreds.username && password === cloudCreds.password) {
          return NextResponse.json({ success: true });
        }
      }
    } catch {
      // Cloud credentials not available
    }

    // 2. Check database credentials
    try {
      const { verifyCredentials, getAdminUsername, getAdminPassword } = await import("@/lib/auth");
      const { isDbAvailable } = await import("@/lib/db");

      if (await isDbAvailable()) {
        const storedUsername = await getAdminUsername();
        const storedPassword = await getAdminPassword();
        // If DB credentials differ from defaults, custom credentials exist
        if (storedUsername !== DEFAULT_USERNAME || storedPassword !== DEFAULT_PASSWORD) {
          hasCustomCredentials = true;
        }
        const isValid = await verifyCredentials(username, password);
        if (isValid) {
          return NextResponse.json({ success: true });
        }
      }
    } catch {
      // DB not available or query failed
    }

    // 3. Default credentials — ONLY if no custom credentials have been set
    // Once the user changes their password, admin/admin123 no longer works
    if (!hasCustomCredentials && username === DEFAULT_USERNAME && password === DEFAULT_PASSWORD) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: "Username atau password salah" },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { error: "Gagal login" },
      { status: 500 }
    );
  }
}

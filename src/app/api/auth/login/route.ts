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

    // 1. Always check default credentials first — ensures login works on Vercel/serverless
    if (username === DEFAULT_USERNAME && password === DEFAULT_PASSWORD) {
      return NextResponse.json({ success: true });
    }

    // 2. Check cloud credentials (from GitHub Gist — persists across deployments)
    try {
      const cloudCreds = await getCloudCredentials();
      if (cloudCreds && username === cloudCreds.username && password === cloudCreds.password) {
        return NextResponse.json({ success: true });
      }
    } catch {
      // Cloud credentials not available
    }

    // 3. Try database credentials (in case admin changed their password locally)
    try {
      const { verifyCredentials } = await import("@/lib/auth");
      const { isDbAvailable } = await import("@/lib/db");

      if (await isDbAvailable()) {
        const isValid = await verifyCredentials(username, password);
        if (isValid) {
          return NextResponse.json({ success: true });
        }
      }
    } catch {
      // DB not available or query failed — already checked defaults above
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

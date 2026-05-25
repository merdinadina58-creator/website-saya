import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_USERNAME, DEFAULT_PASSWORD } from "@/lib/auth";

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

    // Always check default credentials first — this guarantees login works on Vercel/serverless
    // where SQLite database may not be persistent
    if (username === DEFAULT_USERNAME && password === DEFAULT_PASSWORD) {
      return NextResponse.json({ success: true });
    }

    // Then try database credentials (in case admin changed their password)
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

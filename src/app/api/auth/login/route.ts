import { NextRequest, NextResponse } from "next/server";
import { verifyCredentials, DEFAULT_USERNAME, DEFAULT_PASSWORD } from "@/lib/auth";
import { isDbAvailable, markDbUnavailable } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username dan password wajib diisi" },
        { status: 400 }
      );
    }

    // Try database first
    const dbAvailable = await isDbAvailable();

    if (dbAvailable) {
      try {
        const isValid = await verifyCredentials(username, password);
        if (isValid) {
          return NextResponse.json({ success: true });
        }
        // If DB check failed, try default credentials as fallback
        // (DB might be empty/reset on Vercel)
      } catch {
        // DB query failed, fall through to default check
      }
    }

    // Fallback: check against default credentials
    // This ensures login works even when DB is unavailable (Vercel serverless)
    if (username === DEFAULT_USERNAME && password === DEFAULT_PASSWORD) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: "Username atau password salah" },
      { status: 401 }
    );
  } catch (error) {
    console.error("Login error:", error);
    markDbUnavailable();
    return NextResponse.json(
      { error: "Gagal login" },
      { status: 500 }
    );
  }
}

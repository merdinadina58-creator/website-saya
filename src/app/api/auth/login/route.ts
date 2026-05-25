import { NextRequest, NextResponse } from "next/server";
import { verifyCredentials } from "@/lib/auth";
import { isDbAvailable, markDbUnavailable } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    if (!(await isDbAvailable())) {
      return NextResponse.json(
        { error: "Database tidak tersedia. Login hanya tersedia di server lokal." },
        { status: 503 }
      );
    }

    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username dan password wajib diisi" },
        { status: 400 }
      );
    }

    const isValid = await verifyCredentials(username, password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Username atau password salah" },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Login error:", error);
    markDbUnavailable();
    return NextResponse.json(
      { error: "Gagal login" },
      { status: 500 }
    );
  }
}

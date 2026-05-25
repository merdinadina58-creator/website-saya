import { NextRequest, NextResponse } from "next/server";
import { verifyCredentials } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
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
    return NextResponse.json({ error: "Gagal login" }, { status: 500 });
  }
}

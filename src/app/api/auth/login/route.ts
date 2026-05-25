import { NextRequest, NextResponse } from "next/server";
import { verifyPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: "Password wajib diisi" },
        { status: 400 }
      );
    }

    const isValid = await verifyPassword(password);
    if (!isValid) {
      return NextResponse.json({ error: "Password salah" }, { status: 401 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Gagal login" }, { status: 500 });
  }
}

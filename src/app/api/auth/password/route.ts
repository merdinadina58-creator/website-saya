import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, setAdminPassword } from "@/lib/auth";

export async function PUT(request: NextRequest) {
  try {
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Password lama dan baru wajib diisi" },
        { status: 400 }
      );
    }

    if (newPassword.length < 4) {
      return NextResponse.json(
        { error: "Password baru minimal 4 karakter" },
        { status: 400 }
      );
    }

    const isValid = await verifyPassword(currentPassword);
    if (!isValid) {
      return NextResponse.json(
        { error: "Password lama salah" },
        { status: 401 }
      );
    }

    await setAdminPassword(newPassword);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Password change error:", error);
    return NextResponse.json(
      { error: "Gagal mengubah password" },
      { status: 500 }
    );
  }
}

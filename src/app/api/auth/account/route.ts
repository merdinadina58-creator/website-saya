import { NextRequest, NextResponse } from "next/server";
import {
  verifyCredentials,
  setAdminUsername,
  setAdminPassword,
} from "@/lib/auth";
import { isDbAvailable, markDbUnavailable } from "@/lib/db";

export async function PUT(request: NextRequest) {
  try {
    if (!(await isDbAvailable())) {
      return NextResponse.json(
        { error: "Database tidak tersedia. Pengaturan akun hanya tersedia di server lokal." },
        { status: 503 }
      );
    }

    const { currentUsername, currentPassword, newUsername, newPassword } =
      await request.json();

    if (!currentUsername || !currentPassword) {
      return NextResponse.json(
        { error: "Username dan password lama wajib diisi" },
        { status: 400 }
      );
    }

    // Verify current credentials
    const isValid = await verifyCredentials(currentUsername, currentPassword);
    if (!isValid) {
      return NextResponse.json(
        { error: "Username atau password lama salah" },
        { status: 401 }
      );
    }

    // Update username if provided and different
    if (newUsername && newUsername.trim().length >= 2) {
      await setAdminUsername(newUsername.trim());
    }

    // Update password if provided
    if (newPassword) {
      if (newPassword.length < 4) {
        return NextResponse.json(
          { error: "Password baru minimal 4 karakter" },
          { status: 400 }
        );
      }
      await setAdminPassword(newPassword);
    }

    return NextResponse.json({
      success: true,
      username: newUsername ? newUsername.trim() : undefined,
    });
  } catch (error) {
    console.error("Account update error:", error);
    markDbUnavailable();
    return NextResponse.json(
      { error: "Gagal memperbarui akun" },
      { status: 500 }
    );
  }
}

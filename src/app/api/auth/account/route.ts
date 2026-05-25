import { NextRequest, NextResponse } from "next/server";
import {
  verifyCredentials,
  setAdminUsername,
  setAdminPassword,
  DEFAULT_USERNAME,
  DEFAULT_PASSWORD,
} from "@/lib/auth";
import { isDbAvailable, markDbUnavailable } from "@/lib/db";

export async function PUT(request: NextRequest) {
  try {
    const { currentUsername, currentPassword, newUsername, newPassword } =
      await request.json();

    if (!currentUsername || !currentPassword) {
      return NextResponse.json(
        { error: "Username dan password lama wajib diisi" },
        { status: 400 }
      );
    }

    // Verify current credentials — check default first, then database
    let isValid = false;

    // Check default credentials (always works on Vercel)
    if (currentUsername === DEFAULT_USERNAME && currentPassword === DEFAULT_PASSWORD) {
      isValid = true;
    }

    // Also check database if available
    if (!isValid) {
      try {
        if (await isDbAvailable()) {
          isValid = await verifyCredentials(currentUsername, currentPassword);
        }
      } catch {
        // DB not available
      }
    }

    if (!isValid) {
      return NextResponse.json(
        { error: "Username atau password lama salah" },
        { status: 401 }
      );
    }

    // Try to save to database
    let savedToDb = false;
    try {
      if (await isDbAvailable()) {
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
        savedToDb = true;
      }
    } catch {
      markDbUnavailable();
    }

    // If DB not available, return success anyway — frontend saves to localStorage
    const finalUsername = newUsername ? newUsername.trim() : currentUsername;
    return NextResponse.json({
      success: true,
      username: finalUsername,
      savedToDb,
      message: savedToDb
        ? "Akun berhasil diperbarui"
        : "Akun diperbarui di browser (database tidak tersedia)",
    });
  } catch {
    return NextResponse.json(
      { error: "Gagal memperbarui akun" },
      { status: 500 }
    );
  }
}

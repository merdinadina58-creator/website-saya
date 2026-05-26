import { NextRequest, NextResponse } from "next/server";
import {
  setAdminUsername,
  setAdminPassword,
  verifyCredentialsForUpdate,
} from "@/lib/auth";
import { isDbAvailable, markDbUnavailable } from "@/lib/db";
import { readCloudData, writeCloudData } from "@/lib/cloud-store";

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

    // Verify current credentials using the same cascade as login
    // (cloud → DB → defaults, but defaults only if no custom credentials)
    const { valid, hasCustomCredentials } = await verifyCredentialsForUpdate(
      currentUsername.trim(),
      currentPassword
    );

    if (!valid) {
      return NextResponse.json(
        { error: "Username atau password lama salah" },
        { status: 401 }
      );
    }

    const finalUsername = newUsername ? newUsername.trim() : currentUsername.trim();
    const finalPassword = newPassword || currentPassword;

    // Validate new password length
    if (newPassword && newPassword.length < 4) {
      return NextResponse.json(
        { error: "Password baru minimal 4 karakter" },
        { status: 400 }
      );
    }

    // Validate new username length
    if (newUsername && newUsername.trim().length < 2) {
      return NextResponse.json(
        { error: "Username baru minimal 2 karakter" },
        { status: 400 }
      );
    }

    // 1. Try to save to database
    let savedToDb = false;
    try {
      if (await isDbAvailable()) {
        if (newUsername && newUsername.trim().length >= 2) {
          await setAdminUsername(newUsername.trim());
        }
        if (newPassword) {
          await setAdminPassword(newPassword);
        }
        savedToDb = true;
      }
    } catch {
      markDbUnavailable();
    }

    // 2. Save to cloud (GitHub Contents API) — persists across deployments
    let savedToCloud = false;
    try {
      const existingCloud = await readCloudData();
      const cloudData = existingCloud || {
        content: {},
        updatedAt: new Date().toISOString(),
      };

      cloudData.credentials = {
        username: finalUsername,
        password: finalPassword,
      };
      cloudData.updatedAt = new Date().toISOString();

      savedToCloud = await writeCloudData(cloudData);
    } catch {
      // Cloud save failed — non-critical
    }

    return NextResponse.json({
      success: true,
      username: finalUsername,
      savedToDb,
      savedToCloud,
      wasDefaultCredentials: !hasCustomCredentials,
      message: savedToCloud
        ? "Akun berhasil diperbarui (cloud)"
        : savedToDb
          ? "Akun berhasil diperbarui (database)"
          : "Akun diperbarui di browser saja",
    });
  } catch {
    return NextResponse.json(
      { error: "Gagal memperbarui akun" },
      { status: 500 }
    );
  }
}

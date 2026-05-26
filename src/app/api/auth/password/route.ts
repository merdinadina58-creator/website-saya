import { NextRequest, NextResponse } from "next/server";
import { verifyCredentialsForUpdate, setAdminPassword } from "@/lib/auth";
import { readCloudData, writeCloudData } from "@/lib/cloud-store";

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

    // Verify current password using the same cascade as login
    // We need a username too — try to get from headers or use stored username
    const headerUsername = request.headers.get("x-admin-username") || "admin";
    const { valid } = await verifyCredentialsForUpdate(headerUsername, currentPassword);
    if (!valid) {
      return NextResponse.json(
        { error: "Password lama salah" },
        { status: 401 }
      );
    }

    // Save to database
    try {
      await setAdminPassword(newPassword);
    } catch {}

    // Save to cloud for cross-device sync
    try {
      const existingCloud = await readCloudData();
      const cloudData = existingCloud || {
        content: {},
        updatedAt: new Date().toISOString(),
      };
      if (cloudData.credentials) {
        cloudData.credentials.password = newPassword;
      } else {
        cloudData.credentials = { username: headerUsername, password: newPassword };
      }
      cloudData.updatedAt = new Date().toISOString();
      await writeCloudData(cloudData);
    } catch {}

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Password change error:", error);
    return NextResponse.json(
      { error: "Gagal mengubah password" },
      { status: 500 }
    );
  }
}

import { db } from "@/lib/db";

const DEFAULT_PASSWORD = "admin123";

export async function getAdminPassword(): Promise<string> {
  const record = await db.siteContent.findUnique({
    where: { key: "_admin_password" },
  });
  return record?.value || DEFAULT_PASSWORD;
}

export async function verifyPassword(password: string): Promise<boolean> {
  const storedPassword = await getAdminPassword();
  return password === storedPassword;
}

export async function setAdminPassword(newPassword: string): Promise<void> {
  await db.siteContent.upsert({
    where: { key: "_admin_password" },
    update: { value: newPassword },
    create: { key: "_admin_password", value: newPassword },
  });
}

export async function verifyAdminFromHeader(
  request: Request
): Promise<boolean> {
  const password = request.headers.get("x-admin-password");
  if (!password) return false;
  return verifyPassword(password);
}

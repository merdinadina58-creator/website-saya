import { db } from "@/lib/db";

const DEFAULT_USERNAME = "admin";
const DEFAULT_PASSWORD = "admin123";

export async function getAdminUsername(): Promise<string> {
  const record = await db.siteContent.findUnique({
    where: { key: "_admin_username" },
  });
  return record?.value || DEFAULT_USERNAME;
}

export async function getAdminPassword(): Promise<string> {
  const record = await db.siteContent.findUnique({
    where: { key: "_admin_password" },
  });
  return record?.value || DEFAULT_PASSWORD;
}

export async function verifyCredentials(
  username: string,
  password: string
): Promise<boolean> {
  const storedUsername = await getAdminUsername();
  const storedPassword = await getAdminPassword();
  return username === storedUsername && password === storedPassword;
}

export async function verifyPassword(password: string): Promise<boolean> {
  const storedPassword = await getAdminPassword();
  return password === storedPassword;
}

export async function setAdminUsername(newUsername: string): Promise<void> {
  await db.siteContent.upsert({
    where: { key: "_admin_username" },
    update: { value: newUsername },
    create: { key: "_admin_username", value: newUsername },
  });
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
  const username = request.headers.get("x-admin-username");
  const password = request.headers.get("x-admin-password");
  if (!username || !password) return false;
  return verifyCredentials(username, password);
}

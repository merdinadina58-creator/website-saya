import { db } from "@/lib/db";

export const DEFAULT_USERNAME = "admin";
export const DEFAULT_PASSWORD = "admin123";

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

/**
 * Verify admin credentials from request headers.
 *
 * Cascade order:
 * 1. Cloud credentials (persists across Vercel redeployments)
 * 2. Database credentials (local changes)
 * 3. Default credentials — ONLY if no custom credentials have been set
 *
 * This ensures that once a user changes their username/password,
 * the old defaults (admin/admin123) no longer work.
 */
export async function verifyAdminFromHeader(
  request: Request
): Promise<boolean> {
  const username = request.headers.get("x-admin-username");
  const password = request.headers.get("x-admin-password");
  if (!username || !password) return false;

  let hasCustomCredentials = false;

  // 1. Check cloud credentials first (persists across deployments)
  try {
    const { getCloudCredentials } = await import("@/lib/cloud-store");
    const cloudCreds = await getCloudCredentials();
    if (cloudCreds) {
      hasCustomCredentials = true;
      if (username === cloudCreds.username && password === cloudCreds.password) {
        return true;
      }
    }
  } catch {
    // Cloud not available
  }

  // 2. Check database credentials
  try {
    const storedUsername = await getAdminUsername();
    const storedPassword = await getAdminPassword();
    // If DB credentials differ from defaults, custom credentials exist
    if (storedUsername !== DEFAULT_USERNAME || storedPassword !== DEFAULT_PASSWORD) {
      hasCustomCredentials = true;
    }
    if (username === storedUsername && password === storedPassword) {
      return true;
    }
  } catch {
    // DB not available
  }

  // 3. Default credentials — only allowed if NO custom credentials have been set
  if (!hasCustomCredentials && username === DEFAULT_USERNAME && password === DEFAULT_PASSWORD) {
    return true;
  }

  return false;
}

/**
 * Verify credentials for account update (same cascade as verifyAdminFromHeader).
 * Returns whether the credentials are valid.
 */
export async function verifyCredentialsForUpdate(
  username: string,
  password: string
): Promise<{ valid: boolean; hasCustomCredentials: boolean }> {
  let hasCustomCredentials = false;

  // 1. Check cloud credentials
  try {
    const { getCloudCredentials } = await import("@/lib/cloud-store");
    const cloudCreds = await getCloudCredentials();
    if (cloudCreds) {
      hasCustomCredentials = true;
      if (username === cloudCreds.username && password === cloudCreds.password) {
        return { valid: true, hasCustomCredentials: true };
      }
    }
  } catch {}

  // 2. Check database credentials
  try {
    const storedUsername = await getAdminUsername();
    const storedPassword = await getAdminPassword();
    if (storedUsername !== DEFAULT_USERNAME || storedPassword !== DEFAULT_PASSWORD) {
      hasCustomCredentials = true;
    }
    if (username === storedUsername && password === storedPassword) {
      return { valid: true, hasCustomCredentials };
    }
  } catch {}

  // 3. Default credentials — only if no custom credentials
  if (!hasCustomCredentials && username === DEFAULT_USERNAME && password === DEFAULT_PASSWORD) {
    return { valid: true, hasCustomCredentials: false };
  }

  return { valid: false, hasCustomCredentials };
}

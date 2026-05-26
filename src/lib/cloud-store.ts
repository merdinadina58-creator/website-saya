/**
 * Cloud Store - GitHub Contents API-based cloud storage utility
 *
 * Persists website data across Vercel redeployments and syncs across devices
 * using a JSON file stored in the GitHub repository.
 *
 * On Vercel: reads from the deployed filesystem, writes via GitHub API
 * This triggers a redeployment which updates the file for all devices.
 */

const FILE_PATH = "data/cloud-store.json";
const COMMIT_MESSAGE = "chore: sync website data";
const GITHUB_API_BASE = "https://api.github.com";
const CACHE_TTL_MS = 30_000; // 30 seconds

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CloudCredentials {
  username: string;
  password: string;
}

export interface CloudLogo {
  src: string;
  uploadedAt?: string;
  originalName?: string;
  size?: number;
  mimeType?: string;
}

export interface CloudStoreData {
  content: Record<string, unknown>;
  credentials?: CloudCredentials;
  logo?: CloudLogo;
  aboutPhoto?: string; // base64 data URL for about section profile photo
  heroBg?: string; // base64 data URL for hero background image
  updatedAt: string; // ISO timestamp
}

// ─── In-memory cache ─────────────────────────────────────────────────────────

interface CacheEntry {
  data: CloudStoreData | null;
  fetchedAt: number;
}

let cache: CacheEntry | null = null;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getGithubToken(): string | undefined {
  return process.env.GITHUB_TOKEN;
}

function getGithubRepo(): string | undefined {
  return process.env.GITHUB_REPO; // format: "owner/repo"
}

function headers(): Record<string, string> {
  const token = getGithubToken();
  const h: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "Content-Type": "application/json",
  };
  if (token) {
    h.Authorization = `Bearer ${token}`;
  }
  const repo = getGithubRepo();
  if (repo) {
    h["User-Agent"] = repo.split("/")[0];
  }
  return h;
}

function isCacheValid(): boolean {
  if (!cache) return false;
  return Date.now() - cache.fetchedAt < CACHE_TTL_MS;
}

/** Try reading the file from the local filesystem (works on Vercel deployed app) */
async function readFromFilesystem(): Promise<CloudStoreData | null> {
  // Only works in Node.js environment (server-side)
  if (typeof window !== "undefined") return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require("fs");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require("path");
    const filePath = path.join(process.cwd(), FILE_PATH);
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as CloudStoreData;
  } catch {
    // File doesn't exist or can't be read (normal on first deploy)
    return null;
  }
}

/** Get the current file SHA from GitHub (needed for updates) */
async function getFileSha(): Promise<string | null> {
  const repo = getGithubRepo();
  const token = getGithubToken();
  if (!repo || !token) return null;

  try {
    const res = await fetch(
      `${GITHUB_API_BASE}/repos/${repo}/contents/${FILE_PATH}`,
      { headers: headers() }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.sha || null;
  } catch {
    return null;
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Check whether cloud sync is available (i.e. GITHUB_TOKEN and GITHUB_REPO are configured).
 */
export function isCloudSyncAvailable(): boolean {
  return !!getGithubToken() && !!getGithubRepo();
}

/**
 * Read data from cloud storage.
 *
 * Strategy:
 * 1. Check in-memory cache (fast)
 * 2. Try local filesystem (works on Vercel where file was deployed)
 * 3. Try GitHub API (for fresh data)
 */
export async function readCloudData(): Promise<CloudStoreData | null> {
  // Return cached data if still fresh
  if (isCacheValid()) {
    return cache!.data;
  }

  // Try filesystem first (fast, no API call)
  const fsData = await readFromFilesystem();
  if (fsData) {
    cache = { data: fsData, fetchedAt: Date.now() };
    return fsData;
  }

  // Try GitHub API
  const repo = getGithubRepo();
  const token = getGithubToken();
  if (!repo || !token) {
    cache = { data: null, fetchedAt: Date.now() };
    return null;
  }

  try {
    const res = await fetch(
      `${GITHUB_API_BASE}/repos/${repo}/contents/${FILE_PATH}`,
      { headers: headers() }
    );

    if (!res.ok) {
      // File doesn't exist yet or API error
      cache = { data: null, fetchedAt: Date.now() };
      return null;
    }

    const data = await res.json();
    if (!data.content) {
      cache = { data: null, fetchedAt: Date.now() };
      return null;
    }

    // GitHub returns base64-encoded content
    const raw = Buffer.from(data.content, "base64").toString("utf-8");
    const parsed: CloudStoreData = JSON.parse(raw);
    cache = { data: parsed, fetchedAt: Date.now() };
    return parsed;
  } catch (err) {
    console.error("[cloud-store] Error reading from GitHub:", err);
    cache = { data: null, fetchedAt: Date.now() };
    return null;
  }
}

/**
 * Write data to cloud storage (GitHub repo).
 *
 * Creates or updates the `data/cloud-store.json` file in the repository.
 * This triggers a Vercel redeployment which makes the data available to all devices.
 *
 * Returns `true` on success, `false` on any failure.
 */
export async function writeCloudData(
  data: CloudStoreData
): Promise<boolean> {
  const repo = getGithubRepo();
  const token = getGithubToken();
  if (!repo || !token) return false;

  try {
    const sha = await getFileSha();

    const payload: Record<string, unknown> = {
      message: COMMIT_MESSAGE,
      content: Buffer.from(JSON.stringify(data, null, 2)).toString("base64"),
    };

    if (sha) {
      payload.sha = sha; // Required for updating existing file
    }

    const res = await fetch(
      `${GITHUB_API_BASE}/repos/${repo}/contents/${FILE_PATH}`,
      {
        method: "PUT",
        headers: headers(),
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      const body = await res.text();
      console.error(
        `[cloud-store] Failed to ${sha ? "update" : "create"} file: ${res.status}`,
        body.substring(0, 200)
      );
      return false;
    }

    // Invalidate cache so next read fetches fresh data
    cache = { data, fetchedAt: Date.now() };
    return true;
  } catch (err) {
    console.error("[cloud-store] Error writing to GitHub:", err);
    return false;
  }
}

/**
 * Read just the credentials from cloud data.
 */
export async function getCloudCredentials(): Promise<CloudCredentials | null> {
  const data = await readCloudData();
  if (!data) return null;
  return data.credentials ?? null;
}

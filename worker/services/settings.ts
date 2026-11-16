import type { Env } from "../env";
import { randomHex } from "../lib/crypto";

/** Key yang berisi rahasia: tidak boleh pernah dikirim lewat API. */
export const SECRET_SETTING_KEYS = new Set(["webhook_secret", "session_secret", "owner_claim_code"]);

export async function getSetting(db: D1Database, key: string): Promise<string | null> {
  const row = await db.prepare("SELECT value FROM settings WHERE key = ?1").bind(key).first<{ value: string }>();
  return row?.value ?? null;
}

export function setSettingStmt(db: D1Database, key: string, value: string): D1PreparedStatement {
  return db
    .prepare("INSERT INTO settings (key, value) VALUES (?1, ?2) ON CONFLICT(key) DO UPDATE SET value = excluded.value")
    .bind(key, value);
}

export async function setSetting(db: D1Database, key: string, value: string): Promise<void> {
  await setSettingStmt(db, key, value).run();
}

/** Simpan nilai hanya jika key belum ada; kembalikan nilai yang berlaku. Aman dari balapan. */
export async function ensureSetting(db: D1Database, key: string, make: () => string): Promise<string> {
  await db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES (?1, ?2)").bind(key, make()).run();
  return (await getSetting(db, key))!;
}

/** Secret env diutamakan; kalau kosong, pakai (atau buat) nilai di tabel settings. */
async function secret(env: Env, envValue: string | undefined, key: string): Promise<string> {
  if (envValue && envValue.length > 0) return envValue;
  return ensureSetting(env.DB, key, () => randomHex(32));
}

export function getWebhookSecret(env: Env): Promise<string> {
  return secret(env, env.WEBHOOK_SECRET, "webhook_secret");
}

export function getSessionSecret(env: Env): Promise<string> {
  return secret(env, env.SESSION_SECRET, "session_secret");
}

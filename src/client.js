import { createClient } from "@supabase/supabase-js";
export const url =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://ndjvbgkxatxtbxqiyiax.supabase.co";
export const key =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_wy8HUHaj5qBlUuzK4zyGWw_icfrym7w";
const legacyPublicKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kanZiZ2t4YXR4dGJ4cWl5aWF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3Nzk4MDcsImV4cCI6MjEwNjM1NTgwN30.0ijtx_fPsyzvvu6LJBZT-j3XOewl-8IJcW3fnZKhcx0";
export const db = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
export async function checked(query) {
  const { data, error } = await query;
  if (error) throw error;
  return data;
}
export async function manage(body) {
  const {
    data: { session },
  } = await db.auth.getSession();
  const r = await fetch(`${url}/functions/v1/manage-accounts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: key,
      Authorization: `Bearer ${session?.access_token || legacyPublicKey}`,
    },
    body: JSON.stringify(body),
  });
  const result = await r.json();
  if (!r.ok) throw new Error(result.error || "İşlem tamamlanamadı.");
  return result;
}
export async function allRows(table, configure = (q) => q) {
  const out = [];
  for (let offset = 0; ; offset += 500) {
    const rows = await checked(
      configure(db.from(table).select("*")).range(offset, offset + 499),
    );
    out.push(...rows);
    if (rows.length < 500) break;
  }
  return out;
}

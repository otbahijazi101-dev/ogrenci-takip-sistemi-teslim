import { createClient } from "npm:@supabase/supabase-js@2.117.2";
const allowedOrigins = new Set([
  "http://127.0.0.1:5173",
  "http://localhost:5173",
  "http://127.0.0.1:4173",
  "http://localhost:4173",
  "https://ogrenci-takip-sistemi-teslim-hygqm64q3.vercel.app",
  "https://ogrenci-takip-sistemi-teslim.vercel.app",
  "https://ogrenci-takip-sistemi-teslim-l6isgoxxm.vercel.app",
]);
const corsHeaders = (origin: string) => ({
  "Access-Control-Allow-Origin": origin,
  Vary: "Origin",
  "Access-Control-Allow-Headers":
    "authorization,apikey,content-type,x-client-info",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
});
const admin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);
const hash = async (s: string) =>
  Array.from(
    new Uint8Array(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)),
    ),
  )
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
Deno.serve(async (req) => {
  const origin = req.headers.get("Origin") || "";
  if (origin && !allowedOrigins.has(origin))
    return new Response("Origin not allowed", { status: 403 });
  const cors = corsHeaders(origin || "http://127.0.0.1:5173");
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: {
        ...cors,
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST")
    return json({ error: "İşlem desteklenmiyor." }, 405);
  try {
    const raw = await req.text();
    if (raw.length > 12000) return json({ error: "İstek çok büyük." }, 413);
    const b = JSON.parse(raw);
    if (b.action === "status") {
      const { data, error } = await admin
        .from("setup_state")
        .select("claimed,expires_at")
        .eq("id", 1)
        .maybeSingle();
      if (error) throw error;
      return json({
        setup_available:
          !!data && !data.claimed && new Date(data.expires_at) > new Date(),
      });
    }
    let caller: string | null = null;
    if (b.action !== "bootstrap") {
      const token = req.headers
        .get("Authorization")
        ?.replace(/^Bearer\s+/i, "");
      if (!token) return json({ error: "Giriş yapın." }, 401);
      const {
        data: { user },
        error,
      } = await admin.auth.getUser(token);
      if (error || !user) return json({ error: "Oturum geçersiz." }, 401);
      const { data: profile } = await admin
        .from("profiles")
        .select("role,active")
        .eq("id", user.id)
        .single();
      if (!profile?.active || profile.role !== "admin")
        return json({ error: "Yönetici yetkisi gerekli." }, 403);
      caller = user.id;
    }
    if (b.action === "create" || b.action === "bootstrap") {
      const username = String(b.username || "")
          .trim()
          .toLowerCase(),
        name = String(b.full_name || "").trim(),
        password = String(b.password || "");
      const role = b.action === "bootstrap" ? "admin" : b.role;
      if (
        !/^[a-z0-9._-]{3,50}$/.test(username) ||
        name.length < 2 ||
        name.length > 120 ||
        password.length < 12 ||
        password.length > 128 ||
        !["admin", "teacher", "parent", "student"].includes(role)
      )
        return json(
          {
            error:
              "Ad, kullanıcı adı, rol ve en az 12 karakterli şifre gerekli.",
          },
          400,
        );
      let claimed = false;
      if (b.action === "bootstrap") {
        if (typeof b.code !== "string" || b.code.length < 40)
          return json({ error: "Kurulum kodu geçersiz." }, 403);
        const { data, error } = await admin
          .from("setup_state")
          .update({ claimed: true })
          .eq("id", 1)
          .eq("claimed", false)
          .eq("token_hash", await hash(b.code))
          .gt("expires_at", new Date().toISOString())
          .select("id");
        if (error) throw error;
        if (!data?.length)
          return json(
            { error: "Kurulum kodu geçersiz veya kullanılmış." },
            403,
          );
        claimed = true;
      }
      const { data, error } = await admin.auth.admin.createUser({
        email: `${username}@ogrenci.invalid`,
        password,
        email_confirm: true,
      });
      if (error) {
        if (claimed)
          await admin
            .from("setup_state")
            .update({ claimed: false })
            .eq("id", 1);
        return json(
          {
            error: "Hesap oluşturulamadı. Kullanıcİ adı kullanılıyor olabilir.",
          },
          400,
        );
      }
      const result = await admin
        .from("profiles")
        .insert({ id: data.user.id, username, full_name: name, role });
      if (result.error) {
        await admin.auth.admin.deleteUser(data.user.id);
        if (claimed)
          await admin
            .from("setup_state")
            .update({ claimed: false })
            .eq("id", 1);
        throw result.error;
      }
      return json({ id: data.user.id, username, role });
    }
    if (b.action === "update") {
      if (
        typeof b.id !== "string" ||
        typeof b.full_name !== "string" ||
        b.full_name.trim().length < 2 ||
        b.full_name.length > 120 ||
        typeof b.active !== "boolean"
      )
        return json({ error: "Hesap bilgileri geçersiz." }, 400);
      if (b.id === caller && !b.active)
        return json(
          { error: "Kendi yönetici hesabınızı pasifleştiremezsiniz." },
          400,
        );
      const { error } = await admin
        .from("profiles")
        .update({ full_name: b.full_name.trim(), active: b.active })
        .eq("id", b.id);
      if (error) throw error;
      // RLS reads the current active flag on every request, including existing JWTs.
      const { error: authError } = await admin.auth.admin.updateUserById(b.id, {
        ban_duration: b.active ? "none" : "876000h",
      });
      if (authError) throw authError;
      return json({ ok: true });
    }
    if (b.action === "reset_password") {
      if (
        typeof b.id !== "string" ||
        typeof b.password !== "string" ||
        b.password.length < 12 ||
        b.password.length > 128
      )
        return json(
          { error: "En az 12 karakterli şifre gerekli." }, 400);
      const { error } = await admin.auth.admin.updateUserById(b.id, {
        password: b.password,
      });
      if (error) throw error;
      return json(
        { ok: true }
      );
    }
    return json({ error: "İşlem geçersiz." }, 400);
  } catch (e) {
    console.error(
      "Account operation failed",
      e instanceof Error ? e.message : "error",
    );
    return json(
      { error: "İşlem tamamlanamadı. Bilgileri kontrol edip yeniden deneyin." },
      400,
    );
  }
});

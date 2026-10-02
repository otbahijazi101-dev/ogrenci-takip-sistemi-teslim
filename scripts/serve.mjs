import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../dist/", import.meta.url));
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
};
const server = createServer(async (req, res) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://*.supabase.co wss://*.supabase.co; img-src 'self' data:; base-uri 'none'; object-src 'none'; frame-ancestors 'none'; form-action 'self'",
  );
  if (!["GET", "HEAD"].includes(req.method)) {
    res.writeHead(405);
    res.end();
    return;
  }
  try {
    const url = new URL(req.url, "http://127.0.0.1");
    const route = decodeURIComponent(url.pathname);
    const file = path.resolve(
      root,
      route === "/" ? "index.html" : route.replace(/^\/+/, ""),
    );
    if (!file.startsWith(root) || !(await stat(file)).isFile()) {
      res.writeHead(404);
      res.end("Dosya bulunamadı.");
      return;
    }
    const data = await readFile(file);
    res.setHeader(
      "Content-Type",
      types[path.extname(file)] || "application/octet-stream",
    );
    res.setHeader("Content-Length", data.length);
    res.writeHead(200);
    res.end(req.method === "HEAD" ? undefined : data);
  } catch {
    res.writeHead(404);
    res.end("Dosya bulunamadı.");
  }
});
server.on("error", (error) => {
  console.error(
    error.code === "EADDRINUSE"
      ? "Uygulama zaten açık olabilir: http://127.0.0.1:4173"
      : "Uygulama başlatılamadı: " + error.message,
  );
  process.exitCode = 1;
});
server.listen(4173, "127.0.0.1", () =>
  console.log(
    "Öğrenci Takip Sistemi hazır: http://127.0.0.1:4173\nYalnızca bu bilgisayarda erişilebilir. Durdurmak için Ctrl+C.",
  ),
);

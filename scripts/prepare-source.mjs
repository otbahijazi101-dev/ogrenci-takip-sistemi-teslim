import { existsSync, mkdirSync, renameSync } from "node:fs";
import extract from "extract-zip";

const required = [
  "src/main.js",
  "src/styles.css",
  "supabase/schema.sql",
  "tests/rls.sql",
  "package-lock.json",
];

const missing = required.filter((file) => !existsSync(file));
if (!missing.length) process.exit(0);

if (!existsSync("missing-source.zip")) {
  throw new Error("Kaynak dosyalar eksik ve missing-source.zip bulunamadı: " + missing.join(", "));
}

await extract("missing-source.zip", { dir: process.cwd() });

const fallbackMoves = [
  ["main.js", "src/main.js"],
  ["styles.css", "src/styles.css"],
  ["schema.sql", "supabase/schema.sql"],
  ["rls.sql", "tests/rls.sql"],
];

for (const [from, to] of fallbackMoves) {
  if (!existsSync(to) && existsSync(from)) {
    mkdirSync(to.split("/").slice(0, -1).join("/"), { recursive: true });
    renameSync(from, to);
  }
}

const stillMissing = required.filter((file) => !existsSync(file));
if (stillMissing.length) {
  throw new Error("Arşiv açıldı ancak bazı kaynaklar hâlâ eksik: " + stillMissing.join(", "));
}

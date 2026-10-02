import { existsSync } from "node:fs";
import { execFileSync } from "node:child_process";

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

execFileSync("unzip", ["-o", "missing-source.zip"], { stdio: "inherit" });

const stillMissing = required.filter((file) => !existsSync(file));
if (stillMissing.length) {
  throw new Error("Arşiv açıldı ancak bazı kaynaklar hâlâ eksik: " + stillMissing.join(", "));
}

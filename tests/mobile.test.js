import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const css = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");

test("iPhone viewport and safe-area support are configured", () => {
  assert.match(html, /width=device-width,initial-scale=1,viewport-fit=cover/);
  assert.match(html, /apple-mobile-web-app-capable/);
  assert.match(css, /env\(safe-area-inset-(?:top|bottom|left|right)\)/);
});

test("Phone controls stay touch-friendly and avoid iOS input zoom", () => {
  assert.match(css, /@media\(max-width:760px\)/);
  assert.match(css, /font-size:16px/);
  assert.match(css, /min-height:44px/);
  assert.match(css, /-webkit-overflow-scrolling:touch/);
  assert.match(css, /\.tracking-table\{min-width:980px\}/);
});

test("Narrow iPhone widths have dedicated layout fallbacks", () => {
  assert.match(css, /@media\(max-width:430px\)/);
  assert.match(css, /@media\(max-width:360px\)/);
  assert.match(css, /\.paper-exam-grid\{grid-template-columns:1fr\}/);
  assert.match(css, /\.simple-nav\{grid-template-columns:1fr\}/);
});

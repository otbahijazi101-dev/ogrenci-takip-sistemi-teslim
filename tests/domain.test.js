import { test } from "node:test";
import assert from "node:assert/strict";
import {
  escape,
  netScore,
  validateEntry,
  loginEmail,
  followupKey,
} from "../src/domain.js";
test("user text cannot create executable HTML", () =>
  assert.equal(
    escape('<img src=x onerror="alert(1)">'),
    "&lt;img src=x onerror=&quot;alert(1)&quot;&gt;",
  ));
test("exam nets respect divisor and preserve negative results", () => {
  assert.equal(netScore(30, 8, 4), 28);
  assert.equal(netScore(30, 9, 3), 27);
  assert.equal(netScore(0, 4, 4), -1);
});
test("invalid study and exam inputs are rejected", () => {
  assert.throws(() =>
    validateEntry("study", { resource: "Kitap", questions: -1 }),
  );
  assert.throws(() => validateEntry("exam", { correct: 5, wrong: "x" }));
  assert.throws(() => validateEntry("other", {}));
});
test("reading dates have a valid order and completed books require a date", () => {
  assert.throws(() =>
    validateEntry("reading", { book: "Kitap", status: "Tamamladı" }),
  );
  assert.throws(() =>
    validateEntry("reading", {
      book: "Kitap",
      started: "2026-10-01",
      finished: "2026-09-01",
    }),
  );
});
test("username mapping is normalized", () =>
  assert.equal(loginEmail(" OGRENCI.1 "), "ogrenci.1@ogrenci.invalid"));
test("weekly and monthly followups are distinct", () =>
  assert.notEqual(
    followupKey("1", "2026-10-02", 1),
    followupKey("1", "2026-10-03", 2),
  ));

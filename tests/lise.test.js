import test from "node:test";
import assert from "node:assert/strict";
import {
  grades,
  sections,
  validateEntry,
  monthlySummary,
  comparableExams,
  days,
} from "../src/domain.js";
import { guidePage, planCard, monthlyReport } from "../src/notebook.js";
test("Yalnız lise seçenekleri ve aylık takip", () => {
  assert.deepEqual(grades, [9, 10, 11, 12]);
  assert.deepEqual(
    sections.followup.fields.find((x) => x.key === "week").options,
    ["Aylık değerlendirme"],
  );
  assert.throws(() => validateEntry("followup", { week: "1" }));
});
test("Denemeler tür ve derse göre ayrılır, net negatif olabilir", () => {
  const entries = [
    {
      kind: "exam",
      record_date: "2026-10-01",
      payload: {
        exam_type: "TYT",
        subject: "Genel",
        correct: "0",
        wrong: "4",
        divisor: "4",
        score: "100",
      },
    },
    {
      kind: "exam",
      record_date: "2026-10-02",
      payload: {
        exam_type: "AYT",
        subject: "Genel",
        correct: "30",
        wrong: "4",
        divisor: "4",
      },
    },
    {
      kind: "study",
      record_date: "2026-10-01",
      payload: { subject: "Matematik", resource: "A", questions: "20" },
    },
    {
      kind: "study",
      record_date: "2026-09-01",
      payload: { subject: "Matematik", resource: "B", questions: "900" },
    },
  ];
  const s = monthlySummary(entries, "2026-10");
  assert.equal(s.exams.length, 2);
  assert.equal(s.exams[0].net, -1);
  assert.equal(s.study[0].questions, 20);
  assert.equal(comparableExams(entries, "TYT").length, 1);
});
test("Yeni alanlar doğrulanır", () => {
  assert.throws(() =>
    validateEntry("analysis", { exam_name: "   ", topic: "a", action: "b" }),
  );
  assert.throws(() => validateEntry("note", { title: "A", notes: "" }));
  assert.throws(() =>
    validateEntry("analysis", {
      exam_name: "A",
      topic: "B",
      action: "C",
      review_date: "2026-02-30",
    }),
  );
  assert.throws(() => validateEntry("plan", { monday_reading: 1441 }));
  assert.throws(() =>
    validateEntry("exam", { name: "A", correct: 10, wrong: 4, divisor: "3" }),
  );
  assert.ok(
    validateEntry("analysis", {
      exam_name: "A",
      topic: "B",
      action: "C",
      cause: "Bilgi eksikliği",
    }),
  );
});
test("Haftalık plan yedi günü ve yapılandırılmış alanları içerir", () => {
  for (const [d] of days)
    for (const key of [
      d,
      d + "_homework",
      d + "_paragraph",
      d + "_review",
      d + "_reading",
      d + "_done",
    ])
      assert.ok(sections.plan.fields.some((f) => f.key === key));
  assert.match(
    planCard({ monday: "<img src=x>", monday_done: true }),
    /&lt;img src=x&gt;/,
  );
});
test("Defter rehberleri ve aylık rapor boş durumda da görüntülenir", () => {
  assert.match(guidePage(), /Veli görüşmesi ilkeleri/);
  assert.match(guidePage(), /Deneme analizi/);
  assert.match(
    monthlyReport([], "2026-10", () => ""),
    /Toplam çözülen soru: 0/,
  );
});

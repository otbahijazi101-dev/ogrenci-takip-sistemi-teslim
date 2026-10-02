import test from "node:test";
import assert from "node:assert/strict";
import { monthlySummary, notebookYear } from "../src/domain.js";
import { monthlyReport, yearlyReport, guidePage } from "../src/notebook.js";
import {
  school,
  schoolBrand,
  schoolHeading,
  printHeading,
} from "../src/school.js";

const record = (kind, payload, record_date = "2026-10-02") => ({
  kind,
  payload,
  record_date,
});
const study = (resource, questions, subject = "Matematik", topic = "") =>
  record("study", { subject, resource, questions, topic });
const exam = (score, exam_type = "TYT", subject = "Genel") =>
  record("exam", {
    name: "Örnek <yayın>",
    exam_type,
    subject,
    correct: 80,
    wrong: 12,
    blank: 8,
    divisor: 4,
    score,
  });

test("Kaynak başına soru toplamı hesaplanır; farklı ders ve aylar karışmaz", () => {
  const result = monthlySummary(
    [
      study("A", 20, "Matematik", "Kümeler"),
      study("A", 30, "Matematik", "Kümeler"),
      study("B", 10),
      study("A", 15, "Türkçe"),
      record(
        "study",
        { subject: "Matematik", resource: "A", questions: 999 },
        "2026-11-01",
      ),
    ],
    "2026-10",
  );
  assert.equal(result.resources.length, 3);
  assert.deepEqual(result.resources[0], {
    subject: "Matematik",
    resource: "A",
    questions: 50,
    topics: ["Kümeler"],
  });
  assert.equal(
    result.study.reduce((n, x) => n + x.questions, 0),
    75,
  );
  assert.throws(() => monthlySummary([], "2026-1"));
  assert.throws(() => monthlySummary([], "2026-13"));
});

test("Deneme puan toplamı ve ortalaması yalnız puanı girilenlerden oluşur", () => {
  const records = [
    exam(0),
    exam(300),
    exam(""),
    exam(500, "AYT"),
    exam(90, "TYT", "Matematik"),
  ];
  const groups = monthlySummary(records, "2026-10").exams;
  assert.equal(groups.length, 3);
  assert.equal(groups[0].count, 3);
  assert.equal(groups[0].scored, 2);
  assert.equal(groups[0].score, 300);
  const html = monthlyReport(records, "2026-10", () => "");
  assert.match(html, /Puan toplamı/);
  assert.match(html, /Puanı girilen: 2 \/ 3/);
  assert.match(html, /150\.00/);
  assert.match(html, /Örnek &lt;yayın&gt;/);
});

test("Defterin Ekim–Mayıs ayları eğitim yılı geçişini doğru işler", () => {
  const report = notebookYear(
    [
      study("A", 20),
      record(
        "followup",
        { progress* "Yükselmiş", meeting_date: "2027-01-20" },
        "2027-01-20",
      ),
      record("followup", { progress: "Düşmüş" }, "2027-01-10"),
      record("parent_meeting", {}, "2027-01-15"),
    ],
    "2026-2027",
    "2026-10",
  );
  assert.equal(report.months.length, 8);
  assert.equal(report.months[0].month, "2026-10");
  assert.equal(report.months[7].month, "2027-05");
  assert.equal(report.months[3].progress, "Yükselmiş");
  assert.equal(report.months[3].parentMeetings, 1);
  assert.equal(notebookYear([], "", "2027-02").schoolYear, "2026–2027");
  assert.equal(
    notebookYear([], "2026/2027", "2027-02").schoolYear,
    "2026–2027",
  );
});

test("Rapor boş ayı açık belirtir; kaynak ve okul metinleri güvenli görüntülenir", () => {
  assert.match(yearlyReport([], "2026–2027", "2026-10"), /Kayıt yok/);
  assert.match(yearlyReport([], "2026–2027", "2026-10"), /data-id="2027-05"/);
  const html = monthlyReport(
    [study("<script>alert(1)</script>", 10)],
    "2026-10",
    () => "",
  );
  assert.ok(!html.includes("<script>"));
  assert.match(html, /&lt;script&gt;/);
  assert.match(guidePage(), /Devamsızlığı/);
  assert.match(schoolBrand(), /DÜZCE FENTEK/);
  assert.match(schoolHeading(), /rel="noopener noreferrer"/);
  assert.ok(printHeading().includes(school.name));
});

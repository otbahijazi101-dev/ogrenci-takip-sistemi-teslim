export const roles = {
  admin: "Yönetici",
  teacher: "Öğretmen",
  parent: "Veli",
  student: "Öğrenci",
};
export function escape(s = "") {
  return String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
}
export function loginEmail(value) {
  const v = value.trim().toLowerCase();
  return v.includes("@") ? v : `${v}@ogrenci.invalid`;
}
export function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function displayDate(value) {
  return value
    ? new Date(value.slice(0, 10) + "T12:00:00").toLocaleDateString("tr-TR")
    : "—";
}
export function netScore(correct, wrong, divisor = 4) {
  return (
    Math.round((Number(correct) - Number(wrong) / Number(divisor)) * 100) / 100
  );
}
export function initials(name) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((x) => x[0])
    .join("")
    .toLocaleUpperCase("tr");
}
export function labelValue(v) {
  return v === true
    ? "Evet"
    : v === false
      ? "Hayır"
      : v == null || v === ""
        ? "—"
        : v;
}
export function monthLabel(date) {
  return new Date(date + "T12:00:00").toLocaleDateString("tr-TR", {
    month: "long",
    year: "numeric",
  });
}
export function followupKey(studentId, date, week) {
  return `${studentId}/${date.slice(0, 7)}/${week || 0}`;
}
export const grades = [9, 10, 11, 12];
export const subjects = [
  "Türkçe",
  "Matematik",
  "Sosyal",
  "Fen",
  "Türk Dili ve Edebiyatı",
  "Geometri",
  "Fizik",
  "Kimya",
  "Biyoloji",
  "Tarih",
  "Coğrafya",
  "Felsefe",
  "Din Kültürü",
  "İngilizce",
  "Meslek Dersleri",
  "Diğer",
];
export const days = [
  ["monday", "Pazartesi"],
  ["tuesday", "Salı"],
  ["wednesday", "Çarşamba"],
  ["thursday", "Perşembe"],
  ["friday", "Cuma"],
  ["saturday", "Cumartesi"],
  ["sunday", "Pazar"],
];
export const ratings = ["İyi", "Orta", "Destek gerekli"];
const f = (key, label, type = "text", extra = {}) => ({
  key,
  label,
  type,
  ...extra,
});
export const sections = {
  followup: {
    title: "Aylık değerlendirme",
    icon: "▦",
    fields: [
      f("week", "Takip dönemi", "select", {
        options: ["Aylık değerlendirme"],
      }),
      f("homework", "Ödev yapma durumu", "select", { options: ratings }),
      f("adaptation", "Okul ve sınıf kültürüne uyum", "select", {
        options: ratings,
      }),
      f("book", "Okuduğu kitap"),
      f("parent_contact", "Veli ile görüşüldü", "checkbox"),
      f("assignment_given", "Ödevlendirme yapıldı", "checkbox"),
      f("monthly_score", "Aylık puan", "number", { min: 0, max: 100 }),
      f("progress", "Önceki görüşmeye göre durum", "select", {
        options: [
          "Henüz değerlendirilmedi",
          "Yükselmiş",
          "Aynı düzeyde",
          "Düşmüş",
        ],
      }),
      f("meeting_date", "Görüşme tarihi", "date"),
      f("next_goal", "Gelecek ayın hedefi", "textarea"),
      f("notes", "Önemli notlar", "textarea"),
    ],
  },
  study: {
    title: "Ders çalışması",
    icon: "▤",
    fields: [
      f("subject", "Ders", "select", {
        options: subjects,
      }),
      f("resource", "Kaynak", "text", { required: true }),
      f("topic", "Konu"),
      f("questions", "Çözülen soru sayısı", "number", {
        required: true,
        min: 0,
        max: 100000,
      }),
    ],
  },
  exam: {
    title: "Deneme sonuçları",
    icon: "▥",
    fields: [
      f("name", "Deneme adı / yayın", "text", { required: true }),
      f("exam_type", "Deneme türü", "select", {
        options: ["Genel", "TYT", "AYT", "Branş"],
      }),
      f("subject", "Ders", "select", {
        options: ["Genel", ...subjects],
      }),
      f("correct", "Doğru", "number", { required: true, min: 0, max: 500 }),
      f("wrong", "Yanlış", "number", { required: true, min: 0, max: 500 }),
      f("blank", "Boş", "number", { min: 0, max: 500 }),
      f("divisor", "Bir doğruyu götüren yanlış", "select", {
        options: ["4"],
      }),
      f("score", "Puan", "number", { min: 0, max: 1000, step: "0.01" }),
      f("notes", "Değerlendirme", "textarea"),
    ],
  },
  student_meeting: {
    title: "Öğrenci görüşmesi",
    icon: "◉",
    fields: [
      f("activities", "Serbest zamanda yaptığı etkinlikler", "textarea"),
      f("books", "Okuduğu kitaplar"),
      f("assignments", "Verilen ödevler", "textarea"),
      f("notes", "Görüşme notları", "textarea"),
    ],
  },
  parent_meeting: {
    title: "Veli görüşmesi",
    icon: "◎",
    fields: [
      f("home_study", "Evde ders çalışma durumu", "select", {
        options: ratings,
      }),
      f("relations", "Okul arkadaşlarıyla ilişkisi", "select", {
        options: ratings,
      }),
      f("phone", "Telefon ve benzeri araçlarla geçirdiği süre", "select", {
        options: ratings,
      }),
      f("notes", "Veli görüşme notları", "textarea"),
    ],
  },
  reading: {
    title: "Okuma takibi",
    icon: "▣",
    selfWrite: true,
    fields: [
      f("book", "Kitap adı", "text", { required: true }),
      f("author", "Yazar"),
      f("started", "Başlama tarihi", "date"),
      f("finished", "Bitiş tarihi", "date"),
      f("status", "Okuma durumu", "select", {
        options: ["Okuyor", "Tamamladı", "Ara verdi"],
      }),
      f("notes", "Kitap notu", "textarea"),
    ],
  },
  plan: {
    title: "Haftalık çalışma planı",
    icon: "▧",
    selfWrite: true,
    fields: [
      f("monday", "Pazartesi", "textarea"),
      f("tuesday", "Salı", "textarea"),
      f("wednesday", "Çarşamba", "textarea"),
      f("thursday", "Perşembe", "textarea"),
      f("friday", "Cuma", "textarea"),
      f("saturday", "Cumartesi", "textarea"),
      f("sunday", "Pazar", "textarea"),
      ...days.flatMap(([key, label]) => [
        f(`${key}_homework`, `${label} · Ödevler`),
        f(`${key}_paragraph`, `${label} · Paragraf soru hedefi`, "number", {
          min: 0,
          max: 1000,
        }),
        f(`${key}_review`, `${label} · Günlük tekrar`),
        f(`${key}_reading`, `${label} · Okuma hedefi (dakika)`, "number", {
          min: 0,
          max: 1440,
        }),
        f(`${key}_done`, `${label} · Plan tamamlandı`, "checkbox"),
      ]),
      f("makeup_day", "Telafi günü", "select", {
        options: days.map((x) => x[1]),
      }),
      f("notes", "Tekrar ve telafi planı", "textarea"),
    ],
  },
  analysis: {
    title: "Deneme hata analizi",
    icon: "◇",
    fields: [
      f("exam_name", "Deneme adı / yayın", "text", { required: true }),
      f("subject", "Ders", "select", { options: subjects }),
      f("topic", "Konu / soru numarası", "text", { required: true }),
      f("result", "Soru sonucu", "select", {
        options: ["Yanlış", "Boş", "Doğru ama emin değil"],
      }),
      f("cause", "Hata nedeni", "select", {
        options: [
          "Bilgi eksikliği",
          "Soru çözümü / uygulama eksikliği",
          "Dikkat / okuma hatası",
          "İşlem hatası",
          "Zaman yönetimi",
        ],
      }),
      f("action", "Eksik giderme ve çözüm planı", "textarea", {
        required: true,
      }),
      f("review_date", "Yeniden çözüm tarihi", "date"),
      f("status", "Sonuç", "select", {
        options: ["Planlandı", "Tekrar çalışılıyor", "Eksik giderildi"],
      }),
      f("notes", "Son değerlendirme", "textarea"),
    ],
  },
  note: {
    title: "Notlar",
    icon: "✎",
    fields: [
      f("title", "Başlık", "text", { required: true }),
      f("notes", "Not", "textarea", { required: true }),
    ],
  },
};
export function validateEntry(kind, payload) {
  if (!sections[kind]) throw new Error("Kayıt türü geçersiz.");
  for (const f of sections[kind].fields) {
    const v = payload[f.key];
    if (f.required && (v === "" || v == null))
      throw new Error(`${f.label} gerekli.`);
    if (f.required && typeof v === "string" && !v.trim())
      throw new Error(`${f.label} gerekli.`);
    if (f.type === "select" && v != null && v !== "" && !f.options.includes(v))
      throw new Error(`${f.label} geçersiz.`);
    if (
      f.type === "date" &&
      v &&
      (!/^\d{4}-\d{2}-\d{2}$/.test(v) ||
        !Number.isFinite(Date.parse(v)) ||
        new Date(v).toISOString().slice(0, 10) !== v)
    )
      throw new Error(`${f.label} geçersiz.`);
    if (
      f.type === "number" &&
      v !== "" &&
      v != null &&
      (!Number.isFinite(Number(v)) ||
        Number(v) < (f.min ?? 0) ||
        Number(v) > (f.max ?? 100000))
    )
      throw new Error(`${f.label} geçersiz.`);
    if (typeof v === "string" && v.length > 5000)
      throw new Error(`${f.label} çok uzun.`);
    if (
      f.type === "number" &&
      v !== "" &&
      v != null &&
      !f.step &&
      !Number.isInteger(Number(v))
    )
      throw new Error(`${f.label} tam sayı olmalıdır.`);
  }
  if (
    kind === "reading" &&
    payload.started &&
    payload.finished &&
    payload.finished < payload.started
  )
    throw new Error("Bitiş tarihi başlangıçtan önce olamaz.");
  if (kind === "reading" && payload.status === "Tamamladı" && !payload.finished)
    throw new Error("Tamamlanan kitap için bitiş tarihi gerekli.");
  return payload;
}

export function monthlySummary(entries, month) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month))
    throw new Error("Defter ayı geçersiz.");
  const rows = entries.filter((x) => x.record_date.slice(0, 7) === month);
  const study = subjects
    .map((subject) => ({
      subject,
      questions: rows
        .filter((x) => x.kind === "study" && x.payload.subject === subject)
        .reduce((n, x) => n + Number(x.payload.questions || 0), 0),
      resources: [
        ...new Set(
          rows
            .filter((x) => x.kind === "study" && x.payload.subject === subject)
            .map((x) => x.payload.resource),
        ),
      ],
    }))
    .filter((x) => x.questions || x.resources.length);
  const groups = new Map();
  const resources = new Map();
  for (const row of rows.filter((x) => x.kind === "study")) {
    const p = row.payload;
    const key = JSON.stringify([p.subject, p.resource]);
    const item = resources.get(key) || {
      subject: p.subject,
      resource: p.resource,
      questions: 0,
      topics: [],
    };
    item.questions += Number(p.questions || 0);
    if (p.topic && !item.topics.includes(p.topic)) item.topics.push(p.topic);
    resources.set(key, item);
  }
  for (const row of rows.filter((x) => x.kind === "exam")) {
    const p = row.payload,
      key = `${p.exam_type || "Genel"} / ${p.subject || "Genel"} / ${p.divisor} yanlış`;
    const g = groups.get(key) || {
      label: key,
      count: 0,
      correct: 0,
      wrong: 0,
      blank: 0,
      net: 0,
      score: 0,
      scored: 0,
    };
    g.count++;
    g.correct += Number(p.correct);
    g.wrong += Number(p.wrong);
    g.blank += Number(p.blank || 0);
    g.net += netScore(p.correct, p.wrong, p.divisor);
    if (p.score !== "" && p.score != null) {
      g.score += Number(p.score);
      g.scored++;
    }
    groups.set(key, g);
  }
  return {
    study,
    resources: [...resources.values()].sort(
      (a, b) =>
        a.subject.localeCompare(b.subject, "tr") ||
        a.resource.localeCompare(b.resource, "tr"),
    ),
    exams: [...groups.values()],
    rows,
  };
}

export function notebookYear(entries, schoolYear, selectedMonth) {
  const match = /^(\d{4})\s*[-–/]\s*(\d{4})$/.exec(schoolYear || "");
  const selectedYear = Number(selectedMonth.slice(0, 4));
  const start =
    match && Number(match[2]) === Number(match[1]) + 1
      ? Number(match[1])
      : selectedYear - (Number(selectedMonth.slice(5, 7)) < 9 ? 1 : 0);
  const months = [10, 11, 12, 1, 2, 3, 4, 5].map(
    (m) => `${start + (m < 9 ? 1 : 0)}-${String(m).padStart(2, "0")}`,
  );
  return {
    schoolYear: `${start}–${start + 1}`,
    months: months.map((month) => {
      const summary = monthlySummary(entries, month);
      const followups = summary.rows
        .filter((x) => x.kind === "followup")
        .sort(
          (a, b) =>
            b.record_date.localeCompare(a.record_date) ||
            (b.updated_at || "").localeCompare(a.updated_at || ""),
        );
      return {
        month,
        questions: summary.study.reduce((n, x) => n + x.questions, 0),
        exams: summary.rows.filter((x) => x.kind === "exam").length,
        parentMeetings: summary.rows.filter((x) => x.kind === "parent_meeting")
          .length,
        studentMeetings: summary.rows.filter(
          (x) => x.kind === "student_meeting",
        ).length,
        progress: followups[0]?.payload.progress || "—",
        meetingDate: followups[0]?.payload.meeting_date || "",
        records: summary.rows.length,
      };
    }),
  };
}
export function comparableExams(entries, type = "Genel", subject = "Genel") {
  return entries
    .filter(
      (x) =>
        x.kind === "exam" &&
        (x.payload.exam_type || "Genel") === type &&
        x.payload.subject === subject &&
        String(x.payload.divisor) === "4",
    )
    .sort((a, b) => a.record_date.localeCompare(b.record_date));
}

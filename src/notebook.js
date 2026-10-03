import {
  escape as e,
  days,
  sections,
  monthlySummary,
  notebookYear,
  displayDate,
  monthLabel,
  netScore,
} from "./domain.js";

export function guidePage() {
  const guides = [
    [
      "Veli görüşmesi ilkeleri",
      "Lise defterleri · s. 2",
      [
        "Görüşmeyi önyargısız yürütün; öğrenciyi küçümseyen ve suçlayan ifadelerden kaçının.",
        "Veliyi dikkatle dinleyin. Başka öğrencilerle kıyaslamadan öğrencinin kendi gelişimini ele alın.",
        "Devamsızlığı öğrenciyi okuldan uzaklaştırmadan konuşun; aileden, okula gelmediği günlerde nerede olduğunu takip etmesini isteyin.",
        "Başarısızlığın nedenlerini birlikte araştırın; öğrenci ve velinin çözümün içinde olmasını sağlayın.",
        "Ders, dinlenme ve ilgi alanları arasında denge kurun. Yetenekleri ve ders dışı uğraşları destekleyin.",
        "Ergenlik dönemindeki duyguları dikkate alın; açık iletişim, tutarlılık ve aileyle iş birliği kurun.",
        "Hassas durumları mahremiyet içinde ele alın. Görüşmenin tarihini, değerlendirmeyi ve verilen ödevleri kaydedin.",
        "Zararlı alışkanlıkları yargılamadan ve öğrenciyi başkalarının önünde küçük düşürmeden ele alın; güven ve empatiyi koruyun.",
      ],
    ],
    [
      "Verimli ders çalışma",
      "Lise defterleri · s. 4",
      [
        "Çalışma masasında yalnızca gerekli ders malzemelerini bulundurun; dikkat dağıtıcıları kaldırın.",
        "Kısa ve uzun vadeli hedefler belirleyin. Farklı soru türlerini çözün.",
        "Düzenli molalar verin, hareket edin ve odayı havalandırın.",
        "Telefon ve benzeri araçları ders için gerekmiyorsa çalışma alanından uzaklaştırın.",
        "Defterin önerisine göre çalışma sırasında müzik dinlemeyin; yemek ve benzeri ihtiyaçları molalara bırakın.",
        "Günlük, haftalık ve aylık tekrarları planlayın. Yanlış soruların nedenlerini analiz edin.",
      ],
    ],
    [
      "Soru ve deneme çözümü",
      "Lise defterleri · s. 5",
      [
        "Önce soru kökünü okuyun ve isteneni belirleyin; sonra metindeki önemli noktaları işaretleyin.",
        "Bütün seçenekleri değerlendirin. Yalnızca önemli yerlerin altını çizin.",
        "Tek soruda gereğinden fazla zaman harcamayın; kalan sürede dönmek için işaretleyin.",
        "Emin olmadığınız yanıtları sınavın yanlış-doğru kuralını dikkate alarak değerlendirin.",
      ],
    ],
    [
      "Deneme analizi",
      "Lise defterleri · s. 6 · Şeymanur Zümbül akışının özeti",
      [
        "Doğru cevabı bilinçli verdiyseniz sonraki soruya geçin; emin değilseniz eksik konuyu belirleyin.",
        "Yanlış soruda bilgi eksikliği varsa konuyu yeniden çalışın.",
        "Bilgi tam ama uygulama eksikse aynı konunun farklı soru türlerini çözün.",
        "Dikkat, okuma veya işlem hatasını adlandırın; telafi çalışması ve yeniden çözüm tarihi belirleyin.",
      ],
    ],
    [
      "Haftalık program",
      "Lise defterleri · s. 7",
      [
        "Ödev, paragraf, ders, günlük tekrar ve okuma süresini her gün için ayrı planlayın.",
        "Defterin paragraf hedefi günlük en az 20 sorudur; öğrencinin planına bu hedefi girin.",
        "Günlük çalışmaya paragraf sorularıyla başlayın.",
        "Bitirilen konu için farklı kaynaklardaki soruları çözün.",
        "Tamamlanmayan çalışmalar için haftada bir telafi günü ayırın.",
      ],
    ],
  ];
  return (
    '<p class="muted">Kaynak defterlerin rehber bölümlerinin sadeleştirilmiş özeti.</p>' +
    guides
      .map(
        ([title, source, items]) =>
          `<section class="panel guide"><h2>${e(title)}</h2><small>${e(source)}</small><ul>${items.map((x) => `<li>${e(x)}</li>`).join("")}</ul></section>`,
      )
      .join("")
  );
}

export function planFields(field, values) {
  return (
    `<div class="wide plan-grid">${days
      .map(
        ([key, label]) =>
          `<fieldset><legend>${label}</legend>${field({ key, label: "Dersler / konular", type: "textarea" }, values[key] || "")}${sections.plan.fields
            .filter((f) => f.key.startsWith(key + "_"))
            .map((f) =>
              field(
                { ...f, label: f.label.split(" · ")[1] },
                values[f.key] ?? (f.key.endsWith("_paragraph") ? "20" : ""),
              ),
            )
            .join("")}</fieldset>`,
      )
      .join("")}</div>` +
    sections.plan.fields
      .filter((f) => ["makeup_day", "notes"].includes(f.key))
      .map((f) => field(f, values[f.key] || ""))
      .join("")
  );
}
export function planCard(payload) {
  return `<div class="table-wrap"><table><thead><tr><th>Gün</th><th>Ödev / Ders</th><th>Paragraf</th><th>Tekrar</th><th>Okuma</th><th>Durum</th></tr></thead><tbody>${days.map(([key, label]) => `<tr><th>${label}</th><td class="wrap">${e(payload[key] || "—")}<br><small>${e(payload[key + "_homework"] || "")}</small></td><td>${e(payload[key + "_paragraph"] || "—")}</td><td class="wrap">${e(payload[key + "_review"] || "—")}</td><td>${e(payload[key + "_reading"] || "—")} dk</td><td>${payload[key + "_done"] ? "Tamamlandı" : "Planlandı"}</td></tr>`).join("")}</tbody></table></div><p>Telafi günü: ${e(payload.makeup_day || "—")}</p><p>${e(payload.notes || "")}</p>`;
}
export function monthlyReport(entries, month, entryCard, options = {}) {
  const report = monthlySummary(entries, month);
  const role = options.role || "parent";
  const schoolYear = options.schoolYear || "";
  const canStaffWrite = role === "admin" || role === "teacher";
  const canStudentWrite = role === "student";
  const table = (heads, rows) =>
    `<div class="table-wrap"><table><thead><tr>${heads.map((x) => `<th scope="col">${x}</th>`).join("")}</tr></thead><tbody>${rows.join("") || `<tr><td colspan="${heads.length}" class="muted">Bu ay için kayıt yok.</td></tr>`}</tbody></table></div>`;

  const exams = report.rows
    .filter((x) => x.kind === "exam")
    .sort((a, b) => a.record_date.localeCompare(b.record_date));
  const readings = report.rows.filter((x) => x.kind === "reading");
  const completedBooks = readings.filter((x) => x.payload.status === "Tamamladı").length;
  const parentMeetings = report.rows.filter((x) => x.kind === "parent_meeting").length;
  const studentMeetings = report.rows.filter((x) => x.kind === "student_meeting").length;
  const plans = report.rows.filter((x) => x.kind === "plan").length;
  const followups = report.rows.filter((x) => x.kind === "followup");
  const analyses = report.rows.filter((x) => x.kind === "analysis");
  const totalQuestions = report.study.reduce((sum, x) => sum + x.questions, 0);

  const yearMatch = /^(\\d{4})\\s*[-–/]\\s*(\\d{4})$/.exec(schoolYear || "");
  const selectedYear = Number(month.slice(0, 4));
  const startYear =
    yearMatch && Number(yearMatch[2]) === Number(yearMatch[1]) + 1
      ? Number(yearMatch[1])
      : selectedYear - (Number(month.slice(5, 7)) < 9 ? 1 : 0);
  const notebookMonths = [10, 11, 12, 1, 2, 3, 4, 5].map(
    (m) => `${startYear + (m < 9 ? 1 : 0)}-${String(m).padStart(2, "0")}`,
  );

  const action = (kind, label) =>
    `<button class="notebook-action" data-action="new-entry" data-id="${kind}">${label}</button>`;

  let actions = "";
  if (canStaffWrite) {
    actions = [
      action("followup", "Aylık değerlendirme"),
      action("study", "Ders / soru kaydı"),
      action("exam", "Deneme sonucu"),
      action("analysis", "Deneme analizi"),
      action("student_meeting", "Öğrenci görüşmesi"),
      action("parent_meeting", "Veli görüşmesi"),
      action("reading", "Kitap / okuma"),
      action("plan", "Haftalık plan"),
    ].join("");
  } else if (canStudentWrite) {
    actions = [
      action("reading", "Okuma kaydı ekle"),
      action("plan", "Haftalık plan ekle"),
    ].join("");
  }

  const latestFollowup = followups
    .slice()
    .sort((a,b)=>b.record_date.localeCompare(a.record_date))[0];
  const progress = latestFollowup?.payload?.progress || "Henüz değerlendirilmedi";
  const coreSubjects = ["Türkçe","Matematik","Sosyal","Fen"];
  const subjectExamSummary = coreSubjects.map((subject) => ({
    subject,
    rows: exams.filter((x) => x.payload.subject === subject),
  }));
  const statusCards = [
    [totalQuestions, "Çözülen soru", totalQuestions > 0],
    [exams.length, "Deneme", exams.length > 0],
    [parentMeetings, "Veli görüşmesi", parentMeetings > 0],
    [studentMeetings, "Öğrenci görüşmesi", studentMeetings > 0],
    [completedBooks, "Tamamlanan kitap", completedBooks > 0],
    [plans, "Haftalık plan", plans > 0],
  ];

  const roleNote =
    role === "parent"
      ? "Bu ekranda yalnızca okulun veliyle paylaşmayı uygun gördüğü kayıtlar görünür."
      : role === "student"
        ? "Okuma ve haftalık plan kayıtlarını siz de ekleyebilirsiniz. Diğer bölümler okul tarafından paylaşılır."
        : "Bu ekran kâğıt öğrenci takip defterinin aylık dijital karşılığıdır.";

  return `<div class="notebook-month-strip" aria-label="Defter ayları">${notebookMonths
    .map(
      (m) =>
        `<button data-action="open-month" data-id="${m}" class="${m === month ? "active" : ""}">${monthLabel(m + "-01").replace(/ \\d{4}$/, "")}</button>`,
    )
    .join("")}</div>
  <section class="panel notebook-report">
    <div class="panel-head notebook-title">
      <div><span class="eyebrow">Öğrenci takip defteri · aylık dijital sayfa</span><h2>${monthLabel(month + "-01")}</h2><p>${e(roleNote)}</p></div>
      <button class="link" data-action="print">Yazdır / PDF</button>
    </div>
    ${actions ? `<div class="notebook-actions">${actions}</div>` : ""}
    <div class="notebook-status">${statusCards
      .map(
        ([value, label, ok]) =>
          `<div class="notebook-status-card ${ok ? "complete" : "missing"}"><strong>${value}</strong><span>${label}</span><small>${ok ? "Kayıt var" : "Bu ay kayıt yok"}</small></div>`,
      )
      .join("")}</div>

    <div class="notebook-section-heading"><div><span>01</span><h3>Ders çalışma · kaynak ve soru takibi</h3></div>${canStaffWrite ? action("study", "+ Kayıt") : ""}</div>
    <p class="pad muted notebook-help">Defterdeki gibi her ders ve kaynak ayrı izlenir. Aynı ders/kaynağın ay içindeki kayıtları toplam soru sayısında birleştirilir.</p>
    ${table(
      ["Ders", "Kaynak / konu", "Çözülen soru"],
      report.resources.map(
        (x) =>
          `<tr><td>${e(x.subject)}</td><td class="wrap">${e(x.resource)}${x.topics.length ? `<small class="table-note">${e(x.topics.join(" · "))}</small>` : ""}</td><td><strong>${x.questions}</strong></td></tr>`,
      ),
    )}
    <div class="pad"><div class="subject-totals">${report.study.map((x) => `<span>${e(x.subject)} <strong>${x.questions}</strong></span>`).join("")}</div><strong>Toplam çözülen soru: ${totalQuestions}</strong></div>

    <div class="notebook-section-heading"><div><span>02</span><h3>Deneme sonuçları ve analiz</h3></div>${canStaffWrite ? action("exam", "+ Deneme") : ""}</div>
    <div class="paper-exam-grid">
      ${subjectExamSummary.map(({subject,rows})=>`<section><h4>${e(subject)}</h4>${rows.length ? rows.map((x)=>`<div class="paper-exam-row"><strong>${e(x.payload.name)}</strong><span>D ${e(x.payload.correct)} · Y ${e(x.payload.wrong)} · Net ${netScore(x.payload.correct,x.payload.wrong,x.payload.divisor)} · Puan ${x.payload.score===""||x.payload.score==null?"—":e(x.payload.score)}</span></div>`).join("") : '<p class="muted">Kayıt yok</p>'}</section>`).join("")}
    </div>
    ${table(
      ["Tarih / yayın", "Tür / ders", "Doğru", "Yanlış", "Boş", "Net", "Puan"],
      exams.map((x) => {
        const p = x.payload;
        return `<tr><td class="wrap">${e(p.name)}<small class="table-note">${displayDate(x.record_date)}</small></td><td class="wrap">${e(p.exam_type || "Genel")} · ${e(p.subject || "Genel")}</td><td>${e(p.correct)}</td><td>${e(p.wrong)}</td><td>${e(p.blank || 0)}</td><td><strong>${netScore(p.correct, p.wrong, p.divisor)}</strong></td><td>${p.score === "" || p.score == null ? "—" : e(p.score)}</td></tr>`;
      }),
    )}
    ${analyses.length ? `<div class="notebook-subrecords"><h4>Deneme hata analizleri</h4>${analyses.map(entryCard).join("")}</div>` : ""}

    <div class="notebook-section-heading"><div><span>03</span><h3>Aylık değerlendirme ve rehberlik</h3></div>${canStaffWrite ? action("followup", "+ Değerlendirme") : ""}</div>
    <div class="progress-highlight ${progress==="Yükselmiş"?"up":progress==="Düşmüş"?"down":progress==="Aynı düzeyde"?"same":""}">
      <span>Bir önceki görüşmeye göre öğrencinin durumu</span>
      <strong>${e(progress)}</strong>
      ${latestFollowup?.payload?.meeting_date ? `<small>Görüşme tarihi: ${displayDate(latestFollowup.payload.meeting_date)}</small>` : ""}
    </div>
    <div class="notebook-record-grid">
      <section><h4>Aylık değerlendirme</h4>${followups.length ? followups.map(entryCard).join("") : '<p class="muted">Bu ay aylık değerlendirme kaydı yok.</p>'}</section>
      <section><h4>Öğrenci görüşmesi</h4>${studentMeetings ? report.rows.filter((x) => x.kind === "student_meeting").map(entryCard).join("") : '<p class="muted">Bu ay öğrenci görüşmesi kaydı yok.</p>'}</section>
      <section><h4>Veli görüşmesi</h4>${parentMeetings ? report.rows.filter((x) => x.kind === "parent_meeting").map(entryCard).join("") : '<p class="muted">Bu ay veli görüşmesi kaydı yok.</p>'}</section>
    </div>

    <div class="notebook-section-heading"><div><span>04</span><h3>Okuma ve haftalık çalışma planı</h3></div></div>
    <div class="notebook-record-grid two">
      <section><div class="notebook-subhead"><h4>Okuma takibi</h4>${canStaffWrite || canStudentWrite ? action("reading", "+ Okuma") : ""}</div>${readings.length ? readings.map(entryCard).join("") : '<p class="muted">Bu ay okuma kaydı yok.</p>'}</section>
      <section><div class="notebook-subhead"><h4>Haftalık çalışma planları</h4>${canStaffWrite || canStudentWrite ? action("plan", "+ Plan") : ""}</div>${plans ? report.rows.filter((x) => x.kind === "plan").map(entryCard).join("") : '<p class="muted">Bu ay haftalık plan kaydı yok.</p>'}</section>
    </div>
  </section>`;
}
export function yearlyReport(entries, schoolYear, selectedMonth) {
  const year = notebookYear(entries, schoolYear, selectedMonth);
  return `<section class="panel notebook-report"><div class="panel-head"><div><span class="eyebrow">${e(year.schoolYear)} eğitim öğretim yılı</span><h2>Yıllık defter</h2></div><button class="link" data-action="print">Yazdır / PDF</button></div><p class="pad muted">Kaynak defterlerdeki Ekim–Mayıs ayları bir arada. Ayrıntılar için ayı açın. Diğer aylara “Defter ayı” alanından ulaşabilirsiniz. Yalnızca görme yetkiniz olan kayıtlar hesaba katılır; boş aylar sıfır puan olarak değerlendirilmez.</p><div class="table-wrap"><table><thead><tr><th scope="col">Ay</th><th scope="col">Soru</th><th scope="col">Deneme</th><th scope="col">Veli / öğrenci görüşmesi</th><th scope="col">Önceki görüşmeye göre</th><th scope="col">Görüşme tarihi</th></tr></thead><tbody>${year.months.map((x) => `<tr><td><button class="link" data-action="open-month" data-id="${x.month}">${monthLabel(x.month + "-01")}</button>${!x.records ? '<small class="table-note">Kayıt yok</small>' : ""}</td><td>${x.records ? x.questions : "—"}</td><td>${x.records ? x.exams : "—"}</td><td>${x.records ? `${x.parentMeetings} / ${x.studentMeetings}` : "—"}</td><td>${e(x.progress)}</td><td>${displayDate(x.meetingDate)}</td></tr>`).join("")}</tbody></table></div></section>`;
}

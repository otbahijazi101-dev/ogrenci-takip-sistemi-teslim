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
export function monthlyReport(entries, month, entryCard) {
  const report = monthlySummary(entries, month);
  const table = (heads, rows) =>
    `<div class="table-wrap"><table><thead><tr>${heads.map((x) => `<th scope="col">${x}</th>`).join("")}</tr></thead><tbody>${rows.join("") || `<tr><td colspan="${heads.length}" class="muted">Bu ay için kayıt yok.</td></tr>`}</tbody></table></div>`;
  const exams = report.rows
    .filter((x) => x.kind === "exam")
    .sort((a, b) => a.record_date.localeCompare(b.record_date));
  return `<section class="panel notebook-report"><div class="panel-head"><div><span class="eyebrow">Öğrenci takip defteri</span><h2>${monthLabel(month + "-01")} · Aylık defter</h2></div><button class="link" data-action="print">Yazdır / PDF</button></div><div class="pad"><h3>Kaynak ve soru takibi</h3><p class="muted">Defterdeki her kaynak için çözülen soru sayısı ayrı gösterilir. Aynı ders ve kaynağın bu aydaki çalışmaları birleştirilir.</p></div>${table(
    ["Ders", "Kaynak / konu", "Çözülen soru"],
    report.resources.map(
      (x) =>
        `<tr><td>${e(x.subject)}</td><td class="wrap">${e(x.resource)}${x.topics.length ? `<small class="table-note">${e(x.topics.join(" · "))}</small>` : ""}</td><td>${x.questions}</td></tr>`,
    ),
  )}<div class="pad"><div class="subject-totals">${report.study.map((x) => `<span>${e(x.subject)} <strong>${x.questions}</strong></span>`).join("")}</div><strong>Toplam çözülen soru: ${report.study.reduce((n, x) => n + x.questions, 0)}</strong><h3>Deneme / yayın ayrıntıları</h3></div>${table(
    ["Tarih / yayın", "Tür / ders", "Doğru", "Yanlış", "Boş", "Net", "Puan"],
    exams.map((x) => {
      const p = x.payload;
      return `<tr><td class="wrap">${e(p.name)}<small class="table-note">${displayDate(x.record_date)}</small></td><td class="wrap">${e(p.exam_type || "Genel")} · ${e(p.subject || "Genel")}</td><td>${e(p.correct)}</td><td>${e(p.wrong)}</td><td>${e(p.blank || 0)}</td><td>${netScore(p.correct, p.wrong, p.divisor)}</td><td>${p.score === "" || p.score == null ? "—" : e(p.score)}</td></tr>`;
    }),
  )}<div class="pad"><h3>Deneme toplamları</h3><p class="muted">Tür, ders ve net hesabı aynı olan kayıtlar kendi grubunda toplanır. Genel deneme ile branş sonuçları birleştirilmez. Puan toplamı defterdeki aritmetik toplamdır; sınav yerleştirme puanı değildir. Eksik puanlar ortalamaya katılmaz.</p></div>${table(
    [
      "Deneme grubu",
      "Adet",
      "Doğru",
      "Yanlış",
      "Boş",
      "Net toplamı",
      "Puan toplamı",
      "Puan ort.",
    ],
    report.exams.map(
      (x) =>
        `<tr><td class="wrap">${e(x.label)}<small class="table-note">Puanı girilen: ${x.scored} / ${x.count}</small></td><td>${x.count}</td><td>${x.correct}</td><td>${x.wrong}</td><td>${x.blank}</td><td>${Math.round(x.net * 100) / 100}</td><td>${x.scored ? x.score.toFixed(2) : "—"}</td><td>${x.scored ? (x.score / x.scored).toFixed(2) : "—"}</td></tr>`,
    ),
  )}${
    report.rows
      .filter((x) =>
        [
          "followup",
          "parent_meeting",
          "student_meeting",
          "analysis",
          "note",
        ].includes(x.kind),
      )
      .map(entryCard)
      .join("") ||
    '<p class="pad muted">Bu ay için görüşme veya değerlendirme kaydı yok.</p>'
  }</section>`;
}

export function yearlyReport(entries, schoolYear, selectedMonth) {
  const year = notebookYear(entries, schoolYear, selectedMonth);
  return `<section class="panel notebook-report"><div class="panel-head"><div><span class="eyebrow">${e(year.schoolYear)} eğitim öğretim yılı</span><h2>Yıllık defter</h2></div><button class="link" data-action="print">Yazdır / PDF</button></div><p class="pad muted">Kaynak defterlerdeki Ekim–Mayıs ayları bir arada. Ayrıntılar için ayı açın. Diğer aylara “Defter ayı” alanından ulaşabilirsiniz. Yalnızca görme yetkiniz olan kayıtlar hesaba katılır; boş aylar sıfır puan olarak değerlendirilmez.</p><div class="table-wrap"><table><thead><tr><th scope="col">Ay</th><th scope="col">Soru</th><th scope="col">Deneme</th><th scope="col">Veli / öğrenci görüşmesi</th><th scope="col">Önceki görüşmeye göre</th><th scope="col">Görüşme tarihi</th></tr></thead><tbody>${year.months.map((x) => `<tr><td><button class="link" data-action="open-month" data-id="${x.month}">${monthLabel(x.month + "-01")}</button>${!x.records ? '<small class="table-note">Kayıt yok</small>' : ""}</td><td>${x.records ? x.questions : "—"}</td><td>${x.records ? x.exams : "—"}</td><td>${x.records ? `${x.parentMeetings} / ${x.studentMeetings}` : "—"}</td><td>${e(x.progress)}</td><td>${displayDate(x.meetingDate)}</td></tr>`).join("")}</tbody></table></div></section>`;
}

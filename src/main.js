import "./styles.css";
import {
  guidePage,
  planFields,
  planCard,
  monthlyReport,
  yearlyReport,
} from "./notebook.js";
import { school, schoolBrand, schoolHeading, printHeading } from "./school.js";
import { db, checked, manage, allRows } from "./client.js";
import {
  roles,
  grades,
  days,
  comparableExams,
  escape as e,
  loginEmail,
  today,
  displayDate,
  netScore,
  initials,
  labelValue,
  monthLabel,
  sections,
  validateEntry,
} from "./domain.js";

const app = document.querySelector("#app");
const state = {
  profile: null,
  students: [],
  classes: [],
  profiles: [],
  entries: [],
  books: [],
  links: [],
  page: "dashboard",
  studentId: null,
  tab: "overview",
  query: "",
  classFilter: "",
  bookGrade: "9",
  bookQuery: "",
  sampleFilter: "all",
  examType: "TYT",
  month: today().slice(0, 7),
};
let setupAvailable = false,
  toastTimer,
  loadVersion = 0;
const isAdmin = () => state.profile?.role === "admin";
const isStaff = () => ["admin", "teacher"].includes(state.profile?.role);
const cls = (id) => state.classes.find((x) => x.id === id);
const student = () => state.students.find((x) => x.id === state.studentId);
const option = (value, label, selected) =>
  `<option value="${e(value)}" ${String(selected) === String(value) ? "selected" : ""}>${e(label)}</option>`;
function toast(message) {
  const t = document.querySelector("#toast");
  t.textContent = message;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 4000);
}
function errorText(err) {
  if (err?.code === "PGRST116")
    return "Kayıt değişmiş veya erişiminiz yok. Sayfayı yenileyip tekrar deneyin.";
  if (err?.code === "23505")
    return "Bu kayıt zaten var. Mevcut kaydı düzenleyin.";
  if (err?.code === "42501") return "Bu işlem için yetkiniz yok.";
  if (err?.message?.includes("Invalid login"))
    return "Kullanıcı adı veya şifre hatalı.";
  if (err?.message?.includes("fetch"))
    return "Bağlantı kurulamadı. İnternet bağlantınızı kontrol edin.";
  return err?.message || "İşlem tamamlanamadı. Yeniden deneyin.";
}
const btn = (text, action, id = "", secondary = false) =>
  `<button class="btn ${secondary ? "secondary" : ""}" data-action="${action}" data-id="${e(id)}">${text}</button>`;
const empty = (title, text, action = "") =>
  `<div class="empty"><div class="empty-icon">▤</div><h3>${e(title)}</h3><p>${e(text)}</p>${action}</div>`;
function authView(setup = false) {
  app.innerHTML = `<div class="auth"><aside class="auth-aside">${schoolBrand()}<div class="auth-intro"><span class="auth-kicker">9–12. SINIFLAR · DİJİTAL TAKİP DEFTERİ</span><h1>Öğrencinin gelişimi,<br>okulun ortak<br>sorumluluğu.</h1><p class="school-name">${e(school.name)}</p><p>Ders çalışmaları, okuma alışkanlıkları ve rehberlik görüşmeleri; öğrenci, aile ve öğretmen için aynı defterde.</p><div class="auth-pillars"><span>Akademik takip</span><span>Okuma kültürü</span><span>Rehberlik</span></div></div><div class="auth-side-note">Yönetici · Öğretmen · Veli · Öğrenci<a href="${school.website}" target="_blank" rel="noopener noreferrer">Okulun resmî sitesi ↗</a></div></aside><main class="auth-main"><div class="auth-card"><div class="eyebrow">${e(school.shortName)} · Öğrenci Takip</div><h2>${setup ? "İlk yönetici hesabı" : "Hesabınıza giriş yapın"}</h2><p class="muted">${setup ? "Kurulum kodunuzla okulun ilk hesabını oluşturun." : "Okulunuzun verdiği kullanıcı adı ve şifreyi kullanın."}</p><form id="authForm" data-form="${setup ? "bootstrap" : "login"}">${setup ? field({ key: "full_name", label: "Ad soyad", required: true }) + field({ key: "code", label: "Kurulum kodu", type: "password", required: true }) : ""}${field({ key: "username", label: "Kullanıcı adı", required: true, pattern: "[a-zA-Z0-9._-]{3,50}", autocomplete: "username" })}${field({ key: "password", label: "Şifre", type: "password", required: true, minlength: setup ? 12 : undefined, autocomplete: setup ? "new-password" : "current-password" })}<div class="error" id="authError" hidden></div><button class="btn" type="submit">${setup ? "Yönetici hesabını oluştur" : "Giriş yap"}</button></form>${setup ? '<button class="link" data-action="login-view">Giriş ekranına dön</button>' : `${setupAvailable ? '<button class="link" data-action="setup-view">İlk kurulum</button>' : ""}<small>Şifrenizi unuttuysanız okul yöneticinizden yeni şifre isteyin.</small>`}<p class="auth-privacy">Kayıtlar, hesabınıza tanımlanan yetkiye göre gösterilir. İşiniz bittiğinde özellikle ortak cihazlarda çıkış yapın.</p></div></main></div>`;
}
function field(f, value = "", options) {
  const id = `f-${f.key}`;
  const attrs = `id="${id}" name="${e(f.key)}" ${f.required ? "required" : ""} ${f.min !== undefined ? `min="${f.min}"` : ""} ${f.max !== undefined ? `max="${f.max}"` : ""} ${f.step ? `step="${f.step}"` : ""} ${f.minlength ? `minlength="${f.minlength}"` : ""} ${f.pattern ? `pattern="${e(f.pattern)}"` : ""} ${f.autocomplete ? `autocomplete="${f.autocomplete}"` : ""}`;
  if (f.type === "file")
    return `<div class="field wide"><label for="${id}">${e(f.label)}</label><input type="file" ${attrs} accept="image/png,image/jpeg,image/webp"><small>JPG, PNG veya WebP, en fazla 5 MB. Fotoğraf yalnızca yetkili okul personeline görünür.</small></div>`;
  if (f.type === "checkbox")
    return `<div class="field"><label class="checklabel" for="${id}"><input type="checkbox" ${attrs} ${value ? "checked" : ""}>${e(f.label)}</label></div>`;
  const input =
    f.type === "textarea"
      ? `<textarea ${attrs} maxlength="5000">${e(value)}</textarea>`
      : f.type === "select"
        ? `<select ${attrs}>${(options || f.options).map((o) => (typeof o === "object" ? option(o.value, o.label, value) : option(o, o, value))).join("")}</select>`
        : `<input type="${f.type || "text"}" ${attrs} value="${e(value)}" ${(f.type || "text") === "text" ? 'maxlength="200"' : ""}>`;
  return `<div class="field ${f.type === "textarea" || f.wide ? "wide" : ""}"><label for="${id}">${e(f.label)}${f.required ? " *" : ""}</label>${input}${f.hint ? `<small>${e(f.hint)}</small>` : ""}</div>`;
}
function modal(
  title,
  form,
  fields,
  { id = "", note = "", button = "Kaydet" } = {},
) {
  document.querySelector("dialog")?.remove();
  const dialog = document.createElement("dialog");
  dialog.setAttribute("aria-labelledby", "dialogTitle");
  dialog.innerHTML = `<div class="modal-head"><h2 id="dialogTitle">${e(title)}</h2><button class="close" data-action="close" aria-label="Kapat">×</button></div><form data-form="${form}" data-id="${e(id)}">${note ? `<div class="notice" style="margin:20px 25px 0">${e(note)}</div>` : ""}<div class="form-grid">${fields}</div><div class="error" id="formError" hidden></div><div class="form-actions"><button type="button" class="btn secondary" data-action="close">Vazgeç</button><button class="btn" type="submit">${e(button)}</button></div></form>`;
  document.body.append(dialog);
  dialog.showModal();
}
async function loadData() {
  const epoch = ++loadVersion;
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) {
    state.profile = null;
    authView();
    return;
  }
  const p = await checked(
    db.from("profiles").select("*").eq("id", user.id).maybeSingle(),
  );
  if (!p || !p.active) {
    await db.auth.signOut();
    state.profile = null;
    authView();
    throw new Error(
      "Hesabınız henüz tanımlı değil veya pasif. Yöneticiye başvurun.",
    );
  }
  const [students, classes, entries, books, profiles, links] =
    await Promise.all([
      allRows("students", (q) => q.order("full_name").order("id")),
      allRows("classes", (q) => q.order("name").order("id")),
      allRows("entries", (q) =>
        q.order("record_date", { ascending: false }).order("id"),
      ),
      allRows("books", (q) =>
        q.gte("grade", 9).lte("grade", 12).order("title").order("id"),
      ),
      p.role === "admin"
        ? allRows("profiles", (q) => q.order("full_name").order("id"))
        : Promise.resolve([p]),
      p.role === "admin"
        ? allRows("student_links", (q) =>
            q.order("student_id").order("profile_id"),
          )
        : Promise.resolve([]),
    ]);
  if (epoch !== loadVersion) return;
  Object.assign(state, {
    profile: p,
    students,
    classes,
    entries,
    books,
    profiles,
    links,
  });
  render();
}
function render() {
  if (!state.profile) return authView();
  const nav = [
    ["dashboard", "◫", "Genel bakış"],
    ["students", "▦", isStaff() ? "Öğrenciler" : "Öğrenci dosyası"],
    ["books", "▣", "Okuma listeleri"],
    ...(isAdmin()
      ? [
          ["classes", "▧", "Sınıflar"],
          ["accounts", "◎", "Hesaplar"],
          ["controls", "✓", "Kontroller"],
        ]
      : []),
    ["guide", "?", "Defter rehberi"],
    ["password", "⚿", "Şifrem"],
  ];
  const titles = {
    dashboard: "Genel bakış",
    students: isStaff() ? "Öğrenciler" : "Öğrenci dosyası",
    books: "Okuma listeleri",
    classes: "Sınıflar",
    accounts: "Hesaplar",
    controls: "Kontroller",
    profile: "Öğrenci dosyası",
    password: "Şifrem",
    guide: "Defter rehberi",
  };
  app.innerHTML = `<div class="shell"><aside class="sidebar">${schoolBrand()}<div class="sidebar-caption">ÖĞRENCİ GELİŞİM DEFTERİ · 9–12</div><nav class="nav" aria-label="Ana menü">${nav.map(([id, icon, label]) => `<button data-action="nav" data-id="${id}" class="${state.page === id || (state.page === "profile" && id === "students") ? "active" : ""}" ${state.page === id ? 'aria-current="page"' : ""}><span class="nav-icon">${icon}</span>${label}</button>`).join("")}</nav><div class="account"><strong>${e(state.profile.full_name)}</strong><small>${roles[state.profile.role]}</small><button data-action="logout">Hesap değiştir / Çıkış</button></div></aside><main class="main">${schoolHeading()}${printHeading()}<header class="topbar"><div><div class="eyebrow">${roles[state.profile.role]} paneli</div><h1>${titles[state.page]}</h1></div><div class="date">${new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}</div></header><div id="page"></div></main></div>`;
  const pages = {
    dashboard: dashboard,
    students: studentsPage,
    profile: profilePage,
    books: booksPage,
    classes: classesPage,
    accounts: accountsPage,
    controls: controlsPage,
    password: passwordPage,
    guide: guidePage,

  };
  document.querySelector("#page").innerHTML = (
    pages[state.page] || dashboard
  )();
}
function overviewNumbers() {
  const realIds = new Set(
    state.students.filter((s) => !s.is_sample).map((s) => s.id),
  );
  const entries = state.entries.filter(
    (x) => realIds.has(x.student_id) && x.record_date.startsWith(state.month),
  );
  return {
    active: state.students.filter((x) => x.active && !x.is_sample).length,
    followed: new Set(
      entries.filter((x) => x.kind === "followup").map((x) => x.student_id),
    ).size,
    meetings: entries.filter((x) => x.kind.endsWith("meeting")).length,
    read: entries.filter(
      (x) => x.kind === "reading" && x.payload.status === "Tamamladı",
    ).length,
  };
}
function dashboard() {
  const n = overviewNumbers();
  const entries = state.entries.slice(0, 6);
  return `<div class="toolbar"><p class="muted">${isStaff() ? "Öğrencilerinizin güncel kayıtları" : "Sizinle paylaşılan okul kayıtları"}</p>${field({ key: "month-filter", label: "Dönem", type: "month" }, state.month)}</div><div class="stats">${[
    [n.active, "Aktif gerçek öğrenci"],
    [n.followed, "Bu ay takip edilen"],
    [n.meetings, "Bu ay görüşme"],
    [n.read, "Bu ay tamamlanan kitap"],
  ]
    .map(
      ([n, t]) =>
        `<div class="stat"><span>${t}</span><strong>${n}</strong></div>`,
    )
    .join(
      "",
    )}</div>${state.students.some((s) => s.is_sample) ? '<div class="notice">Örnek öğrenciler ve kayıtlar mevcuttur. Yukarıdaki okul istatistiklerine örnek veriler dahil edilmez. Öğrenciler ekranında gerçek ve örnek kayıtları filtreleyebilirsiniz.</div>' : ""}<div class="grid-two"><section class="panel"><div class="panel-head"><h2>Son kayıtlar</h2></div>${
    entries.length
      ? `<div class="mini-list">${entries
          .map((x) => {
            const s = state.students.find((s) => s.id === x.student_id);
            return `<div class="mini-row"><span class="avatar">${sections[x.kind].icon}</span><div><strong>${e(s?.full_name || "Öğrenci")}</strong><small>${sections[x.kind].title} · ${displayDate(x.record_date)}</small></div><button class="link" data-action="open-student" data-id="${x.student_id}">Dosyayı aç</button></div>`;
          })
          .join("")}</div>`
      : empty(
          "Henüz kayıt yok",
          "Öğrenci dosyasından ilk takip kaydını ekleyebilirsiniz.",
          btn("Öğrencilere git", "nav", "students"),
        )
  }</section><section class="panel"><div class="panel-head"><h2>${isStaff() ? "Bu ay takip bekleyenler" : "Öğrenci dosyaları"}</h2></div><div class="mini-list">${
    state.students
      .filter(
        (s) =>
          s.active &&
          (!isStaff() ||
            !state.entries.some(
              (x) =>
                x.student_id === s.id &&
                x.kind === "followup" &&
                x.record_date.startsWith(state.month),
            )),
      )
      .slice(0, 8)
      .map(
        (s) =>
          `<div class="mini-row"><span class="avatar">${e(initials(s.full_name))}</span><div><strong>${e(s.full_name)}</strong><small>${e(cls(s.class_id)?.name || "")}</small></div><button class="link" data-action="open-student" data-id="${s.id}">Aç</button></div>`,
      )
      .join("") || '<div class="empty">Bekleyen takip yok.</div>'
  }</div></section></div>`;
}
function studentRows() {
  return state.students
    .filter(
      (s) =>
        (!state.query ||
          `${s.full_name} ${s.school_number}`
            .toLocaleLowerCase("tr")
            .includes(state.query.toLocaleLowerCase("tr"))) &&
        (!state.classFilter || s.class_id === state.classFilter) &&
        (state.sampleFilter === "all" ||
          (state.sampleFilter === "sample" ? s.is_sample : !s.is_sample)),
    )
    .map(
      (s) =>
        `<tr><td><div class="person"><span class="avatar">${e(initials(s.full_name))}</span><div><strong>${e(s.full_name)}</strong>${s.is_sample ? '<span class="pill">Örnek</span>' : ""}<small>No ${e(s.school_number)}</small></div></div></td><td>${e(cls(s.class_id)?.name || "—")}</td><td><span class="pill ${s.active ? "green" : ""}">${s.active ? "Aktif" : "Arşivde"}</span></td><td><div class="row-actions">${btn("Dosyayı aç", "open-student", s.id, true)}${isAdmin() ? btn("Düzenle", "edit-student", s.id, true) : ""}</div></td></tr>`,
    )
    .join("");
}
function studentsPage() {
  return `<div class="toolbar"><div class="filters"><input id="studentSearch" aria-label="Öğrenci ara" placeholder="Ad veya okul numarasıyla ara" value="${e(state.query)}"><select id="classFilter" aria-label="Sınıf filtresi">${option("", "Tüm sınıflar", state.classFilter)}${state.classes.map((c) => option(c.id, `${c.name} · ${c.school_year}`, state.classFilter)).join("")}</select><select id="sampleFilter" aria-label="Kayıt türü">${[
    ["all", "Tüm kayıtlar"],
    ["real", "Gerçek kayıtlar"],
    ["sample", "Örnek kayıtlar"],
  ]
    .map(([v, l]) => option(v, l, state.sampleFilter))
    .join(
      "",
    )}</select></div>${isAdmin() ? btn("+ Öğrenci ekle", "new-student") : ""}</div><section class="panel">${state.students.length ? `<div class="table-wrap"><table><thead><tr><th>Öğrenci</th><th>Sınıf</th><th>Durum</th><th></th></tr></thead><tbody id="studentRows">${studentRows() || '<tr><td colspan="4">Eşleşen öğrenci yok.</td></tr>'}</tbody></table></div>` : empty("Öğrenci bulunamadı", isAdmin() ? "Önce sınıf oluşturun, ardından öğrenci ekleyin." : "Hesabınıza bağlı bir öğrenci kaydı yok. Okul yöneticinizle görüşün.", isAdmin() ? btn("Öğrenci ekle", "new-student") : "")}</section>`;
}
function profilePage() {
  const s = student();
  if (!s)
    return empty(
      "Öğrenci bulunamadı",
      "Bu kayda erişiminiz olmayabilir.",
      btn("Öğrencilere dön", "nav", "students"),
    );
  const c = cls(s.class_id);
  const mine = state.entries.filter((x) => x.student_id === s.id);
  const tabs = [
    ["overview", "Özet"],
    ["monthly", "Aylık defter"],
    ["yearly", "Yıllık defter"],
    ...Object.entries(sections).map(([k, v]) => [k, v.title]),
    ...(isStaff() ? [["details", "Öğrenci bilgileri"]] : []),
  ];
  let body = "";
  if (state.tab === "overview")
    body = `<div class="grid-two"><section class="panel"><div class="panel-head"><h2>Ayın son 6 kaydı</h2><button class="link" data-action="print">Yazdır</button></div>${
      mine.some((x) => x.record_date.startsWith(state.month))
        ? mine
            .filter((x) => x.record_date.startsWith(state.month))
            .slice(0, 6)
            .map(entryCard)
            .join("")
        : empty(
            "Takip defteri henüz boş",
            "Bir sekme seçerek öğrencinin ilk kaydını ekleyin.",
          )
    }</section><section class="panel"><div class="panel-head"><h2>Genel deneme netleri</h2><select id="examType" aria-label="Grafik deneme türü">${["Genel", "TYT", "AYT"].map((t) => option(t, t, state.examType)).join("")}</select></div>${chart(mine)}<div class="pad"><p class="muted">Aynı ders ve yanlış katsayısıyla girilen genel denemeler karşılaştırılır.</p></div></section></div>`;
  else if (state.tab === "monthly")
    body = monthlyReport(mine, state.month, entryCard);
  else if (state.tab === "yearly")
    body = yearlyReport(mine, c?.school_year, state.month);
  else if (state.tab === "details")
    body = `<section class="panel"><div class="panel-head"><h2>Öğrenci bilgileri</h2>${btn("Bilgileri aç / düzenle", "details")}${btn("Öğrenci fotoğrafı", "photo", "", true)}</div><div class="pad muted">Veli, iletişim, ilgi alanları ve özel durum bilgileri yalnızca yönetici ile atanmış öğretmene görünür.</div></section>`;
  else {
    const kind = state.tab,
      sec = sections[kind],
      records = mine.filter(
        (x) => x.kind === kind && x.record_date.startsWith(state.month),
      );
    body = `${kind === "followup" ? `<div class="notice">9–12. sınıflarda aylık değerlendirme; akademik kayıtlar ayrı sekmelerde.</div>` : ""}<div class="toolbar"><p class="muted">${records.length} kayıt</p>${isStaff() || (state.profile.role === "student" && sec.selfWrite) ? btn("+ Kayıt ekle", "new-entry", kind) : ""}</div><section class="panel">${records.length ? records.map(entryCard).join("") : empty("Henüz kayıt yok", isStaff() ? "Bu bölüm için ilk kaydı ekleyin." : "Bu bölümde sizinle paylaşılmış kayıt yok.")}</section>`;
  }
  return `<button class="link" data-action="nav" data-id="students">Öğrencilere dön</button><section class="panel profile-banner"><div class="avatar">${e(initials(s.full_name))}</div><div><h2>${e(s.full_name)}</h2><p>${e(c?.name || "")} · ${e(c?.school_year || "")} · Okul no ${e(s.school_number)}</p></div><div class="right"><span class="pill ${s.active ? "green" : ""}">${s.active ? "Aktif öğrenci" : "Arşivde"}</span></div></section><div class="toolbar">${field({ key: "month-filter", label: "Defter ayı", type: "month" }, state.month)}${s.is_sample ? '<span class="pill">ÖRNEK KAYIT · Gerçek kişiye ait değildir</span>' : ""}</div><nav class="tabs" aria-label="Öğrenci dosyası bölümleri">${tabs.map(([id, label]) => `<button data-action="tab" data-id="${id}" class="${state.tab === id ? "active" : ""}">${label}</button>`).join("")}</nav>${body}`;
}
function chart(entries) {
  const exams = comparableExams(entries, state.examType).slice(-8);
  if (!exams.length)
    return '<div class="chart-empty">Grafik için genel deneme kaydı ekleyin.</div>';
  const vals = exams.map((x) =>
      netScore(x.payload.correct, x.payload.wrong, 4),
    ),
    min = Math.min(0, ...vals),
    max = Math.max(1, ...vals),
    px = (i) => 40 + i * (320 / Math.max(1, exams.length - 1)),
    py = (n) => 140 - ((n - min) / (max - min)) * 105;
  return `<svg class="chart" viewBox="0 0 400 180" role="img" aria-label="Son genel denemelerin netleri"><path d="M35 20V145H375" stroke="#d3e1e8" fill="none"/><polyline points="${vals.map((v, i) => `${px(i)},${py(v)}`).join(" ")}" fill="none" stroke="#176c77" stroke-width="3"/>${vals.map((v, i) => `<circle cx="${px(i)}" cy="${py(v)}" r="5" fill="#176c77"/><text x="${px(i)}" y="${py(v) - 12}" text-anchor="middle">${v}</text><text x="${px(i)}" y="165" text-anchor="middle">${displayDate(exams[i].record_date).slice(0, 5)}</text>`).join("")}</svg>`;
}
function canEdit(entry) {
  return (
    isStaff() ||
    (state.profile.role === "student" &&
      entry.author_id === state.profile.id &&
      sections[entry.kind].selfWrite)
  );
}
function entryCard(x) {
  const sec = sections[x.kind];
  return `<article class="entry"><div class="entry-head"><div><strong>${sec.title}</strong><small>${displayDate(x.record_date)}${isStaff() ? ` · ${x.shared ? "Veli ve öğrenciyle paylaşıldı" : "Yalnızca okul"}` : ""}</small></div>${canEdit(x) ? `<button class="link" data-action="edit-entry" data-id="${x.id}">Düzenle</button>` : ""}</div><dl class="details">${x.kind === "plan" ? `<div class="wide"><dt>Haftalık program</dt><dd>${planCard(x.payload)}</dd></div>` : ""}${sec.fields
    .filter((f) => x.kind !== "plan")
    .filter((f) => x.payload[f.key] !== undefined && x.payload[f.key] !== "")
    .map(
      (f) =>
        `<div class="${f.type === "textarea" ? "wide" : ""}"><dt>${e(f.label)}</dt><dd>${e(labelValue(x.payload[f.key]))}</dd></div>`,
    )
    .join(
      "",
    )}${x.kind === "exam" ? `<div><dt>Net</dt><dd><strong>${netScore(x.payload.correct, x.payload.wrong, x.payload.divisor)}</strong></dd></div>` : ""}</dl></article>`;
}
function classesPage() {
  if (!isAdmin()) return "";
  return `<div class="toolbar"><p class="muted">Sınıf, eğitim yılı ve sorumlu öğretmen</p>${btn("+ Sınıf ekle", "new-class")}</div><section class="panel table-wrap">${state.classes.length ? `<table><thead><tr><th>Sınıf</th><th>Yıl</th><th>Öğretmen</th><th>Öğrenci</th><th></th></tr></thead><tbody>${state.classes.map((c) => `<tr><td><strong>${e(c.name)}</strong> <span class="pill">${c.grade}. sınıf</span>${!c.active ? " · Arşiv" : ""}</td><td>${e(c.school_year)}</td><td>${e(state.profiles.find((p) => p.id === c.teacher_id)?.full_name || "Atanmadı")}</td><td>${state.students.filter((s) => s.class_id === c.id && s.active).length}</td><td>${btn("Düzenle", "edit-class", c.id, true)}</td></tr>`).join("")}</tbody></table>` : empty("Sınıf bulunmuyor", "Öğrenci kayıtlarına başlamak için sınıf ekleyin.")}</section>`;
}
function accountsPage() {
  if (!isAdmin()) return "";
  return `<div class="toolbar"><p class="muted">Hesaplar ve öğrenci bağlantıları</p>${btn("+ Hesap oluştur", "new-account")}</div><section class="panel table-wrap"><table><thead><tr><th>Ad soyad</th><th>Kullanıcı adı</th><th>Rol / Durum</th><th>Bağlı öğrenciler</th><th></th></tr></thead><tbody>${state.profiles
    .map(
      (p) =>
        `<tr><td>${e(p.full_name)}</td><td>${e(p.username)}</td><td>${roles[p.role]} <span class="pill ${p.active ? "green" : ""}">${p.active ? "Aktif" : "Pasif"}</span></td><td class="wrap">${
          state.links
            .filter((l) => l.profile_id === p.id)
            .map((l) =>
              e(state.students.find((s) => s.id === l.student_id)?.full_name),
            )
            .join(", ") || "—"
        }</td><td><div class="row-actions"><button class="link" data-action="edit-account" data-id="${p.id}">Düzenle</button>${["parent", "student"].includes(p.role) ? `<button class="link" data-action="link-account" data-id="${p.id}">Bağlantılar</button>` : ""}<button class="link" data-action="reset-password" data-id="${p.id}">Şifre</button></div></td></tr>`,
    )

import "./styles.css";
import {
  guidePage,
  planFields,
  planCard,
  monthlyReport,
  yearlyReport,
} from "./notebook.js";
import { school, schoolBrand, schoolHeading, printHeading } from "./school.js";
import * as XLSX from "xlsx";
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
  auditEvents: [],
  backups: [],
  yearHistory: [],
  page: "dashboard",
  studentId: null,
  tab: "overview",
  query: "",
  classFilter: "",
  bookGrade: "9",
  bookQuery: "",
  sampleFilter: "all",
  statusFilter: "all",
  yearFilter: "",
  gradeFilter: "",
  adminToolTab: "import",
  adminSearch: "",
  adminClassFilter: "",
  adminYearFilter: "",
  adminGradeFilter: "",
  adminStatusFilter: "active",
  adminSampleFilter: "real",
  auditEntity: "",
  auditAction: "",
  auditActor: "",
  auditDate: "",
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
  const [students, classes, entries, books, profiles, links, auditEvents, backups, yearHistory] =
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
      p.role === "admin"
        ? checked(db.from("audit_events").select("*").order("occurred_at", { ascending: false }).limit(500))
        : Promise.resolve([]),
      p.role === "admin"
        ? checked(db.from("school_backups").select("id,created_at,created_by,label,student_count").order("created_at", { ascending: false }).limit(100))
        : Promise.resolve([]),
      p.role === "admin"
        ? checked(db.from("student_year_history").select("*").order("created_at", { ascending: false }).limit(500))
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
    auditEvents,
    backups,
    yearHistory,
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
          ["admin-tools", "⚙", "Yönetim araçları"],
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
    "admin-tools": "Yönetim araçları",
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
    "admin-tools": adminToolsPage,
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
        (!state.yearFilter || cls(s.class_id)?.school_year === state.yearFilter) &&
        (!state.gradeFilter || String(cls(s.class_id)?.grade) === state.gradeFilter) &&
        (state.statusFilter === "all" ||
          (state.statusFilter === "active" ? s.active : !s.active)) &&
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
  const years = [...new Set(state.classes.map((c) => c.school_year))].sort().reverse();
  return `<div class="toolbar"><div class="filters filter-grid">
    <label>Öğrenci ara<input id="studentSearch" aria-label="Öğrenci ara" placeholder="Ad veya okul numarası" value="${e(state.query)}"></label>
    <label>Eğitim yılı<select id="yearFilter">${option("", "Tüm yıllar", state.yearFilter)}${years.map((y) => option(y, y, state.yearFilter)).join("")}</select></label>
    <label>Sınıf düzeyi<select id="gradeFilter">${option("", "Tüm düzeyler", state.gradeFilter)}${grades.map((g) => option(g, `${g}. sınıf`, state.gradeFilter)).join("")}</select></label>
    <label>Sınıf<select id="classFilter">${option("", "Tüm sınıflar", state.classFilter)}${state.classes.map((c) => option(c.id, `${c.name} · ${c.school_year}`, state.classFilter)).join("")}</select></label>
    <label>Durum<select id="statusFilter">${[["all","Tümü"],["active","Aktif"],["archived","Arşiv"]].map(([v,l])=>option(v,l,state.statusFilter)).join("")}</select></label>
    <label>Kayıt türü<select id="sampleFilter">${[["all","Tümü"],["real","Gerçek"],["sample","Örnek"]].map(([v,l])=>option(v,l,state.sampleFilter)).join("")}</select></label>
  </div>${isAdmin() ? `<div class="row-actions">${btn("+ Öğrenci ekle", "new-student")}${btn("Yönetim araçları", "nav", "admin-tools", true)}</div>` : ""}</div>
  <section class="panel">${state.students.length ? `<div class="table-wrap"><table><thead><tr><th>Öğrenci</th><th>Sınıf</th><th>Durum</th><th></th></tr></thead><tbody id="studentRows">${studentRows() || '<tr><td colspan="4">Filtreye uyan öğrenci yok.</td></tr>'}</tbody></table></div>` : empty("Öğrenci bulunamadı", isAdmin() ? "Önce sınıf oluşturun, ardından öğrenci ekleyin." : "Hesabınıza bağlı bir öğrenci kaydı yok. Okul yöneticinizle görüşün.", isAdmin() ? btn("Öğrenci ekle", "new-student") : "")}</section>`;
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
  const sharedTabs = [
    ["overview", "Özet"],
    ["monthly", "Aylık defter"],
    ["yearly", "Yıllık defter"],
  ];
  const staffTabs = [
    ["followup", sections.followup.title],
    ["study", sections.study.title],
    ["exam", sections.exam.title],
    ["analysis", sections.analysis.title],
    ["student_meeting", sections.student_meeting.title],
    ["parent_meeting", sections.parent_meeting.title],
    ["reading", sections.reading.title],
    ["plan", sections.plan.title],
    ["note", sections.note.title],
    ["details", "Öğrenci bilgileri"],
  ];
  const studentTabs = [
    ["study", sections.study.title],
    ["exam", sections.exam.title],
    ["analysis", sections.analysis.title],
    ["student_meeting", sections.student_meeting.title],
    ["reading", sections.reading.title],
    ["plan", sections.plan.title],
  ];
  const parentTabs = [
    ["followup", sections.followup.title],
    ["study", sections.study.title],
    ["exam", sections.exam.title],
    ["student_meeting", sections.student_meeting.title],
    ["parent_meeting", sections.parent_meeting.title],
    ["reading", sections.reading.title],
  ];
  const tabs = [
    ...sharedTabs,
    ...(isStaff()
      ? staffTabs
      : state.profile.role === "student"
        ? studentTabs
        : parentTabs),
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
    body = monthlyReport(mine, state.month, entryCard, {
      role: state.profile.role,
      schoolYear: c?.school_year || "",
    });
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
    .join("")}</tbody></table></section>`;
}
function controlsPage() {
  if (!isAdmin()) return "";
  const active = state.students.filter((x) => x.active && !x.is_sample);
  const unfollowed = active.filter(
    (s) =>
      !state.entries.some(
        (x) =>
          x.kind === "followup" &&
          x.student_id === s.id &&
          x.record_date.startsWith(state.month),
      ),
  );
  const unlinked = active.filter(
    (s) =>
      !state.links.some(
        (l) =>
          l.student_id === s.id &&
          state.profiles.find((p) => p.id === l.profile_id)?.role === "parent",
      ),
  );
  return `<div class="toolbar">${field({ key: "month-filter", label: "Kontrol dönemi", type: "month" }, state.month)}${btn("Yazdır", "print", "", true)}</div><div class="stats">${[
    [unfollowed.length, "Aylık takibi girilmemiş"],
    [unlinked.length, "Veli hesabı bağlanmamış"],
    [
      state.classes.filter((c) => c.active && !c.is_sample && !c.teacher_id)
        .length,
      "Öğretmen atanmamış sınıf",
    ],
    [state.profiles.filter((p) => !p.active).length, "Pasif hesap"],
  ]
    .map(
      ([n, t]) =>
        `<div class="stat"><span>${t}</span><strong>${n}</strong></div>`,
    )
    .join(
      "",
    )}</div><section class="panel"><div class="panel-head"><h2>${monthLabel(state.month + "-01")} · Takip bekleyen öğrenciler</h2></div><div class="mini-list">${unfollowed.map((s) => `<div class="mini-row"><div><strong>${e(s.full_name)}</strong><small>${e(cls(s.class_id)?.name || "")}</small></div><button class="link" data-action="open-student" data-id="${s.id}">Dosyayı aç</button></div>`).join("") || empty("Takipler güncel", "Bu dönem için eksik takip kaydı bulunmuyor.")}</div></section>`;
}
function booksPage() {
  return `<div class="toolbar"><div class="filters"><label>Sınıf<select id="bookGrade">${grades.map((g) => option(g, `${g}. sınıf`, state.bookGrade)).join("")}</select></label><label>Kitap veya yazar ara<input id="bookSearch" type="search" placeholder="Kitap adı veya yazar" value="${e(state.bookQuery)}"></label></div>${isAdmin() ? btn("+ Kitap ekle", "new-book") : ""}</div><div id="bookResults" aria-live="polite">${bookResults()}</div>`;
}
function bookResults() {
  const query = state.bookQuery.trim().toLocaleLowerCase("tr-TR");
  return `${grades
    .filter((g) => String(g) === state.bookGrade)
    .map((g) => {
      const books = state.books.filter(
        (b) =>
          b.grade === g &&
          (!query ||
            `${b.title} ${b.author}`
              .toLocaleLowerCase("tr-TR")
              .includes(query)),
      );
      return `<section class="panel" style="margin-bottom:20px"><div class="panel-head"><h2>${g}. sınıf</h2><span class="pill">${books.length} kitap</span></div>${books.length ? `<div class="table-wrap"><table><thead><tr><th>Kitap</th><th>Yazar</th><th>Yayınevi / Tür</th><th>Sayfa</th>${isAdmin() ? "<th></th>" : ""}</tr></thead><tbody>${books.map((b) => `<tr><td class="wrap">${e(b.title)}</td><td>${e(b.author)}</td><td>${e(b.publisher)} ${b.genre ? "· " + e(b.genre) : ""}</td><td>${b.pages || "—"}</td>${isAdmin() ? `<td><button class="link" data-action="edit-book" data-id="${b.id}">Düzenle</button></td>` : ""}</tr>`).join("")}</tbody></table></div>` : query ? empty("Eşleşen kitap bulunamadı", "Aramanızı değiştirin veya başka bir sınıf seçin.") : empty("Liste henüz eklenmedi", isAdmin() ? "Defterdeki kitapları bu sınıf düzeyine ekleyin." : "Okul yönetimi bu listeyi hazırladığında burada görebilirsiniz.")}</section>`;
    })
    .join("")}`;
}

function adminFilteredStudents() {
  const q = state.adminSearch.trim().toLocaleLowerCase("tr-TR");
  return state.students.filter((s) => {
    const c = cls(s.class_id);
    return (!q || `${s.full_name} ${s.school_number}`.toLocaleLowerCase("tr-TR").includes(q)) &&
      (!state.adminClassFilter || s.class_id === state.adminClassFilter) &&
      (!state.adminYearFilter || c?.school_year === state.adminYearFilter) &&
      (!state.adminGradeFilter || String(c?.grade) === state.adminGradeFilter) &&
      (state.adminStatusFilter === "all" || (state.adminStatusFilter === "active" ? s.active : !s.active)) &&
      (state.adminSampleFilter === "all" || (state.adminSampleFilter === "sample" ? s.is_sample : !s.is_sample));
  });
}
function selectedAdminIds() {
  return [...document.querySelectorAll(".admin-student-check:checked")].map((x) => x.value);
}
function downloadBlob(name, data, type="application/json") {
  const url = URL.createObjectURL(new Blob([data], { type }));
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function adminStudentTable() {
  const list = adminFilteredStudents();
  return `<div class="table-wrap"><table><thead><tr><th><input id="selectAllAdmin" type="checkbox" aria-label="Görünenlerin tümünü seç"></th><th>Öğrenci</th><th>Sınıf</th><th>Yıl</th><th>Durum</th></tr></thead><tbody>${list.map((s)=>{const c=cls(s.class_id);return `<tr><td><input class="admin-student-check" type="checkbox" value="${s.id}"></td><td><strong>${e(s.full_name)}</strong><small class="table-note">No ${e(s.school_number)}</small></td><td>${e(c?.name||"—")}</td><td>${e(c?.school_year||"—")}</td><td><span class="pill ${s.active?"green":""}">${s.active?"Aktif":"Arşiv"}</span>${s.is_sample?' <span class="pill">Örnek</span>':""}</td></tr>`;}).join("") || '<tr><td colspan="5">Filtreye uyan öğrenci yok.</td></tr>'}</tbody></table></div>`;
}
function adminFilters() {
  const years=[...new Set(state.classes.map((c)=>c.school_year))].sort().reverse();
  return `<div class="filters filter-grid admin-filters">
    <label>Ara<input id="adminSearch" value="${e(state.adminSearch)}" placeholder="Ad / okul no"></label>
    <label>Eğitim yılı<select id="adminYearFilter">${option("","Tüm yıllar",state.adminYearFilter)}${years.map(y=>option(y,y,state.adminYearFilter)).join("")}</select></label>
    <label>Düzey<select id="adminGradeFilter">${option("","Tüm düzeyler",state.adminGradeFilter)}${grades.map(g=>option(g,`${g}. sınıf`,state.adminGradeFilter)).join("")}</select></label>
    <label>Sınıf<select id="adminClassFilter">${option("","Tüm sınıflar",state.adminClassFilter)}${state.classes.map(c=>option(c.id,`${c.name} · ${c.school_year}`,state.adminClassFilter)).join("")}</select></label>
    <label>Durum<select id="adminStatusFilter">${[["all","Tümü"],["active","Aktif"],["archived","Arşiv"]].map(([v,l])=>option(v,l,state.adminStatusFilter)).join("")}</select></label>
    <label>Tür<select id="adminSampleFilter">${[["all","Tümü"],["real","Gerçek"],["sample","Örnek"]].map(([v,l])=>option(v,l,state.adminSampleFilter)).join("")}</select></label>
  </div>`;
}
function auditTable() {
  const q=state.adminSearch.trim().toLocaleLowerCase("tr-TR");
  const rows=state.auditEvents.filter(x =>
    (!state.auditEntity || x.entity===state.auditEntity) &&
    (!state.auditAction || x.action===state.auditAction) &&
    (!state.auditActor || x.actor_name===state.auditActor) &&
    (!state.auditDate || x.occurred_at?.startsWith(state.auditDate)) &&
    (!q || `${x.actor_name} ${x.entity} ${x.action} ${x.record_id}`.toLocaleLowerCase("tr-TR").includes(q))
  );
  return `<div class="table-wrap"><table><thead><tr><th>Tarih</th><th>Kullanıcı</th><th>İşlem</th><th>Kayıt</th><th>Değişen alanlar</th></tr></thead><tbody>${rows.map(x=>`<tr><td>${new Date(x.occurred_at).toLocaleString("tr-TR")}</td><td>${e(x.actor_name||"Sistem")}</td><td><span class="pill">${e(x.action)}</span> ${e(x.entity)}</td><td class="wrap">${e(x.record_id||"—")}</td><td class="wrap">${e((x.changed_fields||[]).join(", ")||"—")}</td></tr>`).join("") || '<tr><td colspan="5">Filtreye uyan işlem yok.</td></tr>'}</tbody></table></div>`;
}
function adminToolsPage() {
  if (!isAdmin()) return "";
  const tabs=[["import","Excel aktarım"],["backup","Yedekleme"],["promotion","Sınıf geçişi"],["audit","İşlem geçmişi"]];
  const src=cls(state.adminClassFilter);
  const nextYear=src ? `${Number(src.school_year.slice(0,4))+1}-${Number(src.school_year.slice(5))+1}` : "";
  const targets=src && src.grade<12 ? state.classes.filter(c=>c.active && c.grade===src.grade+1 && c.school_year===nextYear && c.is_sample===src.is_sample) : [];
  const actors=[...new Set(state.auditEvents.map(x=>x.actor_name).filter(Boolean))].sort();
  const entities=[...new Set(state.auditEvents.map(x=>x.entity).filter(Boolean))].sort();
  const actions=[...new Set(state.auditEvents.map(x=>x.action).filter(Boolean))].sort();
  let body="";
  if(state.adminToolTab==="import") body=`<section class="panel admin-card"><div class="panel-head"><div><h2>Excel / CSV ile toplu öğrenci aktarımı</h2><p>Önce hedef sınıfı seçin; dosyada “Ad Soyad” ve “Okul Numarası” sütunları yeterlidir.</p></div>${btn("Şablon indir","download-import-template","",true)}</div><div class="form-grid"><div class="field"><label>Hedef sınıf</label><select id="importClass">${option("","Sınıf seçin","")}${state.classes.filter(c=>c.active).map(c=>option(c.id,`${c.name} · ${c.school_year}`,"")).join("")}</select></div><div class="field"><label>Excel / CSV dosyası</label><input id="importFile" type="file" accept=".xlsx,.xls,.csv"></div></div><div class="form-actions">${btn("Dosyayı kontrol et ve aktar","import-students")}</div></section>`;
  if(state.adminToolTab==="backup") body=`${adminFilters()}<div class="toolbar"><div class="row-actions">${btn("Görünenleri Excel'e aktar","export-filtered-students","",true)}${btn("Seçilenleri aktif yap","bulk-active","",true)}${btn("Seçilenleri arşivle","bulk-archive","",true)}</div><div class="row-actions"><input id="backupLabel" placeholder="Yedek etiketi" value="Manuel yedek"><button class="btn" data-action="create-backup">Seçilenleri yedekle</button></div></div><section class="panel">${adminStudentTable()}</section><section class="panel admin-card"><div class="panel-head"><h2>Kayıtlı yedekler</h2></div><div class="table-wrap"><table><thead><tr><th>Tarih</th><th>Etiket</th><th>Öğrenci</th><th></th></tr></thead><tbody>${state.backups.map(b=>`<tr><td>${new Date(b.created_at).toLocaleString("tr-TR")}</td><td>${e(b.label)}</td><td>${b.student_count}</td><td class="row-actions">${btn("JSON indir","download-backup",b.id,true)}${btn("Geri yükle","restore-backup",b.id,true)}</td></tr>`).join("") || '<tr><td colspan="4">Henüz yedek yok.</td></tr>'}</tbody></table></div></section>`;
  if(state.adminToolTab==="promotion") body=`${adminFilters()}<div class="notice">Sınıf geçişinde önce kaynak sınıfı filtreleyin. 12. sınıflar mezun edilerek arşivlenir; diğer sınıflar bir üst sınıfa taşınır. İşlem öncesi otomatik yedek alınır.</div><div class="toolbar"><div>${src ? `<strong>Kaynak:</strong> ${e(src.name)} · ${e(src.school_year)}` : "Kaynak sınıf seçin"}</div>${src && src.grade<12 ? `<label>Hedef sınıf <select id="promotionTarget">${option("","Hedef seçin","")}${targets.map(c=>option(c.id,`${c.name} · ${c.school_year}`,"")).join("")}</select></label>` : src ? '<span class="pill amber">12. sınıf: mezuniyet işlemi</span>' : ""}<button class="btn" data-action="promote-selected">Seçilenlere uygula</button></div><section class="panel">${adminStudentTable()}</section><section class="panel admin-card"><div class="panel-head"><h2>Son sınıf geçişleri</h2></div><div class="mini-list">${state.yearHistory.slice(0,40).map(h=>{const s=state.students.find(x=>x.id===h.student_id);return `<div class="mini-row"><div><strong>${e(s?.full_name||"Öğrenci")}</strong><small>${h.operation==="graduation"?"Mezuniyet":"Sınıf geçişi"} · ${new Date(h.created_at).toLocaleString("tr-TR")}</small></div></div>`;}).join("") || '<div class="empty">Henüz işlem yok.</div>'}</div></section>`;
  if(state.adminToolTab==="audit") body=`<div class="filters filter-grid admin-filters"><label>Ara<input id="adminSearch" value="${e(state.adminSearch)}" placeholder="Kullanıcı / işlem / kayıt"></label><label>Varlık<select id="auditEntity">${option("","Tümü",state.auditEntity)}${entities.map(v=>option(v,v,state.auditEntity)).join("")}</select></label><label>İşlem<select id="auditAction">${option("","Tümü",state.auditAction)}${actions.map(v=>option(v,v,state.auditAction)).join("")}</select></label><label>Kullanıcı<select id="auditActor">${option("","Tümü",state.auditActor)}${actors.map(v=>option(v,v,state.auditActor)).join("")}</select></label><label>Tarih<input id="auditDate" type="date" value="${e(state.auditDate)}"></label></div><section class="panel">${auditTable()}</section>`;
  return `<nav class="tabs">${tabs.map(([id,label])=>`<button data-action="admin-tab" data-id="${id}" class="${state.adminToolTab===id?"active":""}">${label}</button>`).join("")}</nav>${body}`;
}
async function readImportRows(file,classId){
  if(!file) throw new Error("Bir Excel veya CSV dosyası seçin.");
  if(!classId) throw new Error("Hedef sınıfı seçin.");
  const workbook=XLSX.read(await file.arrayBuffer(),{type:"array"});
  const sheet=workbook.Sheets[workbook.SheetNames[0]];
  const raw=XLSX.utils.sheet_to_json(sheet,{defval:""});
  const norm=(x)=>String(x).trim().toLocaleLowerCase("tr-TR").replace(/[^a-z0-9çğıöşü]/g,"");
  const value=(row,names)=>{for(const [k,v] of Object.entries(row)) if(names.includes(norm(k))) return String(v).trim(); return "";};
  const rows=raw.map(row=>({full_name:value(row,["adsoyad","advesoyad","adısoyadı","ogrenci","öğrenci","fullname"]),school_number:value(row,["okulnumarası","okulnumarasi","okulno","numara","schoolnumber"]),class_id:classId})).filter(x=>x.full_name||x.school_number);
  if(!rows.length) throw new Error("Dosyada öğrenci satırı bulunamadı.");
  if(rows.some(x=>!x.full_name||!x.school_number)) throw new Error("Her satırda Ad Soyad ve Okul Numarası olmalı.");
  if(rows.length>500) throw new Error("Tek seferde en fazla 500 öğrenci aktarılabilir.");
  return rows;
}

function passwordPage() {
  return `<section class="panel" style="max-width:620px"><div class="panel-head"><h2>Şifre değiştir</h2></div><form data-form="own-password"><div class="form-grid">${field({ key: "current", label: "Mevcut şifre", type: "password", required: true, wide: true, autocomplete: "current-password" })}${field({ key: "password", label: "Yeni şifre", type: "password", required: true, minlength: 12, wide: true, autocomplete: "new-password" })}${field({ key: "confirm", label: "Yeni şifre tekrar", type: "password", required: true, minlength: 12, wide: true, autocomplete: "new-password" })}</div><div class="error" id="passwordError" hidden></div><div class="form-actions"><button class="btn">Şifreyi güncelle</button></div></form></section>`;
}

function studentForm(id) {
  const s = state.students.find((s) => s.id === id) || {};
  if (!state.classes.length) {
    state.page = "classes";
    render();
    toast("Önce bir sınıf oluşturun.");
    return;
  }
  modal(
    s.id ? "Öğrenciyi düzenle" : "Öğrenci ekle",
    "student",
    field(
      { key: "full_name", label: "Ad soyad", required: true },
      s.full_name,
    ) +
      field(
        { key: "school_number", label: "Okul numarası", required: true },
        s.school_number,
      ) +
      field(
        { key: "class_id", label: "Sınıf", type: "select", required: true },
        s.class_id,
        state.classes
          .filter((c) => c.active || c.id === s.class_id)
          .map((c) => ({ value: c.id, label: `${c.name} · ${c.school_year}` })),
      ) +
      field(
        { key: "active", label: "Aktif öğrenci", type: "checkbox" },
        s.active ?? true,
      ),
    { id: s.id || "" },
  );
}
function classForm(id) {
  const c = state.classes.find((c) => c.id === id) || {};
  modal(
    c.id ? "Sınıfı düzenle" : "Sınıf ekle",
    "class",
    field({ key: "name", label: "Sınıf adı", required: true }, c.name) +
      field(
        {
          key: "grade",
          label: "Sınıf düzeyi",
          type: "select",
          options: grades,
        },
        c.grade || 9,
      ) +
      field(
        {
          key: "school_year",
          label: "Eğitim yılı",
          required: true,
          pattern: "20[0-9]{2}-20[0-9]{2}",
        },
        c.school_year || "2026-2027",
      ) +
      field(
        { key: "teacher_id", label: "Sorumlu öğretmen", type: "select" },
        c.teacher_id || "",
        [
          { value: "", label: "Henüz atanmadı" },
          ...state.profiles
            .filter((p) => p.role === "teacher" && p.active)
            .map((p) => ({ value: p.id, label: p.full_name })),
        ],
      ) +
      field(
        { key: "active", label: "Aktif sınıf", type: "checkbox" },
        c.active ?? true,
      ),
    { id: c.id || "" },
  );
}
function accountForm(id) {
  const p = state.profiles.find((p) => p.id === id);
  modal(
    p ? "Hesabı düzenle" : "Hesap oluştur",
    "account",
    field(
      { key: "full_name", label: "Ad soyad", required: true },
      p?.full_name,
    ) +
      (p
        ? field(
            { key: "active", label: "Aktif hesap", type: "checkbox" },
            p.active,
          )
        : field({
            key: "username",
            label: "Kullanıcı adı",
            required: true,
            pattern: "[a-z0-9._-]{3,50}",
            hint: "Küçük harf, rakam, nokta, tire veya alt çizgi.",
          }) +
          field(
            { key: "role", label: "Rol", type: "select" },
            "teacher",
            Object.entries(roles).map(([value, label]) => ({ value, label })),
          ) +
          field({
            key: "password",
            label: "İlk şifre",
            type: "password",
            required: true,
            minlength: 12,
            hint: "En az 12 karakter. Şifreyi kullanıcıya güvenli biçimde iletin.",
          })),
    { id: p?.id || "" },
  );
}
function entryForm(kind, id) {
  const entry = state.entries.find((x) => x.id === id);
  kind = entry?.kind || kind;
  const sec = sections[kind];
  let values = entry?.payload || {};
  if (!entry && kind === "followup")
    values = {
      week: "Aylık değerlendirme",
    };
  modal(
    sec.title,
    "entry",
    `<input type="hidden" name="kind" value="${kind}">` +
      field(
        {
          key: "record_date",
          label: kind === "plan" ? "Hafta başlangıcı" : "Kayıt tarihi",
          type: "date",
          required: true,
        },
        entry?.record_date || today(),
      ) +
      (kind === "plan"
        ? planFields(field, values)
        : sec.fields.map((f) => field(f, values[f.key] ?? "")).join("")) +
      (isStaff()
        ? field(
            {
              key: "shared",
              label: "Veli ve öğrenciyle paylaş",
              type: "checkbox",
            },
            entry?.shared ?? false,
          )
        : '<input type="hidden" name="shared" value="true">'),
    {
      id: entry?.id || "",
      note: isStaff()
        ? "Paylaşım kapalıysa kaydı yalnızca yönetici ve atanmış öğretmen görebilir."
        : "",
    },
  );
}
async function photoForm() {
  const photo = await checked(
    db
      .from("student_photos")
      .select("data_url")
      .eq("student_id", state.studentId)
      .maybeSingle(),
  );
  modal(
    "Öğrenci fotoğrafı",
    "photo",
    '<div class="wide">' +
      (photo
        ? '<img class="student-photo" alt="Öğrenci fotoğrafı" src="' +
          e(photo.data_url) +
          '">'
        : "<p>Henüz fotoğraf eklenmedi.</p>") +
      "</div>" +
      field({
        key: "photo",
        label: "Fotoğraf seç",
        type: "file",
        required: true,
      }),
    { id: state.studentId },
  );
}
async function photoData(file) {
  if (
    !file ||
    !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
    file.size > 5 * 1024 * 1024
  )
    throw new Error("En fazla 5 MB boyutunda JPG, PNG veya WebP seçin.");
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 320 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const result = canvas.toDataURL("image/jpeg", 0.8);
  if (result.length > 200000)
    throw new Error("Fotoğraf çok büyük. Daha küçük bir görsel seçin.");
  return result;
}
async function detailsForm() {
  const d =
    (await checked(
      db
        .from("student_details")
        .select("*")
        .eq("student_id", state.studentId)
        .maybeSingle(),
    )) || {};
  const fields = [
    ["guardian_name", "Veli adı soyadı"],
    ["guardian_job", "Veli mesleği"],
    ["average_income", "Aylık ortalama gelir"],
    ["siblings", "Kardeş sayısı", "number"],
    ["previous_school", "Geldiği okul"],
    ["percentile", "Yüzdelik dilim", "number"],
    ["entry_score", "Giriş puanı", "number"],
    ["address", "Adres", "textarea"],
    ["talents", "Özel yetenek"],
    ["own_room", "Kendine ait oda", "checkbox"],
    ["hobbies", "Hobiler"],
    ["phone", "Telefon"],
    ["health", "Sağlık durumu", "textarea"],
    ["special_notes", "Özel durum", "textarea"],
  ];
  modal(
    "Öğrenci bilgileri",
    "details",
    fields
      .map(([key, label, type]) =>
        field(
          { key, label, type, step: type === "number" ? "0.01" : undefined },
          d[key] ?? "",
        ),
      )
      .join(""),
    {
      id: state.studentId,
      note: "Bu bölüm yalnızca okul personeline açıktır. Takiple ilgili bilgileri kaydedin.",
    },
  );
}
function bookForm(id) {
  const b = state.books.find((b) => b.id === id) || {};
  modal(
    b.id ? "Kitabı düzenle" : "Kitap ekle",
    "book",
    field(
      {
        key: "grade",
        label: "Sınıf düzeyi",
        type: "select",
        options: grades,
      },
      b.grade || Number(state.bookGrade),
    ) +
      field({ key: "title", label: "Kitap adı", required: true }, b.title) +
      field({ key: "author", label: "Yazar" }, b.author) +
      field({ key: "publisher", label: "Yayınevi" }, b.publisher) +
      field({ key: "genre", label: "Tür" }, b.genre) +
      field(
        {
          key: "pages",
          label: "Sayfa sayısı",
          type: "number",
          min: 1,
          max: 10000,
        },
        b.pages || "",
      ),
    { id: b.id || "" },
  );
}
function linksForm(id) {
  const p = state.profiles.find((p) => p.id === id);
  modal(
    `${p.full_name} · Öğrenci bağlantıları`,
    "links",
    state.students
      .map((s) =>
        field(
          {
            key: s.id,
            label: `${s.full_name} · ${cls(s.class_id)?.name || ""}`,
            type: "checkbox",
          },
          state.links.some((l) => l.profile_id === id && l.student_id === s.id),
        ),
      )
      .join(""),
    {
      id,
      note:
        p.role === "student"
          ? "Öğrenci hesabı için yalnızca kendi kaydını seçin."
          : "Velinin görmesi gereken öğrencileri seçin.",
    },
  );
}

document.addEventListener("click", async (ev) => {
  const b = ev.target.closest("[data-action]");
  if (!b) return;
  const { action, id } = b.dataset;
  try {
    if (action === "nav") {
      state.page = id;
      state.query = "";
      state.classFilter = "";
      render();
    } else if (action === "admin-tab") {
      state.adminToolTab = id;
      render();
    } else if (action === "tab") {
      state.tab = id;
      render();
    } else if (action === "open-month") {
      if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(id)) return;
      state.month = id;
      state.tab = "monthly";
      render();
    } else if (action === "open-student") {
      state.studentId = id;
      state.tab = "overview";
      state.page = "profile";
      render();
    } else if (action === "close") document.querySelector("dialog")?.close();
    else if (action === "setup-view") authView(true);
    else if (action === "login-view") authView();
    else if (action === "logout") {
      ++loadVersion;
      await db.auth.signOut({ scope: "local" });
      document.querySelector("dialog")?.remove();
      Object.assign(state, {
        profile: null,
        students: [],
        classes: [],
        profiles: [],
        entries: [],
        books: [],
        links: [],
        page: "dashboard",
        studentId: null,
      });
      authView();
    } else if (action === "new-student" || action === "edit-student")
      studentForm(id);
    else if (action === "new-class" || action === "edit-class") classForm(id);
    else if (action === "new-account" || action === "edit-account")
      accountForm(id);
    else if (action === "new-book" || action === "edit-book") bookForm(id);
    else if (action === "new-entry") entryForm(id);
    else if (action === "edit-entry") entryForm(null, id);
    else if (action === "details") await detailsForm();
    else if (action === "photo") await photoForm();
    else if (action === "link-account") linksForm(id);
    else if (action === "reset-password")
      modal(
        "Yeni şifre belirle",
        "reset-password",
        field({
          key: "password",
          label: "Yeni şifre",
          type: "password",
          required: true,
          minlength: 12,
        }),
        { id, note: "Yeni şifreyi hesap sahibine güvenli biçimde iletin." },
      );
    else if (action === "download-import-template") {
      const ws=XLSX.utils.json_to_sheet([{"Ad Soyad":"Örnek Öğrenci","Okul Numarası":"1001"}]);
      const wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,ws,"Öğrenciler");
      XLSX.writeFile(wb,"FENTEK-ogrenci-aktarim-sablonu.xlsx");
    } else if (action === "import-students") {
      const rows=await readImportRows(document.querySelector("#importFile")?.files?.[0],document.querySelector("#importClass")?.value);
      const count=await checked(db.rpc("import_students",{rows}));
      await loadData(); toast(`${count} öğrenci aktarıldı.`);
    } else if (action === "export-filtered-students") {
      const rows=adminFilteredStudents().map(s=>{const c=cls(s.class_id);return {"Ad Soyad":s.full_name,"Okul Numarası":s.school_number,"Sınıf":c?.name||"","Eğitim Yılı":c?.school_year||"","Durum":s.active?"Aktif":"Arşiv","Tür":s.is_sample?"Örnek":"Gerçek"};});
      if(!rows.length) throw new Error("Filtreye uyan öğrenci yok.");
      const ws=XLSX.utils.json_to_sheet(rows),wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,"Öğrenciler");XLSX.writeFile(wb,"FENTEK-filtreli-ogrenciler.xlsx");
    } else if (action === "bulk-active" || action === "bulk-archive") {
      const ids=selectedAdminIds(); if(!ids.length) throw new Error("Önce öğrenci seçin.");
      await checked(db.from("students").update({active:action==="bulk-active"}).in("id",ids).select("id"));
      await loadData(); toast(`${ids.length} öğrenci güncellendi.`);
    } else if (action === "create-backup") {
      const ids=selectedAdminIds(); if(!ids.length) throw new Error("Yedeklenecek öğrencileri seçin.");
      const label=document.querySelector("#backupLabel")?.value?.trim()||"Manuel yedek";
      await checked(db.rpc("school_backup",{student_ids:ids,backup_label:label}));
      await loadData(); toast("Yedek oluşturuldu.");
    } else if (action === "download-backup" || action === "restore-backup") {
      const row=await checked(db.from("school_backups").select("label,snapshot").eq("id",id).single());
      if(action==="download-backup") downloadBlob(`FENTEK-yedek-${id}.json`,JSON.stringify(row.snapshot,null,2));
      else {
        const preview=await checked(db.rpc("restore_student_backup",{data:row.snapshot,apply_changes:false,expected_token:null}));
        if(confirm(`${preview.students} öğrenci ve ${preview.entries} kayıt geri yüklenecek. Devam edilsin mi?`)){
          await checked(db.rpc("restore_student_backup",{data:row.snapshot,apply_changes:true,expected_token:preview.token}));
          await loadData(); toast("Yedek geri yüklendi.");
        }
      }
    } else if (action === "promote-selected") {
      const ids=selectedAdminIds(); if(!ids.length) throw new Error("Önce öğrenci seçin.");
      const src=cls(state.adminClassFilter); if(!src) throw new Error("Kaynak sınıf filtresini seçin.");
      if(ids.some(sid=>state.students.find(s=>s.id===sid)?.class_id!==src.id)) throw new Error("Seçilenlerin tümü kaynak sınıfta olmalı.");
      const target=document.querySelector("#promotionTarget")?.value||"";
      if(src.grade<12&&!target) throw new Error("Hedef sınıfı seçin.");
      const moves=ids.map(student_id=>({student_id,from_class:src.id,...(src.grade<12?{to_class:target}:{})}));
      if(confirm(src.grade===12?`${ids.length} öğrenci mezun edilip arşivlenecek. Devam edilsin mi?`:`${ids.length} öğrenci bir üst sınıfa taşınacak. Devam edilsin mi?`)){
        await checked(db.rpc("promote_students",{moves}));
        await loadData(); toast("Sınıf geçişi tamamlandı.");
      }
    } else if (action === "print") window.print();
  } catch (err) {
    toast(errorText(err));
  }
});
function refreshStudentRows() {
  const rows = document.querySelector("#studentRows");
  if (rows)
    rows.innerHTML =
      studentRows() || '<tr><td colspan="4">Eşleşen öğrenci yok.</td></tr>';
}
document.addEventListener("input", (ev) => {
  if (ev.target.id === "bookSearch") {
    state.bookQuery = ev.target.value;
    document.querySelector("#bookResults").innerHTML = bookResults();
  }
  if (ev.target.id === "studentSearch") {
    state.query = ev.target.value;
    refreshStudentRows();
  }
  if (ev.target.id === "adminSearch") {
    state.adminSearch = ev.target.value;
    const page=document.querySelector("#page");
    if(page && state.page==="admin-tools") page.innerHTML=adminToolsPage();
  }
});
document.addEventListener("change", (ev) => {
  if (ev.target.id === "examType") {
    state.examType = ev.target.value;
    render();
  }
  if (ev.target.id === "statusFilter") {
    state.statusFilter = ev.target.value; refreshStudentRows();
  }
  if (ev.target.id === "yearFilter") {
    state.yearFilter = ev.target.value; refreshStudentRows();
  }
  if (ev.target.id === "gradeFilter") {
    state.gradeFilter = ev.target.value; refreshStudentRows();
  }
  if (ev.target.id === "sampleFilter") {
    state.sampleFilter = ev.target.value;
    refreshStudentRows();
  }
  if (ev.target.id === "bookGrade") {
    state.bookGrade = ev.target.value;
    document.querySelector("#bookResults").innerHTML = bookResults();
  }
  if (ev.target.id === "classFilter") {
    state.classFilter = ev.target.value;
    refreshStudentRows();
  }
  const adminFilterMap={adminClassFilter:"adminClassFilter",adminYearFilter:"adminYearFilter",adminGradeFilter:"adminGradeFilter",adminStatusFilter:"adminStatusFilter",adminSampleFilter:"adminSampleFilter",auditEntity:"auditEntity",auditAction:"auditAction",auditActor:"auditActor",auditDate:"auditDate"};
  if(adminFilterMap[ev.target.id]) { state[adminFilterMap[ev.target.id]]=ev.target.value; render(); }
  if(ev.target.id==="selectAllAdmin") document.querySelectorAll(".admin-student-check").forEach(x=>x.checked=ev.target.checked);
  if (ev.target.name === "month-filter" && ev.target.value) {
    state.month = ev.target.value;
    render();
  }
});
document.addEventListener("submit", async (ev) => {
  const form = ev.target;
  if (!form.dataset.form) return;
  ev.preventDefault();
  const kind = form.dataset.form,
    id = form.dataset.id;
  const data = Object.fromEntries(new FormData(form));
  form
    .querySelectorAll("input[type=checkbox]")
    .forEach((x) => (data[x.name] = x.checked));
  const submit = form.querySelector("[type=submit],button:not([type])");
  if (submit) submit.disabled = true;
  const errorBox = form.querySelector(".error");
  if (errorBox) errorBox.hidden = true;
  try {
    if (kind === "login") {
      const { error } = await db.auth.signInWithPassword({
        email: loginEmail(data.username),
        password: data.password,
      });
      if (error) throw error;
      await loadData();
      return;
    }
    if (kind === "bootstrap") {
      await manage({ action: "bootstrap", ...data });
      setupAvailable = false;
      const { error } = await db.auth.signInWithPassword({
        email: loginEmail(data.username),
        password: data.password,
      });
      if (error) throw error;
      await loadData();
      toast("Yönetici hesabınız hazır. Önce öğretmen hesabı ve sınıf ekleyin.");
      return;
    }
    if (kind === "photo") {
      await checked(
        db
          .from("student_photos")
          .upsert({
            student_id: id,
            data_url: await photoData(data.photo),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single(),
      );
    }
    if (kind === "student") {
      const payload = {
        ...data,
        full_name: data.full_name.trim(),
        school_number: data.school_number.trim(),
      };
      await checked(
        id
          ? db.from("students").update(payload).eq("id", id).select().single()
          : db.from("students").insert(payload).select().single(),
      );
    }
    if (kind === "class") {
      const payload = {
        ...data,
        grade: Number(data.grade),
        teacher_id: data.teacher_id || null,
      };
      await checked(
        id
          ? db.from("classes").update(payload).eq("id", id).select().single()
          : db.from("classes").insert(payload).select().single(),
      );
    }
    if (kind === "account")
      await manage(
        id ? { action: "update", id, ...data } : { action: "create", ...data },
      );
    if (kind === "reset-password")
      await manage({ action: "reset_password", id, password: data.password });
    if (kind === "links") {
      const selected = Object.keys(data).filter((k) => data[k]);
      const p = state.profiles.find((p) => p.id === id);
      if (p.role === "student" && selected.length > 1)
        throw new Error("Öğrenci hesabına yalnızca bir öğrenci bağlayın.");
      await checked(
        db.rpc("set_student_links", {
          target_profile: id,
          student_ids: selected,
        }),
      );
    }
    if (kind === "details") {
      ["siblings", "percentile", "entry_score"].forEach(
        (k) => (data[k] = data[k] === "" ? null : Number(data[k])),
      );
      await checked(
        db
          .from("student_details")
          .upsert({ student_id: id, ...data })
          .select()
          .single(),
      );
    }
    if (kind === "book") {
      const payload = {
        ...data,
        grade: Number(data.grade),
        pages: data.pages ? Number(data.pages) : null,
      };
      await checked(
        id
          ? db.from("books").update(payload).eq("id", id).select().single()
          : db.from("books").insert(payload).select().single(),
      );
    }
    if (kind === "entry") {
      const { kind: recordKind, record_date, shared, ...payload } = data;
      validateEntry(recordKind, payload);
      const item = {
        record_date,
        payload,
        shared: shared === true || shared === "true",
      };
      await checked(
        id
          ? db
              .from("entries")
              .update(item)
              .eq("id", id)
              .eq(
                "updated_at",
                state.entries.find((x) => x.id === id).updated_at,
              )
              .select()
              .single()
          : db
              .from("entries")
              .insert({
                ...item,
                kind: recordKind,
                student_id: state.studentId,
                author_id: state.profile.id,
              })
              .select()
              .single(),
      );
    }
    if (kind === "own-password") {
      if (data.password !== data.confirm)
        throw new Error("Yeni şifreler aynı değil.");
      const { error: loginError } = await db.auth.signInWithPassword({
        email: loginEmail(state.profile.username),
        password: data.current,
      });
      if (loginError) throw new Error("Mevcut şifre hatalı.");
      const { error } = await db.auth.updateUser({ password: data.password });
      if (error) throw error;
      form.reset();
      toast("Şifreniz güncellendi.");
      return;
    }
    document.querySelector("dialog")?.close();
    await loadData();
    toast("Kayıt başarıyla kaydedildi.");
  } catch (err) {
    if (errorBox) {
      errorBox.textContent = errorText(err);
      errorBox.hidden = false;
    } else toast(errorText(err));
  } finally {
    if (submit) submit.disabled = false;
  }
});
async function start() {
  try {
    setupAvailable = (await manage({ action: "status" })).setup_available;
  } catch {
    /* Login still works when setup status is unavailable. */
  }
  try {
    await loadData();
  } catch (err) {
    authView();
    document.querySelector("#authError").textContent = errorText(err);
    document.querySelector("#authError").hidden = false;
  }
}
db.auth.onAuthStateChange((event) => {
  if (event === "SIGNED_OUT") {
    ++loadVersion;
    Object.assign(state, {
      profile: null,
      students: [],
      classes: [],
      profiles: [],
      entries: [],
      books: [],
      links: [],
      studentId: null,
      page: "dashboard",
    });
    authView();
  }
});
start();

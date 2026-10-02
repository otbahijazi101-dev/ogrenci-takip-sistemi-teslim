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

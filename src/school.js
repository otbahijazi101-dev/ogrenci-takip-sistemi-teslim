import { escape as e } from "./domain.js";

export const school = Object.freeze({
  name: "Düzce Fen ve Teknoloji Hafız Anadolu İmam Hatip Lisesi",
  shortName: "DÜZCE FENTEK",
  website: "https://fenveteknolojihaihl.meb.k12.tr/",
  appName: "Öğrenci Takip Sistemi",
});

export function schoolBrand() {
  return `<div class="brand"><img class="brand-logo" src="/school-logo.svg" alt="" aria-hidden="true"><div>${e(school.shortName)}<small>Lise öğrenci takip sistemi</small></div></div>`;
}

export function schoolHeading() {
  return `<div class="institution-heading"><div class="institution-brand"><img src="/school-logo.svg" alt="Düzce Fen ve Teknoloji Hafız Anadolu İmam Hatip Lisesi logosu"><p>${e(school.name)}</p></div><a href="${school.website}" target="_blank" rel="noopener noreferrer">Okulun resmî sitesi <span aria-hidden="true">↗</span></a></div>`;
}

export function printHeading() {
  return `<header class="print-only report-header"><strong>${e(school.name)}</strong><p>${e(school.appName)} · Lise takip defteri</p></header>`;
}

import { escape as e } from "./domain.js";

// School name verified on its MEB website. The wordmark is not an official logo.
export const school = Object.freeze({
  name: "Düzce Fen ve Teknoloji Hafız Anadolu İmam Hatip Lisesi",
  shortName: "DÜZCE FENTEK",
  website: "https://fenveteknolojihaihl.meb.k12.tr/",
  appName: "Öğrenci Takip Sistemi",
});

export function schoolBrand() {
  return `<div class="brand"><span class="brand-icon" aria-hidden="true">FT</span><div>${e(school.shortName)}<small>Lise öğrenci takip sistemi</small></div></div>`;
}

export function schoolHeading() {
  return `<div class="institution-heading"><p>${e(school.name)}</p><a href="${school.website}" target="_blank" rel="noopener noreferrer">Okulun resmî sitesi <span aria-hidden="true">↗</span></a></div>`;
}

export function printHeading() {
  return `<header class="print-only report-header"><strong>${e(school.name)}</strong><p>${e(school.appName)} · Lise takip defteri</p></header>`;
}

import { copy } from "../content/site.mjs";
import { escapeHtml, renderLayout } from "./layout.mjs";

export function renderHome() {
  const title = "Agentstration Newsletter";
  const description = "The bilingual technical newsletter for the Agentstration open-source project.";
  const body = `<main id="main"><section class="home-hero section-grid"><div class="container home-grid"><div><p class="eyebrow">Agentstration Newsletter</p><h1>The story behind every <em>release.</em></h1><p class="lede">Follow the platform release by release, in English or French, with practical explanations for developers and architects.</p></div><div class="language-panel" aria-labelledby="language-title"><p class="eyebrow" id="language-title">Choose your language · Choisissez votre langue</p><a class="language-choice" href="/en/" hreflang="en" lang="en"><span>EN</span><strong>Read in English</strong><i aria-hidden="true">→</i></a><a class="language-choice" href="/fr/" hreflang="fr" lang="fr"><span>FR</span><strong>Lire en français</strong><i aria-hidden="true">→</i></a></div></div></section></main>`;
  return renderLayout({ lang: "en", title, description, path: "/", alternatePath: "/fr/", body, current: "home" });
}

function editionCard(lang, edition) {
  const c = copy[lang];
  return `<article class="edition-card"><p class="edition-meta"><time datetime="${edition.publishedAt}">${edition.formattedDate[lang]}</time><span>${edition.prerelease ? c.prerelease : c.published}</span></p><h2><a href="/${lang}/releases/${edition.slug}/">${escapeHtml(edition.titles[lang])}</a></h2><p>${escapeHtml(edition.summaries[lang])}</p><a class="arrow-link" href="/${lang}/releases/${edition.slug}/">${c.newsletter}<span aria-hidden="true">→</span></a></article>`;
}

export function renderIndex(lang, editions) {
  const c = copy[lang];
  const cards = editions.length ? `<div class="edition-list">${editions.map(edition => editionCard(lang, edition)).join("")}</div>` : `<div class="empty-state"><span aria-hidden="true">01</span><div><h2>${c.emptyTitle}</h2><p>${c.emptyBody}</p></div></div>`;
  const body = `<main id="main"><section class="page-hero section-grid"><div class="container narrow"><p class="eyebrow">${c.indexKicker}</p><h1>${c.indexTitle}</h1><p class="lede">${c.indexDescription}</p></div></section><section class="section"><div class="container narrow">${cards}</div></section></main>`;
  return renderLayout({ lang, title: `${c.indexTitle} — Agentstration`, description: c.indexDescription, path: `/${lang}/`, alternatePath: `/${lang === "en" ? "fr" : "en"}/`, body });
}

import { copy, site } from "../content/site.mjs";
import { escapeHtml, renderLayout } from "./layout.mjs";

function neighbour(lang, label, edition, emptyLabel) {
  return edition ? `<a href="/${lang}/releases/${edition.slug}/"><small>${label}</small><strong>${escapeHtml(edition.titles[lang])}</strong></a>` : `<span><small>${label}</small><strong>${emptyLabel}</strong></span>`;
}

export function renderNewsletter(lang, edition, articleHtml, previous, next) {
  const c = copy[lang];
  const path = `/${lang}/releases/${edition.slug}/`;
  const other = lang === "en" ? "fr" : "en";
  const image = `/${lang}/releases/${edition.slug}/${edition.heroImage}`;
  const jsonLd = { "@context": "https://schema.org", "@type": "TechArticle", headline: edition.titles[lang], description: edition.summaries[lang], datePublished: edition.publishedAt, inLanguage: lang, mainEntityOfPage: `${site.origin}${path}`, image: `${site.origin}${image}`, publisher: { "@type": "Organization", name: "Agentstration", url: site.websiteUrl } };
  const body = `<main id="main"><article class="newsletter"><header class="article-hero section-grid"><div class="container article-heading"><a class="back-link" href="/${lang}/">← ${c.backToEditions}</a><p class="eyebrow">Agentstration ${escapeHtml(edition.version)}</p><h1>${escapeHtml(edition.titles[lang])}</h1><p class="lede">${escapeHtml(edition.summaries[lang])}</p><div class="article-meta"><time datetime="${edition.publishedAt}">${edition.formattedDate[lang]}</time><span>${edition.prerelease ? c.prerelease : c.published}</span><a href="${edition.releaseUrl}">${c.releaseNotes} ↗</a><a href="${edition.repositoryUrl}">${c.productRepository} ↗</a></div></div></header><figure class="article-cover container"><img src="${image}" alt="${escapeHtml(edition.heroAlt?.[lang] ?? edition.titles[lang])}">${edition.heroCaption?.[lang] ? `<figcaption>${escapeHtml(edition.heroCaption[lang])}</figcaption>` : ""}</figure><div class="article-layout container"><div class="article-body">${articleHtml}</div></div><nav class="edition-navigation container" aria-label="${c.editions}">${neighbour(lang, c.previous, previous, c.noPrevious)}${neighbour(lang, c.next, next, c.noNext)}</nav></article></main>`;
  return renderLayout({ lang, title: `${edition.titles[lang]} — Agentstration`, description: edition.summaries[lang], path, alternatePath: `/${other}/releases/${edition.slug}/`, body, type: "article", image, jsonLd, current: "release" });
}

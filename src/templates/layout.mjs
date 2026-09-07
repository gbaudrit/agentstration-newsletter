import { copy, site } from "../content/site.mjs";

export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function themeBootstrap() {
  return `<script>try{const t=localStorage.getItem('agentstration-theme');if(['light','dark','system'].includes(t))document.documentElement.dataset.theme=t}catch(e){}</script>`;
}

function themeIcon() {
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>`;
}

function githubIcon() {
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 .7a11.5 11.5 0 0 0-3.6 22.4c.6.1.8-.2.8-.6v-2.2c-3.4.7-4.1-1.4-4.1-1.4-.6-1.4-1.4-1.8-1.4-1.8-1.1-.8.1-.8.1-.8 1.2.1 1.9 1.2 1.9 1.2 1 1.8 2.7 1.3 3.4 1 .1-.7.4-1.3.7-1.6-2.7-.3-5.5-1.4-5.5-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.6.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0C14.8 5 15.8 5.3 15.8 5.3c.6 1.5.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.8 5.4-5.5 5.7.4.4.8 1.1.8 2.2v3.1c0 .4.2.7.8.6A11.5 11.5 0 0 0 12 .7Z"/></svg>`;
}

function header(lang, alternatePath, current = "editions") {
  const c = copy[lang];
  const other = lang === "en" ? "fr" : "en";
  return `<body>
<a class="skip-link" href="#main">${c.skip}</a>
<header class="site-header" data-header>
  <div class="container nav-shell">
    <a class="brand header-brand" href="/${lang}/" aria-label="${site.name}"><img class="header-lockup" src="/logos/agentstration-header-lockup.png" width="1224" height="222" alt="Agentstration"></a>
    <nav class="desktop-nav" aria-label="${c.newsletter}"><a href="/${lang}/"${current === "editions" ? ' aria-current="page"' : ""}>${c.editions}</a></nav>
    <div class="nav-actions">
      <a class="icon-button header-github-link" href="${site.repositoryUrl}" target="_blank" rel="noreferrer" aria-label="GitHub">${githubIcon()}</a>
      <a class="language-link" href="${alternatePath}" hreflang="${other}" lang="${other}" aria-label="${c.alternativeLanguage}">${c.alternativeLanguage}</a>
      <button class="icon-button theme-button" type="button" data-theme-toggle aria-label="${c.theme}">${themeIcon()}</button>
      <button class="icon-button menu-button" type="button" data-menu-toggle aria-label="${c.menu}" aria-expanded="false" aria-controls="mobile-menu"><span></span><span></span></button>
    </div>
  </div>
  <nav class="mobile-nav" id="mobile-menu" data-mobile-menu aria-label="${c.newsletter}" hidden><a href="/${lang}/"${current === "editions" ? ' aria-current="page"' : ""}>${c.editions}</a></nav>
</header>`;
}

function footer(lang) {
  const c = copy[lang];
  return `<footer class="site-footer"><div class="container footer-grid"><div><a class="footer-brand" href="/${lang}/"><img class="footer-lockup" src="/logos/agentstration-header-lockup.png" width="1224" height="222" alt="Agentstration"></a><p>${c.footerStatement}</p></div><div><h2>${c.footerProduct}</h2><a href="${site.websiteUrl}">${c.mainWebsite}</a><a href="${site.productRepositoryUrl}">GitHub</a></div><div><h2>${c.footerResources}</h2><a href="${site.repositoryUrl}">${c.source}</a><a href="/${lang}/">${c.editions}</a></div></div><div class="container footer-bottom"><span>© ${new Date().getFullYear()} Agentstration. ${c.legal}</span><span>${c.built}</span></div></footer></body></html>`;
}

export function renderLayout({ lang, title, description, path, alternatePath, body, type = "website", image = "/og.png", jsonLd, current }) {
  const c = copy[lang];
  const other = lang === "en" ? "fr" : "en";
  const canonical = `${site.origin}${path}`;
  const alternate = `${site.origin}${alternatePath}`;
  const imageUrl = image.startsWith("http") ? image : `${site.origin}${image}`;
  return `<!doctype html>
<html lang="${lang}" data-theme="system">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="theme-color" content="#080b12" media="(prefers-color-scheme: dark)">
  <meta name="theme-color" content="#f7f8fb" media="(prefers-color-scheme: light)">
  <link rel="canonical" href="${canonical}">
  <link rel="alternate" hreflang="${lang}" href="${canonical}">
  <link rel="alternate" hreflang="${other}" href="${alternate}">
  <link rel="alternate" hreflang="x-default" href="${site.origin}/">
  <meta property="og:type" content="${type}">
  <meta property="og:site_name" content="${site.name}">
  <meta property="og:locale" content="${c.locale}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${imageUrl}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${imageUrl}">
  <link rel="icon" href="/favicon/favicon.ico" sizes="any">
  <link rel="icon" href="/favicon/favicon-32.png" type="image/png" sizes="32x32">
  <link rel="apple-touch-icon" href="/favicon/favicon-180.png" sizes="180x180">
  <link rel="manifest" href="/site.webmanifest">
  <link rel="stylesheet" href="/assets/site.css">
  ${themeBootstrap()}
  <script src="/assets/site.js" defer></script>
  ${jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd).replaceAll("<", "\\u003c")}</script>` : ""}
</head>
${header(lang, alternatePath, current)}${body}${footer(lang)}`;
}

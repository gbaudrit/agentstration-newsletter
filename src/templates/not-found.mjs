import { copy } from "../content/site.mjs";
import { renderLayout } from "./layout.mjs";

export function renderNotFound(lang = "en") {
  const c = copy[lang];
  const body = `<main id="main"><section class="not-found section-grid"><div class="container narrow"><p class="eyebrow">404</p><h1>${c.notFoundTitle}</h1><p class="lede">${c.notFoundBody}</p><a class="button primary" href="/${lang}/">${c.returnHome}</a></div></section></main>`;
  return renderLayout({ lang, title: `404 — ${c.notFoundTitle}`, description: c.notFoundBody, path: "/404.html", alternatePath: "/404.html", body, current: "404" });
}

import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import MarkdownIt from "markdown-it";
import { site } from "../src/content/site.mjs";
import { renderHome, renderIndex } from "../src/templates/index.mjs";
import { escapeHtml } from "../src/templates/layout.mjs";
import { renderNewsletter } from "../src/templates/newsletter.mjs";
import { renderNotFound } from "../src/templates/not-found.mjs";
import { discoverReleases, withFormattedDates } from "./lib/releases.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const markdown = new MarkdownIt({ html: false, linkify: true, typographer: true });
markdown.renderer.rules.image = (tokens, index) => {
  const token = tokens[index];
  const src = token.attrGet("src");
  const alt = token.content;
  const title = token.attrGet("title");
  const image = `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" loading="lazy">`;
  return title ? `<figure>${image}<figcaption>${escapeHtml(title)}</figcaption></figure>` : image;
};

async function output(relative, content) {
  const target = join(dist, relative);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, content, "utf8");
}

const releases = withFormattedDates(await discoverReleases(root));
await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await cp(join(root, "public"), dist, { recursive: true });
await mkdir(join(dist, "assets"), { recursive: true });
await cp(join(root, "src", "styles", "site.css"), join(dist, "assets", "site.css"));
await cp(join(root, "src", "scripts", "site.js"), join(dist, "assets", "site.js"));

await output("index.html", renderHome());
for (const lang of site.languages) await output(join(lang, "index.html"), renderIndex(lang, releases));
await output("404.html", renderNotFound("en"));

for (const [index, release] of releases.entries()) {
  for (const lang of site.languages) {
    const target = join(lang, "releases", release.slug);
    await output(join(target, "index.html"), renderNewsletter(lang, release, markdown.render(release.markdown[lang]), releases[index + 1], releases[index - 1]));
    await cp(join(release.directory, "assets"), join(dist, target, "assets"), { recursive: true });
  }
}

const urls = ["/", ...site.languages.map(lang => `/${lang}/`), ...releases.flatMap(release => site.languages.map(lang => `/${lang}/releases/${release.slug}/`))];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(path => `  <url><loc>${site.origin}${path}</loc></url>`).join("\n")}\n</urlset>\n`;
await output("sitemap.xml", sitemap);
console.log(`Built ${urls.length} indexed pages and ${releases.length} bilingual release(s) in dist/.`);

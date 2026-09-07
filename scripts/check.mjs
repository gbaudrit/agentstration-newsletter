import { readdir, readFile, stat } from "node:fs/promises";
import { dirname, extname, join, normalize, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { site } from "../src/content/site.mjs";
import { discoverReleases } from "./lib/releases.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const failures = [];
const privatePatterns = [/prompt/i, /draft/i, /brouillon/i, /linkedin/i, /communication/i, /\.env/i];

function fail(message) { failures.push(message); }

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path)); else files.push(path);
  }
  return files;
}

function routeToFile(route) {
  const clean = route.split(/[?#]/)[0];
  if (clean === "/") return join(dist, "index.html");
  if (clean.endsWith("/")) return join(dist, clean.slice(1), "index.html");
  if (extname(clean)) return join(dist, clean.slice(1));
  return join(dist, clean.slice(1), "index.html");
}

await discoverReleases(root);
let files;
try { files = await walk(dist); } catch { throw new Error("dist/ is missing. Run npm run build first."); }
const htmlFiles = files.filter(file => file.endsWith(".html"));
for (const file of files) {
  const rel = relative(dist, file).replaceAll("\\", "/");
  if (privatePatterns.some(pattern => pattern.test(rel))) fail(`Private-looking file copied to dist: ${rel}`);
}

const linkedHtml = new Set([normalize(join(dist, "index.html"))]);
for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  const rel = relative(dist, file).replaceAll("\\", "/");
  if (/\b(?:file:\/\/\/|[A-Za-z]:\\|\/Users\/|\/home\/)/i.test(html)) fail(`${rel}: contains a local path.`);
  if (/\bhttp:\/\//i.test(html)) fail(`${rel}: contains an insecure HTTP URL.`);
  const canonical = html.match(/<link rel="canonical" href="([^"]+)">/)?.[1];
  if (!canonical?.startsWith(site.origin)) fail(`${rel}: missing or invalid canonical URL.`);
  const hreflangs = [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)">/g)];
  if (!["en", "fr", "x-default"].every(lang => hreflangs.some(match => match[1] === lang))) fail(`${rel}: incomplete hreflang links.`);
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const target = match[1];
    if (!target.startsWith("/") || target.startsWith("//")) continue;
    const targetFile = routeToFile(target);
    try { if (!(await stat(targetFile)).isFile()) fail(`${rel}: broken internal link ${target}`); else if (target.endsWith("/") || target.endsWith(".html")) linkedHtml.add(normalize(targetFile)); } catch { fail(`${rel}: broken internal link ${target}`); }
  }
}

for (const file of htmlFiles) {
  if (file.endsWith("404.html")) continue;
  if (!linkedHtml.has(normalize(file))) fail(`${relative(dist, file)}: orphaned HTML page.`);
}

const sitemap = await readFile(join(dist, "sitemap.xml"), "utf8");
for (const file of htmlFiles.filter(file => !file.endsWith("404.html"))) {
  const path = relative(dist, file).replaceAll("\\", "/").replace(/index\.html$/, "");
  const route = path ? `/${path}` : "/";
  if (!sitemap.includes(`<loc>${site.origin}${route}</loc>`)) fail(`${route}: missing from sitemap.xml.`);
}
const cname = (await readFile(join(dist, "CNAME"), "utf8")).trim();
if (cname !== "newsletter.agentstration.io") fail("CNAME has an unexpected value.");
if (failures.length) { console.error(failures.map(message => `- ${message}`).join("\n")); process.exitCode = 1; } else console.log(`Checked ${htmlFiles.length} HTML pages and ${files.length} generated files.`);

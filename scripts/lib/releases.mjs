import { access, readdir, readFile } from "node:fs/promises";
import { join, posix } from "node:path";

const requiredStringFields = ["version", "slug", "publishedAt", "releaseUrl", "repositoryUrl", "documentationUrl", "websiteUrl", "heroImage"];

async function exists(path) {
  try { await access(path); return true; } catch { return false; }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function validateHttps(value, field, label) {
  let url;
  try { url = new URL(value); } catch { throw new Error(`${label}: ${field} must be a valid URL.`); }
  assert(url.protocol === "https:", `${label}: ${field} must use HTTPS.`);
}

export async function discoverReleases(root) {
  const releasesRoot = join(root, "content", "releases");
  if (!await exists(releasesRoot)) return [];
  const entries = await readdir(releasesRoot, { withFileTypes: true });
  const releases = [];
  for (const entry of entries.filter(item => item.isDirectory())) {
    const directory = join(releasesRoot, entry.name);
    const label = `Release ${entry.name}`;
    const metadataPath = join(directory, "metadata.json");
    assert(await exists(metadataPath), `${label}: metadata.json is missing.`);
    let metadata;
    try { metadata = JSON.parse(await readFile(metadataPath, "utf8")); } catch (error) { throw new Error(`${label}: invalid metadata.json (${error.message}).`); }
    for (const field of requiredStringFields) assert(typeof metadata[field] === "string" && metadata[field].trim(), `${label}: ${field} is required.`);
    assert(typeof metadata.prerelease === "boolean", `${label}: prerelease must be a boolean.`);
    assert(metadata.slug === entry.name, `${label}: slug must match its directory name.`);
    assert(metadata.version === metadata.slug, `${label}: version and slug must match.`);
    assert(/^\d{4}-\d{2}-\d{2}$/.test(metadata.publishedAt) && !Number.isNaN(Date.parse(`${metadata.publishedAt}T00:00:00Z`)), `${label}: publishedAt must be a valid YYYY-MM-DD date.`);
    for (const field of ["releaseUrl", "repositoryUrl", "documentationUrl", "websiteUrl"]) validateHttps(metadata[field], field, label);
    for (const field of ["titles", "summaries"]) {
      assert(metadata[field] && ["en", "fr"].every(lang => typeof metadata[field][lang] === "string" && metadata[field][lang].trim()), `${label}: ${field} must contain non-empty en and fr values.`);
    }
    const markdown = {};
    for (const lang of ["en", "fr"]) {
      const source = join(directory, `${lang}.md`);
      assert(await exists(source), `${label}: ${lang}.md is missing.`);
      markdown[lang] = await readFile(source, "utf8");
      assert(markdown[lang].trim(), `${label}: ${lang}.md is empty.`);
    }
    assert(await exists(join(directory, metadata.heroImage)), `${label}: heroImage does not exist.`);
    const referencedAssets = [...markdown.en.matchAll(/!\[[^\]]*\]\(([^\s)]+)(?:\s+['"][^'"]*['"])?\)/g), ...markdown.fr.matchAll(/!\[[^\]]*\]\(([^\s)]+)(?:\s+['"][^'"]*['"])?\)/g)]
      .map(match => match[1]).filter(value => !/^(https?:|data:|\/)/.test(value));
    for (const asset of referencedAssets) {
      const normalized = posix.normalize(asset.replaceAll("\\", "/"));
      assert(!normalized.startsWith("../"), `${label}: referenced assets must stay inside the release directory.`);
      assert(await exists(join(directory, normalized)), `${label}: referenced asset ${asset} does not exist.`);
    }
    releases.push({ ...metadata, directory, markdown });
  }
  releases.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt) || b.version.localeCompare(a.version));
  const slugs = new Set();
  for (const release of releases) { assert(!slugs.has(release.slug), `Duplicate release slug: ${release.slug}.`); slugs.add(release.slug); }
  return releases;
}

export function withFormattedDates(releases) {
  return releases.map(release => ({ ...release, formattedDate: {
    en: new Intl.DateTimeFormat("en", { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${release.publishedAt}T00:00:00Z`)),
    fr: new Intl.DateTimeFormat("fr", { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${release.publishedAt}T00:00:00Z`))
  } }));
}

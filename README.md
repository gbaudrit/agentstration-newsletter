# Agentstration Newsletter

This repository builds the official bilingual Agentstration newsletter for `https://newsletter.agentstration.io`. It contains only public editions, public assets, and the small static-site generator used to publish them.

Editorial drafts, prompts, production scripts, and communication packages remain in the private `gbaudrit/agentstration-communication` repository. Product claims must be verified against the matching published tag in `gbaudrit/agentstration` before content is copied here.

## Architecture

The project requires Node.js 20 or later and has no client framework, CMS, database, or server runtime. `scripts/build.mjs` discovers release folders, validates their metadata and bilingual Markdown, renders semantic HTML, and writes the complete site to the ignored `dist/` directory. `markdown-it` is the only runtime build dependency.

The source layout is:

```text
content/releases/<slug>/  Published bilingual edition and public assets
src/templates/            HTML templates
src/styles/               Shared site and article styles
src/scripts/              Progressive theme and mobile-menu behavior
scripts/                  Build, verification, and local server
public/                   Domain, brand, favicon, and social assets
```

The design tokens, header, footer, responsive conventions, language control, and theme behavior follow `gbaudrit/agentstration-website`. The sites intentionally use the same `agentstration-theme` key, but browser `localStorage` is isolated by origin: each subdomain remembers its own preference.

## Local development

```console
npm ci
npm run build
npm run check
npm run serve
```

Open `http://127.0.0.1:4173`. The generated routes currently include `/`, `/en/`, `/fr/`, and `/404.html`; release routes are created automatically when an edition is added.

## Add an edition

Create `content/releases/<slug>/` with:

```text
metadata.json
en.md
fr.md
assets/
  release-cover.png
```

Use this metadata shape:

```json
{
  "version": "0.0.0",
  "slug": "0.0.0",
  "publishedAt": "2026-01-01",
  "prerelease": false,
  "releaseUrl": "https://github.com/gbaudrit/agentstration/releases/tag/v0.0.0",
  "repositoryUrl": "https://github.com/gbaudrit/agentstration",
  "documentationUrl": "https://docs.agentstration.io",
  "websiteUrl": "https://www.agentstration.io",
  "titles": { "en": "English title", "fr": "Titre français" },
  "summaries": { "en": "English summary", "fr": "Résumé français" },
  "heroImage": "assets/release-cover.png",
  "heroAlt": { "en": "English alternative text", "fr": "Texte alternatif français" },
  "heroCaption": { "en": "English caption", "fr": "Légende française" }
}
```

The version, slug, and directory name must match. Both Markdown files must be complete, natural versions of the same editorial coverage. Put only publication-ready images in `assets/`, use relative Markdown such as `![Alternative text](assets/screenshot.png "Visible caption")`, and verify that every screenshot comes from the published tag. The quoted Markdown image title becomes a visible caption.

Run `npm run build` and `npm run check` before review. The build fails on missing fields, invalid dates, missing languages, non-HTTPS product links, or missing referenced assets. The checks also cover internal links, canonical and `hreflang` metadata, indexed pages, the sitemap, local paths, insecure URLs, orphan pages, and private-looking files in `dist/`.

The first `0.2.0-alpha.1` edition is deliberately not included yet. Its editorial source and publication assets will be imported in a separate step after the private review material is explicitly made available for that work.

## GitHub Pages and custom domain

The workflow verifies Pull Requests without deploying them. A push to `main` builds, checks, uploads only `dist/`, and deploys with the official GitHub Pages actions. It needs no custom secret.

After the publishing Pull Request is merged, an administrator must:

1. Open **Settings → Pages** in `agentstration-newsletter`.
2. Select **GitHub Actions** as the source.
3. Set `newsletter.agentstration.io` as the custom domain.
4. Verify `agentstration.io` on the GitHub account if required.
5. Create the DNS record `CNAME newsletter gbaudrit.github.io.`.
6. Wait for domain and certificate validation.
7. Enable **Enforce HTTPS**.

These settings, the DNS record, merging the Pull Request, and any LinkedIn publication remain manual actions.

# Agentstration Newsletter

This repository builds and publishes the official bilingual Agentstration newsletter at [newsletter.agentstration.io](https://newsletter.agentstration.io). It contains only public editions, public assets, and the small static-site generator used to publish them.

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

Open [http://127.0.0.1:4173](http://127.0.0.1:4173). The generated routes currently include `/`, `/en/`, `/fr/`, and `/404.html`; release routes are created automatically when an edition is added.

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

No edition is published yet. Until the first edition is added, the English and French indexes display a publication-ready empty state. Editorial material and public release assets must be reviewed before they are imported from the private communication repository.

## GitHub Pages and custom domain

The production site is deployed through GitHub Pages with the custom domain `newsletter.agentstration.io`.

The repository is currently configured as follows:

- GitHub Actions is the Pages build source.
- Pull Requests run the complete build and verification jobs without deploying.
- Pushes to `main` build, verify, upload only `dist/`, and deploy with the official GitHub Pages actions.
- The `github-pages` environment permits deployments from `main`.
- `public/CNAME` declares `newsletter.agentstration.io` and is copied to `dist/`.
- DNS points the `newsletter` CNAME to `gbaudrit.github.io.`.
- The GitHub Pages certificate is approved and **Enforce HTTPS** is enabled.
- The workflow requires no custom secret.

Publishing a new edition still requires a reviewed Pull Request containing both languages and all public assets. Merging that Pull Request triggers the site deployment; it does not publish anything to LinkedIn or another communication channel.

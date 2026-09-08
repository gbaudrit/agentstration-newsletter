# Agentstration Newsletter

This repository contains the official bilingual newsletter for [Agentstration](https://www.agentstration.io), published at [newsletter.agentstration.io](https://newsletter.agentstration.io).

The newsletter follows Agentstration release after release. Each edition explains the most important product changes and technical decisions for developers and architects, in both English and French.

The repository contains:

- publication-ready editions and their public assets;
- the templates and styles used by the newsletter website;
- a small static-site generator;
- automated checks that keep both languages, links, metadata, and assets consistent.

## Repository structure

```text
content/releases/<slug>/  Bilingual editions and their public assets
src/templates/            HTML templates
src/styles/               Shared website and article styles
src/scripts/              Progressive browser behavior
scripts/                  Build, verification, and local preview tools
public/                   Public brand and website assets
```

The build discovers editions automatically from `content/releases/`. Each edition contains its metadata, English and French Markdown files, and its public images.

## Local development

The project requires Node.js 20 or later.

```console
npm ci
npm run build
npm run check
npm run serve
```

The generated website is written to `dist/`. After starting the local server, open [http://127.0.0.1:4173](http://127.0.0.1:4173).

Agentstration releases and their published tags are the source of truth for product information. Editorial drafts, prompts, and private communication material remain outside this public repository.

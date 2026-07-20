import { cp, copyFile, mkdir, readFile, rm, writeFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const output = new URL('../_site/', import.meta.url);
const siteUrl = 'https://yan555999.github.io/faceswapai-open-research';
const repositoryUrl = 'https://github.com/YAN555999/faceswapai-open-research';
const releaseUrl = `${repositoryUrl}/releases/tag/v1.2.0`;
const softwareHeritageUrl = 'https://archive.softwareheritage.org/swh:1:snp:0370cbb1b4a4b9b8f7e26b6d660b3c49ea950732';
const socialImage = 'https://faceswapai.com/research/photo-pose-study-v1.jpg';
const googleSiteVerification = 'NUMquWSbyXOwJSNRPxq7kp_LCszL6N9VbVuXMoy3d0A';

const readText = (path) => readFile(new URL(path, root), 'utf8');
const catalog = JSON.parse(await readText('catalog/research-catalog-v1.json'));

const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

const jsonScript = (value) => JSON.stringify(value).replaceAll('<', '\\u003c');
const datasetUrl = (dataset) => `${siteUrl}/datasets/${dataset.identifier}/`;
const mirrorFile = (dataset) => new URL(dataset.download).pathname.split('/').at(-1);
const mirrorUrl = (dataset) => `${siteUrl}/data/${mirrorFile(dataset)}`;
const imageUrls = (dataset) => dataset.isBasedOn.filter((url) => /\.(?:avif|jpe?g|png|webp)$/i.test(url));
const pageAssets = [
  'group-photo-reference-v1.webp',
  'multi-face-mapping-output-v1.webp',
  'photo-pose-output-neutral-v1.avif',
  'video-continuity-output-poster-v1.webp',
];
const localVisuals = {
  'faceswapai-independent-multi-face-mapping-v1.0.0': { file: 'multi-face-mapping-output-v1.webp', width: 960, height: 540 },
  'faceswapai-photo-pose-study-v1.0.0': { file: 'photo-pose-output-neutral-v1.avif', width: 960, height: 540 },
  'faceswapai-group-face-size-detection-study-v1.0.0': { file: 'group-photo-reference-v1.webp', width: 960, height: 640 },
  'faceswapai-video-continuity-study-v1.0.0': { file: 'video-continuity-output-poster-v1.webp', width: 960, height: 540 },
};

const datasetVisual = (dataset) => {
  const local = localVisuals[dataset.identifier];
  if (local) {
    return {
      ...local,
      absolute: `${siteUrl}/assets/${local.file}`,
      src: `../../assets/${local.file}`,
    };
  }

  const remote = imageUrls(dataset)[0];
  return remote ? { absolute: remote, src: remote, width: 960, height: 640 } : null;
};

function documentHead({ title, description, canonical, image = socialImage, type = 'website', extra = '', schema, stylesHref = 'assets/styles.css' }) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="google-site-verification" content="${googleSiteVerification}">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
  <link rel="canonical" href="${canonical}">
  <link rel="stylesheet" href="${stylesHref}">
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='8' fill='%23101817'/%3E%3Ccircle cx='32' cy='32' r='19' fill='%23df573b'/%3E%3Ccircle cx='32' cy='32' r='9' fill='%23f7a28f'/%3E%3C/svg%3E">
  <meta property="og:type" content="${type}">
  <meta property="og:site_name" content="FaceSwapAI Open Research">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${image}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${image}">
  ${extra}
  <script type="application/ld+json">${jsonScript(schema)}</script>
</head>`;
}

function header() {
  return `<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header">
  <div class="header-inner">
    <a class="brand" href="${siteUrl}/" aria-label="FaceSwapAI Open Research home"><span class="brand-mark" aria-hidden="true"></span>FaceSwapAI Open Research</a>
    <nav class="site-nav" aria-label="Research navigation">
      <a href="${siteUrl}/#catalog">Catalog</a>
      <a href="${siteUrl}/#citation">Citation</a>
      <a href="${repositoryUrl}">GitHub</a>
    </nav>
  </div>
</header>`;
}

function footer() {
  return `<footer class="site-footer">
  <div class="footer-inner">
    <span>Publisher-controlled research mirror · CC BY 4.0</span>
    <span><a href="https://faceswapai.com/press#editorial-standards">Editorial standard</a> · <a href="${repositoryUrl}/issues/new?template=data-correction.yml">Report a correction</a></span>
  </div>
</footer>`;
}

const catalogSchema = {
  '@context': 'https://schema.org',
  '@type': 'DataCatalog',
  '@id': `${siteUrl}/#catalog`,
  name: catalog.name,
  description: catalog.description,
  url: `${siteUrl}/`,
  sameAs: [catalog.canonicalUrl, repositoryUrl, softwareHeritageUrl],
  dateModified: catalog.lastUpdated,
  version: catalog.version,
  license: catalog.license,
  isAccessibleForFree: true,
  creator: {
    '@type': 'Organization',
    name: catalog.publisher.name,
    url: catalog.publisher.url,
  },
  hasPart: catalog.datasets.map((dataset) => ({
    '@type': 'Dataset',
    '@id': `${datasetUrl(dataset)}#dataset`,
    name: dataset.name,
    description: dataset.description,
    url: datasetUrl(dataset),
    sameAs: dataset.landingPage,
    version: dataset.version,
    license: dataset.license,
    creator: {
      '@type': 'Organization',
      name: catalog.publisher.name,
      url: catalog.publisher.url,
    },
  })),
};

const catalogRows = catalog.datasets.map((dataset, index) => {
  const search = [dataset.name, dataset.description, dataset.measurementTechnique, ...dataset.keywords, ...dataset.variables]
    .join(' ')
    .toLocaleLowerCase();
  return `<article class="dataset-row" data-dataset data-search="${escapeHtml(search)}">
    <div class="dataset-index" aria-hidden="true">${String(index + 1).padStart(2, '0')}</div>
    <div>
      <p class="dataset-meta">Dataset · v${escapeHtml(dataset.version)} · ${escapeHtml(dataset.dateModified)}</p>
      <h2><a href="${datasetUrl(dataset)}">${escapeHtml(dataset.name)}</a></h2>
      <p class="dataset-description">${escapeHtml(dataset.description)}</p>
      <p class="evidence-boundary"><strong>Evidence boundary:</strong> ${escapeHtml(dataset.measurementTechnique)}</p>
      <div class="dataset-actions">
        <a href="${datasetUrl(dataset)}">View dataset record</a>
        <a href="${mirrorUrl(dataset)}" download>JSON mirror</a>
        <a href="${dataset.landingPage}">Canonical method</a>
      </div>
      <details>
        <summary>${dataset.variables.length} measured variables</summary>
        <ul>${dataset.variables.map((variable) => `<li>${escapeHtml(variable)}</li>`).join('')}</ul>
      </details>
    </div>
  </article>`;
}).join('\n');

const indexHtml = `${documentHead({
  title: 'FaceSwapAI Open Research Catalog: Datasets & Benchmarks',
  description: `Browse ${catalog.datasetCount} versioned AI face swap datasets, production studies, integrity records and citation metadata from FaceSwapAI Editorial.`,
  canonical: `${siteUrl}/`,
  schema: catalogSchema,
  extra: `<link rel="alternate" type="application/json" href="${siteUrl}/catalog/research-catalog-v1.json">
  <link rel="alternate" type="text/csv" href="${siteUrl}/catalog/research-catalog-v1.csv">`,
})}
<body>
${header()}
<main id="main">
  <section class="hero">
    <div class="hero-inner">
      <div>
        <p class="eyebrow">Version ${escapeHtml(catalog.version)} · updated ${escapeHtml(catalog.lastUpdated)}</p>
        <h1>FaceSwapAI Open Research Catalog</h1>
        <p class="hero-copy">Versioned face swap measurements, production studies, decision aids and vendor-claim snapshots with exact methods, source boundaries, limitations and SHA-256 integrity records.</p>
        <div class="actions">
          <a class="button button-primary" href="#catalog">Browse ${catalog.datasetCount} datasets</a>
          <a class="button button-dark" href="${siteUrl}/catalog/research-catalog-v1.json">Catalog JSON</a>
          <a class="button button-dark" href="${releaseUrl}">Release v${escapeHtml(catalog.version)}</a>
        </div>
      </div>
      <div class="visual-proof" aria-label="Published research evidence previews">
        <figure><img src="assets/multi-face-mapping-output-v1.webp" width="960" height="540" alt="Synthetic four-person output from the independent multi-face mapping production study" fetchpriority="high" decoding="async"><figcaption>Independent multi-face mapping output</figcaption></figure>
        <figure><img src="assets/photo-pose-output-neutral-v1.avif" width="960" height="540" alt="Synthetic neutral-pose output from the controlled photo pose study" loading="lazy" decoding="async"><figcaption>Photo pose study output</figcaption></figure>
        <figure><img src="assets/video-continuity-output-poster-v1.webp" width="960" height="540" alt="Synthetic output poster from the controlled video continuity study" loading="lazy" decoding="async"><figcaption>Video continuity output</figcaption></figure>
      </div>
    </div>
  </section>
  <section class="facts-band" aria-label="Catalog facts">
    <div class="facts">
      <div class="fact"><strong>${catalog.datasetCount}</strong><span>versioned datasets</span></div>
      <div class="fact"><strong>13</strong><span>release checksums</span></div>
      <div class="fact"><strong>CC BY 4.0</strong><span>catalog license</span></div>
      <div class="fact"><strong>SWHID</strong><span>independent preservation</span></div>
    </div>
  </section>
  <div class="content">
    <section id="catalog" aria-labelledby="catalog-heading">
      <div class="section-heading">
        <h2 id="catalog-heading">Dataset records</h2>
        <p>Each record separates what was measured from what the evidence cannot establish. Customer uploads, identity embeddings and private account data are excluded.</p>
      </div>
      <div class="catalog-tools">
        <label class="search-label" for="catalog-search">Filter catalog
          <input class="search-input" id="catalog-search" data-catalog-search type="search" placeholder="Pose, video, privacy, group photo…" autocomplete="off">
        </label>
        <output class="results-count" data-results-count aria-live="polite">${catalog.datasetCount} of ${catalog.datasetCount} datasets</output>
      </div>
      <div class="dataset-list">${catalogRows}</div>
    </section>
    <section class="publisher-note" aria-labelledby="publisher-heading">
      <h2 id="publisher-heading">Publisher and evidence boundary</h2>
      <p>This GitHub Pages archive is controlled by <strong>FaceSwapAI Editorial</strong>. It provides an inspectable mirror and correction history; it is not an independent review, certification, model leaderboard or provider endorsement.</p>
      <p>Canonical methods and limitations remain on <a href="${catalog.canonicalUrl}">FaceSwapAI Research</a>. Repository history is also preserved by <a href="${softwareHeritageUrl}">Software Heritage</a>.</p>
    </section>
    <section class="citation-panel" id="citation" aria-labelledby="citation-heading">
      <h2 id="citation-heading">Citation</h2>
      <p class="citation-text">FaceSwapAI Editorial (2026). <em>FaceSwapAI Face Swap Research and Open Data Catalog</em> (Version ${escapeHtml(catalog.version)}). ${escapeHtml(catalog.canonicalUrl)}</p>
      <div class="actions">
        <a class="button" href="${siteUrl}/CITATION.cff">CITATION.cff</a>
        <a class="button" href="${siteUrl}/SHA256SUMS">SHA-256 checksums</a>
        <a class="button" href="${siteUrl}/datapackage.json">Data Package</a>
      </div>
    </section>
  </div>
</main>
${footer()}
<script src="assets/catalog.js" defer></script>
</body>
</html>`;

function datasetSchema(dataset) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    '@id': `${datasetUrl(dataset)}#dataset`,
    name: dataset.name,
    description: dataset.description,
    url: datasetUrl(dataset),
    sameAs: dataset.landingPage,
    identifier: dataset.identifier,
    version: dataset.version,
    datePublished: dataset.datePublished,
    dateModified: dataset.dateModified,
    license: dataset.license,
    isAccessibleForFree: dataset.isAccessibleForFree,
    keywords: dataset.keywords,
    measurementTechnique: dataset.measurementTechnique,
    variableMeasured: dataset.variables,
    isBasedOn: dataset.isBasedOn,
    creator: {
      '@type': 'Organization',
      name: catalog.publisher.name,
      url: catalog.publisher.url,
    },
    includedInDataCatalog: {
      '@type': 'DataCatalog',
      '@id': `${siteUrl}/#catalog`,
      name: catalog.name,
      url: `${siteUrl}/`,
    },
    distribution: [
      {
        '@type': 'DataDownload',
        name: 'GitHub Pages mirror',
        contentUrl: mirrorUrl(dataset),
        encodingFormat: dataset.encodingFormat,
      },
      {
        '@type': 'DataDownload',
        name: 'Canonical FaceSwapAI download',
        contentUrl: dataset.download,
        encodingFormat: dataset.encodingFormat,
      },
    ],
  };
}

function datasetHtml(dataset) {
  const visual = datasetVisual(dataset);
  const description = dataset.description;
  const canonical = datasetUrl(dataset);
  const extra = `<meta name="citation_title" content="${escapeHtml(dataset.name)}">
  <meta name="citation_author" content="FaceSwapAI Editorial">
  <meta name="citation_publication_date" content="${escapeHtml(dataset.datePublished)}">
  <meta name="citation_public_url" content="${canonical}">
  <link rel="alternate" type="${escapeHtml(dataset.encodingFormat)}" href="${mirrorUrl(dataset)}">`;

  return `${documentHead({
    title: `${dataset.name} | FaceSwapAI Open Research`,
    description,
    canonical,
    image: visual?.absolute || socialImage,
    type: 'article',
    extra,
    schema: datasetSchema(dataset),
    stylesHref: '../../assets/styles.css',
  })}
<body>
${header()}
<main id="main">
  <header class="record-header">
    <div class="content" style="padding-top:0;padding-bottom:0">
      <p class="eyebrow">Dataset record · ${escapeHtml(dataset.identifier)}</p>
      <h1>${escapeHtml(dataset.name)}</h1>
      <p class="hero-copy" style="color:#40504b">${escapeHtml(description)}</p>
      <div class="actions">
        <a class="button button-primary" href="${mirrorUrl(dataset)}" download>Download JSON mirror</a>
        <a class="button" href="${dataset.landingPage}">Read canonical method</a>
      </div>
    </div>
  </header>
  <div class="content record-layout">
    <article class="record-main">
      ${visual ? `<figure class="record-visual"><img src="${visual.src}" alt="Published source or output associated with ${escapeHtml(dataset.name)}" width="${visual.width}" height="${visual.height}" loading="lazy" decoding="async"><figcaption>Published evidence asset listed by this dataset record.</figcaption></figure>` : ''}
      <h2>Evidence boundary</h2>
      <p class="evidence-boundary">${escapeHtml(dataset.measurementTechnique)}</p>
      <h2>Measured variables</h2>
      <ul class="variable-list">${dataset.variables.map((variable) => `<li>${escapeHtml(variable)}</li>`).join('')}</ul>
      <h2>Source records</h2>
      <ul class="source-list">${dataset.isBasedOn.map((source) => `<li><a href="${source}">${escapeHtml(source)}</a></li>`).join('')}</ul>
      <h2>Interpretation</h2>
      <p>Use this record only within its stated measurement boundary. The catalog does not convert bounded observations into universal quality claims, legal conclusions, security certifications or provider endorsements.</p>
    </article>
    <aside class="record-sidebar" aria-label="Dataset metadata">
      <dl>
        <dt>Identifier</dt><dd>${escapeHtml(dataset.identifier)}</dd>
        <dt>Version</dt><dd>${escapeHtml(dataset.version)}</dd>
        <dt>Published</dt><dd>${escapeHtml(dataset.datePublished)}</dd>
        <dt>Modified</dt><dd>${escapeHtml(dataset.dateModified)}</dd>
        <dt>Format</dt><dd>${escapeHtml(dataset.encodingFormat)}</dd>
        <dt>License</dt><dd><a href="${dataset.license}">CC BY 4.0</a></dd>
        <dt>Keywords</dt><dd>${dataset.keywords.map(escapeHtml).join(', ')}</dd>
      </dl>
      <div class="actions">
        <a class="button" href="${siteUrl}/CITATION.cff">Citation file</a>
        <a class="button" href="${siteUrl}/SHA256SUMS">Checksums</a>
      </div>
    </aside>
  </div>
</main>
${footer()}
</body>
</html>`;
}

await rm(output, { recursive: true, force: true });
await mkdir(new URL('assets/', output), { recursive: true });
await mkdir(new URL('catalog/', output), { recursive: true });
await cp(new URL('data/', root), new URL('data/', output), { recursive: true });
await copyFile(new URL('site/styles.css', root), new URL('assets/styles.css', output));
await copyFile(new URL('site/catalog.js', root), new URL('assets/catalog.js', output));
for (const asset of pageAssets) {
  await copyFile(new URL(`site/assets/${asset}`, root), new URL(`assets/${asset}`, output));
}

for (const path of [
  'catalog/research-catalog-v1.json',
  'catalog/research-catalog-v1.csv',
  'CITATION.cff',
  'SHA256SUMS',
  'datapackage.json',
  'LICENSE',
  'NOTICE.md',
]) {
  await copyFile(new URL(path, root), new URL(path, output));
}

await writeFile(new URL('index.html', output), indexHtml);

for (const dataset of catalog.datasets) {
  const directory = new URL(`datasets/${dataset.identifier}/`, output);
  await mkdir(directory, { recursive: true });
  await writeFile(new URL('index.html', directory), datasetHtml(dataset));
}

const sitemapUrls = [
  { url: `${siteUrl}/`, lastmod: catalog.lastUpdated },
  ...catalog.datasets.map((dataset) => ({ url: datasetUrl(dataset), lastmod: dataset.dateModified })),
];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map(({ url, lastmod }) => `  <url><loc>${url}</loc><lastmod>${lastmod}</lastmod></url>`).join('\n')}
</urlset>\n`;
await writeFile(new URL('sitemap.xml', output), sitemap);
await writeFile(new URL('robots.txt', output), `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`);

const llms = `# FaceSwapAI Open Research Catalog

> Publisher-controlled mirror of versioned face swap datasets, bounded production studies, decision aids and citation metadata. This archive is not an independent review, certification or provider endorsement.

- Catalog: ${siteUrl}/
- Canonical publication: ${catalog.canonicalUrl}
- Catalog JSON: ${siteUrl}/catalog/research-catalog-v1.json
- Citation: ${siteUrl}/CITATION.cff
- Checksums: ${siteUrl}/SHA256SUMS
- Repository: ${repositoryUrl}

## Dataset records

${catalog.datasets.map((dataset) => `- [${dataset.name}](${datasetUrl(dataset)}): ${dataset.description}`).join('\n')}
`;
await writeFile(new URL('llms.txt', output), llms);

const notFound = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex, follow"><title>Record not found | FaceSwapAI Open Research</title><link rel="stylesheet" href="assets/styles.css"></head><body>${header()}<main id="main" class="content"><h1 style="font-size:44px">Record not found</h1><p>The requested archive path does not exist.</p><a class="button button-primary" href="${siteUrl}/">Open the research catalog</a></main>${footer()}</body></html>`;
await writeFile(new URL('404.html', output), notFound);

console.log(`Built GitHub Pages catalog with ${catalog.datasets.length} dataset records.`);

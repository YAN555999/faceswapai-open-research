import { cp, copyFile, mkdir, readFile, rm, writeFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const output = new URL('../_site/', import.meta.url);
const siteUrl = 'https://yan555999.github.io/faceswapai-open-research';
const repositoryUrl = 'https://github.com/YAN555999/faceswapai-open-research';
const releaseUrl = `${repositoryUrl}/releases/tag/v1.4.0`;
const archivedReleaseTag = 'v1.3.0';
const softwareHeritageUrl = 'https://archive.softwareheritage.org/swh:1:snp:d2b86adb1ed3236cc2bf9caac70b4079bbbfdbdc';
const socialImage = 'https://faceswapai.com/research/photo-pose-study-v1.jpg';
const googleSiteVerification = 'NUMquWSbyXOwJSNRPxq7kp_LCszL6N9VbVuXMoy3d0A';
const organizationId = 'https://faceswapai.com/#organization';
const feedUrl = `${siteUrl}/feed.xml`;
const dcatUrl = `${siteUrl}/catalog/research-catalog-dcat.jsonld`;

const readText = (path) => readFile(new URL(path, root), 'utf8');
const catalog = JSON.parse(await readText('catalog/research-catalog-v1.json'));
const checksumCount = (await readText('SHA256SUMS')).trim().split('\n').length;

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
  'faceswapai-independent-multi-face-mapping-v1.0.0': {
    file: 'multi-face-mapping-output-v1.webp',
    width: 960,
    height: 540,
    alt: 'Synthetic four-person output with four independently mapped replacement faces',
    caption: 'Independent multi-face mapping production output',
  },
  'faceswapai-photo-pose-study-v1.0.0': {
    file: 'photo-pose-output-neutral-v1.avif',
    width: 960,
    height: 540,
    alt: 'Synthetic neutral-pose output from the controlled photo face-swap pose study',
    caption: 'Controlled photo pose study neutral output',
  },
  'faceswapai-group-face-size-detection-study-v1.0.0': {
    file: 'group-photo-reference-v1.webp',
    width: 960,
    height: 640,
    alt: 'Synthetic four-person group-photo reference used for face-size detector measurements',
    caption: 'Group photo reference used across the resize series',
  },
  'faceswapai-video-continuity-study-v1.0.0': {
    file: 'video-continuity-output-poster-v1.webp',
    width: 960,
    height: 540,
    alt: 'Synthetic output frame from a controlled 10-second video face-swap continuity study',
    caption: 'Controlled production video continuity output',
  },
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

const publisherSchema = {
  '@type': 'Organization',
  '@id': organizationId,
  name: 'FaceSwapAI',
  alternateName: 'FaceSwapAI Editorial',
  url: 'https://faceswapai.com/',
  publishingPrinciples: 'https://faceswapai.com/press#editorial-standards',
};

const datasetImageSchema = (dataset) => {
  const visual = datasetVisual(dataset);
  if (!visual?.absolute || !visual.alt) return undefined;
  return {
    '@type': 'ImageObject',
    contentUrl: visual.absolute,
    caption: visual.alt,
    creator: publisherSchema,
    creditText: 'FaceSwapAI Editorial',
    copyrightNotice: 'FaceSwapAI',
    license: dataset.license,
    acquireLicensePage: `${siteUrl}/NOTICE.md`,
  };
};

function documentHead({ title, description, canonical, image = socialImage, imageAlt = title, type = 'website', extra = '', schema, stylesHref = 'assets/styles.css' }) {
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
  <link rel="alternate" type="application/atom+xml" title="FaceSwapAI Open Research updates" href="${feedUrl}">
  <link rel="stylesheet" href="${stylesHref}">
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='8' fill='%23101817'/%3E%3Ccircle cx='32' cy='32' r='19' fill='%23df573b'/%3E%3Ccircle cx='32' cy='32' r='9' fill='%23f7a28f'/%3E%3C/svg%3E">
  <meta property="og:type" content="${type}">
  <meta property="og:site_name" content="FaceSwapAI Open Research">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${image}">
  <meta property="og:image:alt" content="${escapeHtml(imageAlt)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${image}">
  <meta name="twitter:image:alt" content="${escapeHtml(imageAlt)}">
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
    <span><a href="${feedUrl}">Atom feed</a> · <a href="https://faceswapai.com/press#editorial-standards">Editorial standard</a> · <a href="${repositoryUrl}/issues/new?template=data-correction.yml">Report a correction</a></span>
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
  sameAs: [catalog.canonicalUrl, repositoryUrl],
  dateModified: catalog.lastUpdated,
  version: catalog.version,
  license: catalog.license,
  isAccessibleForFree: true,
  creator: publisherSchema,
  publisher: publisherSchema,
  hasPart: catalog.datasets.map((dataset) => ({
    '@type': 'Dataset',
    '@id': `${datasetUrl(dataset)}#dataset`,
    name: dataset.name,
    description: dataset.description,
    url: datasetUrl(dataset),
    sameAs: dataset.landingPage,
    version: dataset.version,
    license: dataset.license,
    creator: publisherSchema,
    publisher: publisherSchema,
    image: datasetImageSchema(dataset),
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
  <link rel="alternate" type="text/csv" href="${siteUrl}/catalog/research-catalog-v1.csv">
  <link rel="alternate" type="application/ld+json" href="${dcatUrl}">`,
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
      <div class="fact"><strong>${checksumCount}</strong><span>release checksums</span></div>
      <div class="fact"><strong>CC BY 4.0</strong><span>catalog license</span></div>
      <div class="fact"><strong>${archivedReleaseTag}</strong><span>independent SWH snapshot</span></div>
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
      <p>Canonical methods and limitations remain on <a href="${catalog.canonicalUrl}">FaceSwapAI Research</a>. Software Heritage independently preserves the verified <a href="${softwareHeritageUrl}">${archivedReleaseTag} snapshot</a>; a fresh visit is requested for later releases.</p>
    </section>
    <section class="citation-panel" id="citation" aria-labelledby="citation-heading">
      <h2 id="citation-heading">Citation</h2>
      <p class="citation-text">FaceSwapAI Editorial (2026). <em>FaceSwapAI Face Swap Research and Open Data Catalog</em> (Version ${escapeHtml(catalog.version)}). ${escapeHtml(catalog.canonicalUrl)}</p>
      <div class="actions">
        <a class="button" href="${siteUrl}/CITATION.cff">CITATION.cff</a>
        <a class="button" href="${siteUrl}/SHA256SUMS">SHA-256 checksums</a>
        <a class="button" href="${siteUrl}/datapackage.json">Data Package</a>
        <a class="button" href="${dcatUrl}">DCAT JSON-LD</a>
        <a class="button" href="${feedUrl}">Atom feed</a>
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
    mainEntityOfPage: datasetUrl(dataset),
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
    image: datasetImageSchema(dataset),
    creator: publisherSchema,
    publisher: publisherSchema,
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
  <meta name="DC.type" content="Dataset">
  <meta name="DC.rights" content="${escapeHtml(dataset.license)}">
  <link rel="alternate" type="${escapeHtml(dataset.encodingFormat)}" href="${mirrorUrl(dataset)}">`;

  return `${documentHead({
    title: `${dataset.name} | FaceSwapAI Open Research`,
    description,
    canonical,
    image: visual?.absolute || socialImage,
    imageAlt: visual?.alt || `${dataset.name} research record`,
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
      ${visual ? `<figure class="record-visual"><img src="${visual.src}" alt="${escapeHtml(visual.alt || `Published source or output associated with ${dataset.name}`)}" width="${visual.width}" height="${visual.height}" loading="lazy" decoding="async"><figcaption>${escapeHtml(visual.caption || 'Published evidence asset listed by this dataset record.')}</figcaption></figure>` : ''}
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
  {
    url: `${siteUrl}/`,
    lastmod: catalog.lastUpdated,
    images: [
      `${siteUrl}/assets/multi-face-mapping-output-v1.webp`,
      `${siteUrl}/assets/photo-pose-output-neutral-v1.avif`,
      `${siteUrl}/assets/video-continuity-output-poster-v1.webp`,
    ],
  },
  ...catalog.datasets.map((dataset) => ({
    url: datasetUrl(dataset),
    lastmod: dataset.dateModified,
    images: localVisuals[dataset.identifier]
      ? [`${siteUrl}/assets/${localVisuals[dataset.identifier].file}`]
      : [],
  })),
];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${sitemapUrls.map(({ url, lastmod, images }) => `  <url><loc>${url}</loc><lastmod>${lastmod}</lastmod>${images.map((image) => `<image:image><image:loc>${image}</image:loc></image:image>`).join('')}</url>`).join('\n')}
</urlset>\n`;
await writeFile(new URL('sitemap.xml', output), sitemap);
await writeFile(new URL('sitemap.txt', output), `${sitemapUrls.map(({ url }) => url).join('\n')}\n`);
await writeFile(new URL('robots.txt', output), `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\nSitemap: ${siteUrl}/sitemap.txt\n`);

const feed = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <id>${siteUrl}/</id>
  <title>${escapeHtml(catalog.name)}</title>
  <subtitle>${escapeHtml(catalog.description)}</subtitle>
  <updated>${catalog.lastUpdated}T00:00:00Z</updated>
  <link rel="self" type="application/atom+xml" href="${feedUrl}"/>
  <link rel="alternate" type="text/html" href="${siteUrl}/"/>
  <author><name>FaceSwapAI Editorial</name><uri>https://faceswapai.com/press#editorial-standards</uri></author>
  <rights>CC BY 4.0, subject to the archive rights and evidence notice.</rights>
${catalog.datasets.map((dataset) => `  <entry>
    <id>${datasetUrl(dataset)}#dataset</id>
    <title>${escapeHtml(dataset.name)}</title>
    <link rel="alternate" type="text/html" href="${datasetUrl(dataset)}"/>
    <link rel="enclosure" type="${escapeHtml(dataset.encodingFormat)}" href="${mirrorUrl(dataset)}"/>
    <published>${dataset.datePublished}T00:00:00Z</published>
    <updated>${dataset.dateModified}T00:00:00Z</updated>
    <summary>${escapeHtml(dataset.description)}</summary>
${dataset.keywords.map((keyword) => `    <category term="${escapeHtml(keyword)}"/>`).join('\n')}
  </entry>`).join('\n')}
</feed>\n`;
await writeFile(new URL('feed.xml', output), feed);

const dcatCatalog = {
  '@context': {
    dcat: 'http://www.w3.org/ns/dcat#',
    dct: 'http://purl.org/dc/terms/',
    foaf: 'http://xmlns.com/foaf/0.1/',
    xsd: 'http://www.w3.org/2001/XMLSchema#',
  },
  '@id': `${siteUrl}/#catalog`,
  '@type': 'dcat:Catalog',
  'dct:title': catalog.name,
  'dct:description': catalog.description,
  'dct:identifier': catalog.identifier,
  'dct:modified': { '@value': catalog.lastUpdated, '@type': 'xsd:date' },
  'dct:license': { '@id': catalog.license },
  'dct:publisher': {
    '@id': organizationId,
    '@type': 'foaf:Organization',
    'foaf:name': 'FaceSwapAI',
    'foaf:homepage': { '@id': 'https://faceswapai.com/' },
  },
  'dcat:landingPage': { '@id': `${siteUrl}/` },
  'dcat:dataset': catalog.datasets.map((dataset) => ({
    '@id': `${datasetUrl(dataset)}#dataset`,
    '@type': 'dcat:Dataset',
    'dct:title': dataset.name,
    'dct:description': dataset.description,
    'dct:identifier': dataset.identifier,
    'dct:issued': { '@value': dataset.datePublished, '@type': 'xsd:date' },
    'dct:modified': { '@value': dataset.dateModified, '@type': 'xsd:date' },
    'dct:license': { '@id': dataset.license },
    'dct:creator': { '@id': organizationId },
    'dcat:keyword': dataset.keywords,
    'dcat:landingPage': { '@id': datasetUrl(dataset) },
    'foaf:page': { '@id': dataset.landingPage },
    'dct:relation': dataset.isBasedOn.map((url) => ({ '@id': url })),
    'dcat:distribution': [
      {
        '@type': 'dcat:Distribution',
        'dct:title': 'GitHub Pages JSON mirror',
        'dct:format': dataset.encodingFormat,
        'dcat:accessURL': { '@id': datasetUrl(dataset) },
        'dcat:downloadURL': { '@id': mirrorUrl(dataset) },
      },
      {
        '@type': 'dcat:Distribution',
        'dct:title': 'Canonical FaceSwapAI JSON download',
        'dct:format': dataset.encodingFormat,
        'dcat:accessURL': { '@id': dataset.landingPage },
        'dcat:downloadURL': { '@id': dataset.download },
      },
    ],
  })),
};
await writeFile(new URL('catalog/research-catalog-dcat.jsonld', output), `${JSON.stringify(dcatCatalog, null, 2)}\n`);

const llms = `# FaceSwapAI Open Research Catalog

> Publisher-controlled mirror of versioned face swap datasets, bounded production studies, decision aids and citation metadata. This archive is not an independent review, certification or provider endorsement.

- Catalog: ${siteUrl}/
- Canonical publication: ${catalog.canonicalUrl}
- Catalog JSON: ${siteUrl}/catalog/research-catalog-v1.json
- DCAT JSON-LD: ${dcatUrl}
- Atom feed: ${feedUrl}
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

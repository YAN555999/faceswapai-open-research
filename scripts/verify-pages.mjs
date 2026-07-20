import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const site = new URL('../_site/', import.meta.url);
const siteUrl = 'https://yan555999.github.io/faceswapai-open-research';
const readSource = (path) => readFile(new URL(path, root));
const readSite = (path) => readFile(new URL(path, site));
const textSite = async (path) => String(await readSite(path));
const hash = (value) => createHash('sha256').update(value).digest('hex');

const catalog = JSON.parse(await readSource('catalog/research-catalog-v1.json'));
const index = await textSite('index.html');

assert.match(index, new RegExp(`<link rel="canonical" href="${siteUrl}/">`));
assert.doesNotMatch(index, /<link rel="canonical" href="https:\/\/faceswapai\.com/);
assert.match(index, /<script type="application\/ld\+json">/);
assert.match(index, /Publisher-controlled research mirror/);
assert.match(index, /data-catalog-search/);
assert.match(index, /<link rel="stylesheet" href="assets\/styles\.css">/);
assert.match(index, /<script src="assets\/catalog\.js" defer><\/script>/);
assert.match(index, /assets\/multi-face-mapping-output-v1\.webp/);
assert.doesNotMatch(index, /<img[^>]+src="https:\/\/faceswapai\.com\//);
assert.doesNotMatch(index, /noindex/i);

const schemaMatch = index.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
assert.ok(schemaMatch, 'Catalog JSON-LD is missing');
const catalogSchema = JSON.parse(schemaMatch[1]);
assert.equal(catalogSchema['@type'], 'DataCatalog');
assert.equal(catalogSchema.hasPart.length, catalog.datasetCount);

for (const dataset of catalog.datasets) {
  assert.match(index, new RegExp(dataset.identifier.replaceAll('.', '\\.')));
  const pagePath = `datasets/${dataset.identifier}/index.html`;
  const page = await textSite(pagePath);
  const canonical = `${siteUrl}/datasets/${dataset.identifier}/`;
  assert.ok(page.includes(`<link rel="canonical" href="${canonical}">`), `${dataset.identifier} has no self canonical`);
  assert.ok(page.includes(dataset.name), `${dataset.identifier} has no visible name`);
  assert.ok(page.includes(dataset.landingPage), `${dataset.identifier} has no canonical method link`);
  assert.ok(page.includes(dataset.measurementTechnique), `${dataset.identifier} has no evidence boundary`);
  assert.match(page, /<link rel="stylesheet" href="\.\.\/\.\.\/assets\/styles\.css">/);
  assert.doesNotMatch(page, /noindex/i);

  const pageSchemaMatch = page.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  assert.ok(pageSchemaMatch, `${dataset.identifier} has no JSON-LD`);
  const pageSchema = JSON.parse(pageSchemaMatch[1]);
  assert.equal(pageSchema['@type'], 'Dataset');
  assert.equal(pageSchema.identifier, dataset.identifier);
  assert.equal(pageSchema.distribution.length, 2);

  const file = new URL(dataset.download).pathname.split('/').at(-1);
  assert.equal(hash(await readSource(`data/${file}`)), hash(await readSite(`data/${file}`)), `${file} mirror changed bytes`);
}

const sitemap = await textSite('sitemap.xml');
assert.equal((sitemap.match(/<url>/g) || []).length, catalog.datasetCount + 1);
assert.ok(catalog.datasets.every((dataset) => sitemap.includes(`${siteUrl}/datasets/${dataset.identifier}/`)));

const robots = await textSite('robots.txt');
assert.match(robots, /User-agent: \*/);
assert.match(robots, new RegExp(`Sitemap: ${siteUrl}/sitemap\\.xml`));

const llms = await textSite('llms.txt');
assert.match(llms, /Publisher-controlled mirror/);
assert.ok(catalog.datasets.every((dataset) => llms.includes(dataset.name)));

for (const path of ['CITATION.cff', 'SHA256SUMS', 'datapackage.json', 'catalog/research-catalog-v1.json', 'catalog/research-catalog-v1.csv']) {
  assert.equal(hash(await readSource(path)), hash(await readSite(path)), `${path} mirror changed bytes`);
}

for (const asset of [
  'group-photo-reference-v1.webp',
  'multi-face-mapping-output-v1.webp',
  'photo-pose-output-neutral-v1.avif',
  'video-continuity-output-poster-v1.webp',
]) {
  assert.equal(hash(await readSource(`site/assets/${asset}`)), hash(await readSite(`assets/${asset}`)), `${asset} changed bytes`);
}

console.log(`Verified GitHub Pages catalog, ${catalog.datasets.length} Dataset pages and mirrored release files.`);

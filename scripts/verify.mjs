import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const readText = (path) => readFile(new URL(path, root), 'utf8');
const readJson = async (path) => JSON.parse(await readText(path));
const sha256 = (buffer) => createHash('sha256').update(buffer).digest('hex');

const checksumLines = (await readText('SHA256SUMS')).trim().split('\n');
assert.equal(checksumLines.length, 15, 'SHA256SUMS must cover the complete v1.4.0 release surface');
const checksumPaths = new Set();

for (const line of checksumLines) {
  const match = line.match(/^([a-f0-9]{64})  (.+)$/);
  assert.ok(match, `Invalid checksum line: ${line}`);
  const [, expected, path] = match;
  assert.ok(!checksumPaths.has(path), `Duplicate checksum path: ${path}`);
  checksumPaths.add(path);
  const actual = sha256(await readFile(new URL(path, root)));
  assert.equal(actual, expected, `Checksum mismatch: ${path}`);
}

const catalog = await readJson('catalog/research-catalog-v1.json');
assert.equal(catalog.version, '1.4.0');
assert.equal(catalog.datasetCount, 10);
assert.equal(catalog.datasets.length, 10);
assert.equal(catalog.canonicalUrl, 'https://faceswapai.com/research');

const manifest = await readJson('manifest-v1.4.0.json');
assert.equal(manifest.release, 'v1.4.0');
assert.equal(manifest.artifactCount, manifest.artifacts.length);
assert.equal(manifest.artifactCount, 12);

for (const artifact of manifest.artifacts) {
  const file = new URL(artifact.path, root);
  const buffer = await readFile(file);
  const metadata = await stat(file);
  assert.equal(metadata.size, artifact.bytes, `Byte count mismatch: ${artifact.path}`);
  assert.equal(sha256(buffer), artifact.sha256, `Manifest hash mismatch: ${artifact.path}`);
  assert.match(artifact.source, /^https:\/\/faceswapai\.com\//);
}

const dataPackage = await readJson('datapackage.json');
assert.equal(dataPackage.version, '1.4.0');
assert.equal(dataPackage.resources.length, 12);

for (const resource of dataPackage.resources) {
  const file = new URL(resource.path, root);
  const buffer = await readFile(file);
  const metadata = await stat(file);
  assert.equal(metadata.size, resource.bytes, `Data Package byte count mismatch: ${resource.path}`);
  assert.equal(`sha256:${sha256(buffer)}`, resource.hash, `Data Package hash mismatch: ${resource.path}`);
  assert.ok(checksumPaths.has(resource.path), `SHA256SUMS is missing Data Package resource: ${resource.path}`);
}

assert.ok(checksumPaths.has('CITATION.cff'));
assert.ok(checksumPaths.has('datapackage.json'));
assert.ok(checksumPaths.has('manifest-v1.4.0.json'));

const expectedIdentifiers = new Set([
  'faceswapai-independent-multi-face-mapping-v1.0.0',
  'faceswapai-ai-face-swap-public-claims-v1.0.0',
  'faceswapai-face-swap-privacy-checklist-v1.0.0',
  'faceswapai-face-swap-evaluation-metric-crosswalk-v1.0.0',
  'faceswapai-photo-pose-study-v1.0.0',
  'faceswapai-readiness-benchmark-v1.0.0',
  'faceswapai-input-degradation-study-v1.0.0',
  'faceswapai-group-face-size-detection-study-v1.0.0',
  'faceswapai-video-continuity-study-v1.0.0',
  'faceswapai-api-contract-conformance-matrix-v1.0.0',
]);

for (const dataset of catalog.datasets) {
  assert.ok(expectedIdentifiers.delete(dataset.identifier), `Unexpected dataset identifier: ${dataset.identifier}`);
  assert.equal(dataset.version, '1.0.0');
  assert.equal(dataset.license, 'https://creativecommons.org/licenses/by/4.0/');
  assert.equal(dataset.isAccessibleForFree, true);
  assert.match(dataset.landingPage, /^https:\/\/faceswapai\.com\/resources\//);
  assert.match(dataset.download, /^https:\/\/faceswapai\.com\//);
  assert.ok(Array.isArray(dataset.variables) && dataset.variables.length > 0);
  assert.ok(Array.isArray(dataset.isBasedOn) && dataset.isBasedOn.length > 0);
}
assert.equal(expectedIdentifiers.size, 0, 'Catalog is missing expected dataset identifiers');

const metricCrosswalk = await readJson('data/face-swap-evaluation-metrics-v1.json');
assert.equal(metricCrosswalk.scope.metricCount, 9);
assert.equal(metricCrosswalk.metrics.length, 9);
assert.equal(metricCrosswalk.scope.providerLeaderboard, false);
assert.equal(metricCrosswalk.scope.faceSwapAIProductionScoresPublished, false);
assert.equal(metricCrosswalk.scope.generatedMediaIncluded, false);
assert.equal(metricCrosswalk.metrics.at(-1).id, 'detector-performance');
assert.match(metricCrosswalk.metrics.at(-1).doesNotAnswer, /Perceptual realism, identity fidelity/i);

const apiConformance = await readJson('data/face-swap-api-conformance-v1.json');
assert.equal(apiConformance.scope.protocolCheckCount, 15);
assert.equal(apiConformance.scope.passCount, 8);
assert.equal(apiConformance.scope.partialCount, 4);
assert.equal(apiConformance.scope.notExecutedCount, 3);
assert.equal(apiConformance.checks.length, 15);
assert.equal(apiConformance.checks.filter(({ status }) => status === 'pass').length, 8);
assert.equal(apiConformance.checks.filter(({ status }) => status === 'partial').length, 4);
assert.equal(apiConformance.checks.filter(({ status }) => status === 'not-executed').length, 3);
assert.equal(apiConformance.scope.independentAudit, false);
assert.equal(apiConformance.scope.paidUpstreamGenerationInvoked, false);
assert.equal(apiConformance.contractSnapshot.responseBodySha256, '8549ff47fd7669829deb203527368d0b9bc15fadc475b2aa80e96824c5206c89');
assert.equal(apiConformance.productionSmoke.result, 'pass');
assert.equal(apiConformance.productionSmoke.cleanupCompleted, true);

const citation = await readText('CITATION.cff');
assert.match(citation, /^cff-version: 1\.2\.0/m);
assert.match(citation, /^type: dataset$/m);
assert.match(citation, /^repository-code: "https:\/\/github\.com\/YAN555999\/faceswapai-open-research"$/m);
assert.match(citation, /^version: "1\.4\.0"$/m);
assert.match(citation, /Software Heritage snapshot containing release v1\.3\.0/);

console.log(`Verified ${catalog.datasets.length} datasets, ${manifest.artifacts.length} release artifacts and ${checksumLines.length} checksums.`);

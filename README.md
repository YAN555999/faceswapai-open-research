# FaceSwapAI open research and data catalog

[![Verify research archive](https://github.com/YAN555999/faceswapai-open-research/actions/workflows/verify.yml/badge.svg)](https://github.com/YAN555999/faceswapai-open-research/actions/workflows/verify.yml)

This repository is the public, version-pinned mirror of the FaceSwapAI research
and open-data catalog. The canonical human-readable publication remains on
FaceSwapAI; this mirror provides stable files, checksums, citation metadata and
a public correction history.

- Canonical catalog: <https://faceswapai.com/research>
- Browsable archive: <https://yan555999.github.io/faceswapai-open-research/>
- DCAT JSON-LD: <https://yan555999.github.io/faceswapai-open-research/catalog/research-catalog-dcat.jsonld>
- Atom updates: <https://yan555999.github.io/faceswapai-open-research/feed.xml>
- Public workflow examples and output evaluation checklist: <https://faceswapai.com/face-swap-examples>
- Machine-readable catalog: <https://faceswapai.com/research-catalog-v1.json>
- Editorial and correction standard: <https://faceswapai.com/press#editorial-standards>
- Versioned release: <https://github.com/YAN555999/faceswapai-open-research/releases/tag/v1.4.0>
- Latest independently preserved release: `v1.3.0` at <https://archive.softwareheritage.org/swh:1:snp:d2b86adb1ed3236cc2bf9caac70b4079bbbfdbdc>
- License: [CC BY 4.0](LICENSE), subject to the boundaries in [NOTICE.md](NOTICE.md)

## Included datasets

| Dataset | Evidence boundary | Canonical record | Mirror |
| --- | --- | --- | --- |
| Independent Multi-Face Mapping Production Study v1 | One dated production run on one purpose-built synthetic four-adult image | [Method and limitations](https://faceswapai.com/resources/how-to-map-different-faces-in-a-group-photo) | [`data/independent-multi-face-mapping-study-v1.json`](data/independent-multi-face-mapping-study-v1.json) |
| AI Face Swap Vendor-Published Claims Snapshot v1 | Normalized statements observed on seven official product pages; not an output-quality test | [Sources and field definitions](https://faceswapai.com/resources/how-to-compare-ai-face-swap-tools) | [`data/ai-face-swap-public-claims-v1.json`](data/ai-face-swap-public-claims-v1.json) |
| Face Swap Privacy and Consent Decision Matrix v1 | Editorial decision aid based on current product facts and selected official guidance; not legal advice or a security or training-use audit | [Sources, questions and limitations](https://faceswapai.com/resources/face-swap-safety-and-consent) | [`data/face-swap-privacy-checklist-v1.json`](data/face-swap-privacy-checklist-v1.json) |
| Face Swap Evaluation Metric Crosswalk v1 | Nine primary-source measurement families with directions, evidence requirements and interpretation limits; not provider scores or a leaderboard | [Metric definitions and review protocol](https://faceswapai.com/resources/how-to-evaluate-face-swap-quality) | [`data/face-swap-evaluation-metrics-v1.json`](data/face-swap-evaluation-metrics-v1.json) |
| FaceSwapAI API Contract Conformance Matrix v1 | One dated first-party OpenAPI inspection and isolated production smoke run with pass, partial and not-executed states; not an independent audit, certification, SLA or load test | [15-check protocol and evidence boundaries](https://faceswapai.com/resources/how-to-evaluate-a-face-swap-api) | [`data/face-swap-api-conformance-v1.json`](data/face-swap-api-conformance-v1.json) |
| Controlled Production Photo Face-Swap Pose Study | Four paid production image tasks using one synthetic source and four synthetic target states | [Method, exact outputs and limitations](https://faceswapai.com/resources/photo-face-swap-pose-study) | [`data/photo-pose-study-v1.json`](data/photo-pose-study-v1.json) |
| Public Reference Frame Readiness Benchmark | Public reference-frame audit using the published Readiness Score method | [Method and sample boundary](https://faceswapai.com/resources/face-swap-input-readiness-benchmark) | [`data/readiness-benchmark-v1.json`](data/readiness-benchmark-v1.json) |
| Controlled Face-Swap Input Degradation Study | Single-variable image degradations measured with the public score and production detector | [Design and limitations](https://faceswapai.com/resources/face-swap-input-degradation-study) | [`data/input-degradation-study-v1.json`](data/input-degradation-study-v1.json) |
| Controlled Group Photo Face-Size Detection Study | Native-width resize series measuring detector returns, not output realism | [Design and results](https://faceswapai.com/resources/group-photo-face-size-detection-study) | [`data/group-face-size-study-v1.json`](data/group-face-size-study-v1.json) |
| Controlled Production Video Face-Swap Study | Matched-frame observations from one complete 10-second production run | [Method and limits](https://faceswapai.com/resources/video-face-swap-continuity-study) | [`data/video-continuity-study-v1.json`](data/video-continuity-study-v1.json) |

The catalog is available as [JSON](catalog/research-catalog-v1.json) and
[CSV](catalog/research-catalog-v1.csv). [`datapackage.json`](datapackage.json)
provides a machine-readable inventory of the mirrored resources.

The [browsable archive](https://yan555999.github.io/faceswapai-open-research/)
publishes a self-contained record for every dataset, Dataset JSON-LD, mirrored
downloads, image-aware XML and text sitemaps, a DCAT catalog, an Atom feed and
citation metadata. It is a publisher-controlled mirror, not an independent
review or endorsement.

## Integrity and release policy

[`SHA256SUMS`](SHA256SUMS) binds the catalog, datasets, citation file, data
package and release manifest to exact bytes. Run the same deterministic checks
used by GitHub Actions:

```bash
npm test
```

Published tags and release attachments are immutable. A factual correction or
method change receives a new version, new checksums and a documented release;
previous releases are not silently rewritten.

## Interpretation limits

- This is not a face-recognition training corpus, benchmark leaderboard or provider endorsement.
- Input-readiness and detector studies do not grade generated-face realism or identity similarity.
- The vendor-claims file records dated first-party statements and does not independently verify those claims.
- The privacy matrix is an editorial decision aid, not legal advice, a certification, an independent security audit or a provider training-use audit.
- The API conformance matrix is a bounded first-party observation, not an independent audit, security assessment, certification, SLA, load test or all-format completion claim.
- The production image and video studies report bounded observations, not universal success rates.
- No customer uploads, private identity embeddings or private account data are included.

Read each canonical record's method, source boundary and limitations before
using a result outside its stated scope.

## Citation

Use the repository's [`CITATION.cff`](CITATION.cff) metadata or cite:

> FaceSwapAI Editorial (2026). *FaceSwapAI Face Swap Research and Open Data Catalog* (Version 1.4.0). <https://faceswapai.com/research>

When using one dataset, cite its canonical landing page, identifier and version.
Preserve the artifact SHA-256 when exact reproduction matters.

## Independent preservation

Software Heritage independently archived the repository state containing the
immutable `v1.3.0` tag on 2026-07-20. Its persistent snapshot identifier is
[`swh:1:snp:d2b86adb1ed3236cc2bf9caac70b4079bbbfdbdc`](https://archive.softwareheritage.org/swh:1:snp:d2b86adb1ed3236cc2bf9caac70b4079bbbfdbdc).
A GitHub push webhook requests a fresh Software Heritage visit after subsequent
repository updates.

The SWHID preserves repository history independently. The release manifest and
`SHA256SUMS` remain the exact integrity records for downloadable release artifacts.
The immutable `v1.4.0` citation attachment records the previously verified
`v1.3.0` SWHID because a fresh snapshot can only be created after the new tag is published.

## Corrections and reuse

Open a [data-correction issue](https://github.com/YAN555999/faceswapai-open-research/issues/new?template=data-correction.yml)
with the affected file, field, evidence URL and proposed correction. See
[`CONTRIBUTING.md`](CONTRIBUTING.md) for the review and versioning policy.

Attribution should name **FaceSwapAI Editorial**, identify the dataset and
version, and link its canonical record. Third-party names, pages and source
media remain subject to their respective owners' rights; see
[`NOTICE.md`](NOTICE.md).

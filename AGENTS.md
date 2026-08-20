# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A collection of Helm charts, published as a GitHub Pages Helm repository, with a Docusaurus docs site. Three pieces that share one repo:

- **`charts/`** — the Helm charts (the product).
- **`web/`** — Docusaurus site that both renders the chart docs and hosts the packaged `.tgz` chart repo under `web/static/charts/`.
- **`.github/workflows/`** — CI (validate on PR, build+publish on push to `main`).

Published Helm repo URL: `https://rishang.github.io/helm-chart/charts`. Docs: `https://rishang.github.io/helm-chart/`.

## Commands

All tasks run via [Task](https://taskfile.dev) (`Taskfile.yaml`). `helm`, `pnpm`, and the `helm-unittest` plugin are the tooling.

```bash
task helm-validate               # lint + `helm template` every chart
task helm-validate -- loki-stack # ...just one chart (basename arg)
task helm-unittest               # run helm-unittest suites (skips charts with no tests/)
task helm-unittest -- component-chart
task helm-package-index          # package charts + build/merge repo index.yaml (what CI publishes)
task docs                        # docusaurus dev server (web/)
task docs:build                  # production docs build
```

To run a single unit test file: `cd charts/component-chart && helm unittest -f 'tests/deployment_test.yaml' .`

## Architecture notes

### component-chart (the non-trivial one)
A general-purpose workload chart (DevSpace-derived) where a release is described entirely by the `containers:` list plus siblings in `values.yaml` — no per-workload subcharts. The workload **kind is inferred**, not configured:

- `templates/deployment.yaml`: emits a **StatefulSet** if any container has a writable `volumeMount` backed by a real PVC volume (i.e. a `volumes[]` entry that is *not* secret/configMap/emptyDir/hostPath); otherwise a **Deployment**. StatefulSets also get an auto-generated headless service and `volumeClaimTemplates`.
- `templates/job.yaml`: active only when `job:` is set — **CronJob** if `job.schedule` is non-empty, else **Job**. `deployment.yaml` is skipped whenever `job` is set.
- Pod spec is shared via the `component.podTemplate` helper in `templates/_podtemplate.yaml`.

When touching kind-detection or volume logic, the `tests/` suites (with fixtures in `tests/values/`) are the guardrail — run `task helm-unittest -- component-chart`.

### loki-stack & grafana-observability-stack
Umbrella charts wrapping upstream deps (loki, alloy, kube-prometheus-stack, rustfs, tempo, thanos) gated by `<dep>.enabled` conditions in `Chart.yaml`. Their `values.yaml` is namespaced by subchart name (`loki:`, `alloy:`, `rustfs:`, …). rustfs is the S3-compatible object store for Loki. Requires `helm dependency update` before templating.

**Publishing caveat:** `helm-package-index` only packages `component-chart` and `loki-stack` — the loop in `Taskfile.yaml` hardcodes those two. `grafana-observability-stack` is **not** published; add it to that loop if it should be.

### Docs are colocated with charts
Each chart owns its docs under `charts/<chart>/docs/pages/` (`.mdx`). `web/docusaurus.config.js` mounts each chart's docs as a separate `plugin-content-docs` instance pointing back at `../charts/<chart>/docs/pages`, with a matching sidebar in `web/sidebars/`. **Adding a chart to the docs site = add a new plugin instance + sidebar + search `docsDir` entry**, not moving files into `web/`.

### CI flow
- `validate.yaml` (PR to `main`/`dev`): `task helm-validate` then `task helm-unittest`.
- `web.yaml` (push to `main` touching `web/`, `charts/`, or the workflow): runs `task helm-package-index` then `pnpm build`, deploys `web/build` to GitHub Pages. `helm-package-index` fetches the currently-published `index.yaml`, restores prior `.tgz`es, then merges new packages in — so old chart versions stay available across releases.

## Conventions
- Bump the chart `version:` in `Chart.yaml` when changing a chart — the published repo keeps every version, so an unbumped change won't republish cleanly.
- Note the two directory names in component-chart: `tests/` = helm-unittest suites; `test/` = a manual scratch values file. Don't confuse them.

#!/usr/bin/env bash
# Deploy component-chart scenarios to a real cluster (k3s in CI) and assert the
# chart's kind-inference actually produces working workloads. Complements the
# helm-unittest suites, which only template.
#
# Needs: kubectl + helm pointed at a cluster (KUBECONFIG). Run via `task helm-e2e`.
set -euo pipefail

CHART_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
E2E_DIR="$CHART_DIR/test/e2e"
NS="ct-e2e"

# scenario file | release | expected kind | readiness check (rollout|job|exists)
scenarios=(
  "deployment.yaml|web|Deployment|rollout"
  "statefulset.yaml|store|StatefulSet|rollout"
  "job.yaml|worker|Job|job"
  "cronjob.yaml|tick|CronJob|exists"
)

fail=0

diagnostics() {
  echo "::group::diagnostics ($NS)"
  kubectl get all,pvc -n "$NS" -o wide || true
  kubectl describe pods -n "$NS" || true
  echo "::endgroup::"
}

kubectl create namespace "$NS" --dry-run=client -o yaml | kubectl apply -f -

for scenario in "${scenarios[@]}"; do
  IFS='|' read -r file release kind check <<<"$scenario"
  echo "=== scenario: $file -> expect $kind ==="

  if ! helm install "$release" "$CHART_DIR" -n "$NS" \
      -f "$E2E_DIR/$file" --wait --timeout 3m; then
    echo "❌ $file: helm install failed"
    diagnostics
    helm uninstall "$release" -n "$NS" --wait 2>/dev/null || true
    fail=1
    continue
  fi

  # Kind-inference assertion: the expected workload must exist, named after the release.
  if ! kubectl get "$kind" "$release" -n "$NS" >/dev/null 2>&1; then
    echo "❌ $file: expected $kind/$release not found (wrong kind inferred)"
    diagnostics
    fail=1
  else
    case "$check" in
      rollout) kubectl rollout status "$kind/$release" -n "$NS" --timeout=2m \
                 && echo "✅ $file: $kind rolled out" || { echo "❌ $file: rollout failed"; diagnostics; fail=1; } ;;
      job)     kubectl wait --for=condition=complete "job/$release" -n "$NS" --timeout=2m \
                 && echo "✅ $file: Job completed" || { echo "❌ $file: job did not complete"; diagnostics; fail=1; } ;;
      exists)  echo "✅ $file: $kind created" ;;
    esac
  fi

  helm uninstall "$release" -n "$NS" --wait 2>/dev/null || true
done

kubectl delete namespace "$NS" --wait=false 2>/dev/null || true

if [ "$fail" -ne 0 ]; then
  echo "e2e: one or more scenarios failed"
  exit 1
fi
echo "e2e: all scenarios passed"

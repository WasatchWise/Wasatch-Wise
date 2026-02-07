#!/usr/bin/env bash
# Deploy WasatchWise projects via Vercel CLI
# Run from repo root: ./scripts/deploy.sh [dashboard|abya|all]

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

deploy_dashboard() {
  echo "Deploying dashboard (wasatchwise)..."
  vercel deploy --prod --yes --archive=tgz
}

deploy_abya() {
  echo "Deploying Ask Before You App..."
  cd apps/ask-before-you-app
  vercel deploy --prod --yes --archive=tgz
  cd "$PROJECT_ROOT"
}

case "${1:-all}" in
  dashboard)
    deploy_dashboard
    ;;
  abya)
    deploy_abya
    ;;
  all)
    deploy_dashboard
    deploy_abya
    ;;
  *)
    echo "Usage: $0 [dashboard|abya|all]"
    echo "  dashboard - Deploy wasatchwise (dashboard) project"
    echo "  abya      - Deploy ask-before-you-app (askbeforeyouapp.com)"
    echo "  all       - Deploy both (default)"
    exit 1
    ;;
esac

echo "Done."

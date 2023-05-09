#!/bin/bash

export VERSION=$(cat testflight-version/version)

pushd galoy-deployments

gh pr close ${BRANCH_NAME} || true
gh pr create \
  --title "chore: update backend config for mobile v$VERSION" \
  --body "" \
  --base main \
  --head ${BRANCH_NAME} \
  --label galoybot \
  --reviewer GaloyMoney/galoy-mobile-devs || true

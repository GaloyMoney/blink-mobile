#!/bin/bash

set -eu

# GENERATE CHANGELOG

pushd repo
  export prev_ref=$(git rev-list -n 1 $(cat ../artifacts/older-testflight-version))
  export new_ref=$(git rev-parse HEAD)

   git cliff --config ../pipeline-tasks/ci/config/vendor/git-cliff.toml $prev_ref..$new_ref > ../artifacts/gh-release-notes.md
popd

echo "CHANGELOG:"
echo "-------------------------------"
cat artifacts/gh-release-notes.md
echo "-------------------------------"

# ARTIFACTS

cat testflight-version/version > artifacts/gh-release-tag
echo "v$(cat testflight-version/version) Prerelease" > artifacts/gh-release-name

echo -n "Testflight Version: "
cat artifacts/gh-release-tag

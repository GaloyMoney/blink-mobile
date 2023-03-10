#!/bin/bash

set -eu

. pipeline-tasks/ci/tasks/helpers.sh

new_ref=$(cat ./beta-version/version)

pushd deployments
  __get_custom_release_notes beta $new_ref merged > ../gh-release-notes
  old_ref=$(get_old_ref_from_merged beta $new_ref)
popd

pushd repo
  git cliff --config ../pipeline-tasks/ci/config/vendor/git-cliff.toml $old_ref..$new_ref >> ../gh-release-notes
  gh release edit --latest --prerelease=false -t "v$new_ref Release" --notes-file ../gh-release-notes $new_ref
popd


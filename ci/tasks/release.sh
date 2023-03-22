#!/bin/bash

set -eu

. pipeline-tasks/ci/tasks/helpers.sh

new_ref=$(cat ./beta-version/version)

pushd deployments
  __get_custom_release_notes beta $new_ref merged > ../artifacts/gh-release-notes.md
  old_ref=$(get_old_ref_from_merged beta $new_ref)
popd

pushd repo
  git cliff --config ../pipeline-tasks/ci/config/vendor/git-cliff.toml $old_ref..$new_ref >> ../artifacts/gh-release-notes.md
popd

activate_gcloud_service_account

mkdir -p artifacts/files
pushd artifacts/files
gsutil ls gs://galoy-build-artifacts/galoy-mobile/** | grep $new_ref | grep -e "\.apk" -e "\.ipa" | while IFS="" read -r item || [ -n "$item" ];
do
  echo $item
  gsutil cp "$item" .
done
popd

echo "beta-$new_ref" > artifacts/gh-release-tag
echo "v$new_ref Release" > artifacts/gh-release-name

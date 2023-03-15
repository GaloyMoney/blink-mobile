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

activate_gcloud_service_account

mkdir artifacts
pushd artifacts
gsutil ls gs://galoy-build-artifacts/galoy-mobile/** | grep $new_ref | grep -e "\.apk" -e "\.ipa" | while IFS="" read -r item || [ -n "$item" ];
do
  echo $item
  gsutil cp "$item" .
done
popd

pushd repo
  gh release upload $new_ref ../artifacts/app-arm64-v8a-release.apk --clobber
  gh release upload $new_ref ../artifacts/app-armeabi-v7a-release.apk --clobber
  gh release upload $new_ref ../artifacts/app-universal-release.apk --clobber
  gh release upload $new_ref ../artifacts/app-x86-release.apk --clobber
  gh release upload $new_ref ../artifacts/app-x86_64-release.apk --clobber
  gh release upload $new_ref "../artifacts/Bitcoin Beach.ipa" --clobber
popd

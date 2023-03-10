#!/bin/bash

# Supply: https://docs.fastlane.tools/actions/upload_to_play_store/

set -eu

. pipeline-tasks/ci/tasks/helpers.sh

export VERSION=$(cat ./version/version)
export VERSION_CODE=$(cat ./build-number-android/android-builds/$VERSION)

echo "Version: $VERSION"
echo "Version Code: $VERSION_CODE"

pushd deployments
export CHANGELOG="$(get_changelog_from_merged_pr $to $VERSION)"
popd

pushd repo/android

echo $ANDROID_SERVICE_ACCOUNT_UPLOAD > galoyapp-2e25e160d4ba.json

bundle install
bundle exec fastlane promote_to_${to}

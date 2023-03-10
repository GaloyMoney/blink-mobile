#!/bin/bash

# Testflight: https://docs.fastlane.tools/actions/testflight/
# Release/Deliver: https://docs.fastlane.tools/actions/upload_to_app_store/

set -eu

. pipeline-tasks/ci/tasks/helpers.sh

export VERSION=$(cat ./version/version)
export VERSION_CODE=$(cat ./build-number-ios/ios-builds/$VERSION)

echo "Version: $VERSION"
echo "Version Code: $VERSION_CODE"

pushd deployments
export CHANGELOG="$(get_changelog_from_merged_pr $to $VERSION)"
popd

pushd repo/ios

bundle install
bundle exec fastlane promote_to_${to}

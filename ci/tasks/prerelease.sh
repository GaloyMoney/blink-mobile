#!/bin/bash

set -eu

. pipeline-tasks/ci/tasks/helpers.sh

# PICK COMMIT TO PRERELEASE

[[ "$(cat ./built-dev-apk/url)" =~ dev/android/galoy-mobile-.+-v(.+)/apk ]]
APK_COMMIT=${BASH_REMATCH[1]}

[[ "$(cat ./built-dev-ipa/url)" =~ dev/ios/galoy-mobile-.+-v(.+)/Bitcoin ]]
IPA_COMMIT=${BASH_REMATCH[1]}

if [[ $APK_COMMIT != $IPA_COMMIT ]]; then
  echo "Both APK and IPA are not from same commit!"
  exit 1
fi

pushd repo

git checkout $IPA_COMMIT

CHOSEN_COMMITID=$(git rev-parse --short HEAD)
echo "Using Commit: $CHOSEN_COMMITID"

# MOVE ASSETS OF THE PRERELEASE BUILD TO RELEASE ARTIFACTS FOLDERS

mkdir -p ../artifacts/files
activate_gcloud_service_account

export URL=$(cat ../built-dev-apk/url)
download_build_apk
mv android/app/build/outputs/apk/release/*.apk ../artifacts/files

export URL=$(cat ../built-dev-ipa/url)
download_build_ipa
mv ios/*.ipa ../artifacts/files

popd

# MAKE CORRECT VERSION

export BETA_VERSION=$(cat beta-version/version)
export TESTFLIGHT_VERSION=$(cat testflight-version/version)

pushd repo
  git cliff --config ../pipeline-tasks/ci/config/vendor/git-cliff.toml $BETA_VERSION..HEAD > ../beta-to-now-changelog
popd

if [[ $(cat beta-to-now-changelog | grep breaking) != '' ]]; then
  bump2version minor --current-version $(cat beta-version/version) --allow-dirty beta-version/version
else
  bump2version patch --current-version $(cat beta-version/version) --allow-dirty beta-version/version
fi

NEW_VERSION=$(cat beta-version/version)

if [[ $(version_part $TESTFLIGHT_VERSION) != $NEW_VERSION ]]; then
  echo ""
  # MIGRATION: UNCOMMENT WHEN BETA IS BEING RELEASED
  # echo $NEW_VERSION > testflight-version/version
fi

VERSION=$(cat testflight-version/version)
bump_rc $VERSION > testflight-version/version

echo -n "Releasing with base version: "
cat testflight-version/version

# GENERATE CHANGELOG

pushd repo
  export new_ref=$(git rev-parse HEAD)

   git cliff --config ../pipeline-tasks/ci/config/vendor/git-cliff.toml $TESTFLIGHT_VERSION..$new_ref > ../artifacts/gh-release-notes.md
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

version_part $(cat testflight-version/version) > artifacts/new-version

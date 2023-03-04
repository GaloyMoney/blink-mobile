#!/bin/bash

set -eu

[[ "$(cat ./built-dev-apk/url)" =~ dev/android/galoy-mobile-.+-v(.+)/apk ]]
APK_COMMIT=${BASH_REMATCH[1]}

[[ "$(cat ./built-dev-ipa/url)" =~ dev/ios/galoy-mobile-.+-v(.+)/Bitcoin ]]
IPA_COMMIT=${BASH_REMATCH[1]}

if [[ $APK_COMMIT == $IPA_COMMIT ]]; then
  echo "Both APK and IPA are from same commit, no comparison necessary"
fi

pushd repo

APK_TIMESTAMP=$(git show -s --format=%ct $APK_COMMIT)
IPA_TIMESTAMP=$(git show -s --format=%ct $IPA_COMMIT)

if [[ $APK_TIMESTAMP > $IPA_TIMESTAMP ]]; then
  echo "APK at a greater timestamp than IPA, picking APK commit to prerelease"
  git checkout $APK_COMMIT
elif [[ $APK_TIMESTAMP < $IPA_TIMESTAMP ]]; then
  echo "IPA at a greater timestamp than APK, picking IPA commit to prerelease"
  git checkout $IPA_COMMIT
else
  git checkout $IPA_COMMIT
fi

CHOSEN_COMMITID=$(git rev-parse --short HEAD)
echo "Chosen CommitID: $CHOSEN_COMMITID"

popd

mv built-dev-apk/app-universal-release.apk built-dev-apk/BitcoinBeach-pre-$CHOSEN_COMMITID.apk
mv built-dev-ipa/Bitcoin\ Beach.ipa built-dev-ipa/BitcoinBeach-pre-$CHOSEN_COMMITID.ipa

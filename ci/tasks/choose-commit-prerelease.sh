#!/bin/bash

set -eu

APK_COMMIT=$(cat ./built-dev-apk/version)
IPA_COMMIT=$(cat ./built-dev-ipa/version)

if [[ $APK_COMMIT == $IPA_COMMIT ]]; then
  echo "Both APK and IPA are from same commit, no comparison necessary"
fi

pushd repo

APK_TIMESTAMP=$(git show -s --format=%ct $APK_COMMIT)
IPA_TIMESTAMP=$(git show -s --format=%ct $IPA_COMMIT)

if [[ $APK_TIMESTAMP > $IPA_TIMESTAMP ]]; then
  echo "APK at a greater timestamp than IPA, picking APK commit to prerelease"
  git checkout $APK_COMMIT
else
  echo "IPA at a greater timestamp than APK, picking IPA commit to prerelease"
  git checkout $IPA_COMMIT
fi

CHOSEN_COMMITID=$(git rev-parse --short HEAD)
echo "Chosen CommitID: $CHOSEN_COMMITID"

popd

mv built-dev-apk/app-universal-release.apk built-dev-apk/BitcoinBeach-pre-$CHOSEN_COMMITID.apk
mv built-dev-ipa/Bitcoin\ Beach.ipa built-dev-ipa/BitcoinBeach-pre-$CHOSEN_COMMITID.ipa

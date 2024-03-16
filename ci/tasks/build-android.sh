#!/bin/zsh

set -eu
export PATH=$(cat /Users/m1/concourse/path)

export BUILD_NUMBER=$(cat build-number-android/android)
export PUBLIC_VERSION=$(cat $VERSION_FILE)

GIT_REF=$(cat repo/.git/ref)

pushd repo
git checkout $GIT_REF

nix develop -c yarn install

echo $ANDROID_KEYSTORE | base64 -d > android/app/release.keystore

pushd android
sed -i'' -e "s/versionCode .*$/versionCode $BUILD_NUMBER/g" app/build.gradle
nix develop -c fastlane android build
popd
popd

mkdir -p artifacts/android/app/build/outputs
cp -r repo/android/app/build/outputs/* artifacts/android/app/build/outputs

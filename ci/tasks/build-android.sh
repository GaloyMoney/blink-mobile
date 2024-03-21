#!/bin/zsh

set -eu
export PATH=$(cat /Users/m1/concourse/path)

export BUILD_NUMBER=$(cat build-number-android/android)
export PUBLIC_VERSION=$(cat $VERSION_FILE)

GIT_REF=$(cat repo/.git/ref)

pushd repo
git checkout $GIT_REF

sed -i'' -e "s/versionCode .*$/versionCode $BUILD_NUMBER/g" android/app/build.gradle
nix develop -c sh -c 'cd android && bundle exec fastlane android build --verbose'

lsof -ti:8080,8081 | xargs kill -9 || true
popd

mkdir -p artifacts/android/app/build/outputs
cp -r repo/android/app/build/outputs/* artifacts/android/app/build/outputs

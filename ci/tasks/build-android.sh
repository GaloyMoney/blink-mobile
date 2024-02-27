#!/bin/zsh

set -eu

export BUILD_NUMBER=$(cat build-number-android/android)
export PUBLIC_VERSION=$(cat $VERSION_FILE)

GIT_REF=$(cat repo/.git/ref)

source "$HOME/.rvm/scripts/rvm"
rvm use $(cat repo/.ruby-version)

pushd repo
git checkout $GIT_REF

yarn global add node-gyp
yarn install

echo $ANDROID_KEYSTORE | base64 -d > android/app/release.keystore

pushd android
bundle install
sed -i'' -e "s/versionCode .*$/versionCode $BUILD_NUMBER/g" app/build.gradle
bundle exec fastlane android build
popd
popd

mkdir -p artifacts/android/app/build/outputs
cp -r repo/android/app/build/outputs/* artifacts/android/app/build/outputs

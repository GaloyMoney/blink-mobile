#!/bin/bash

set -eu

. pipeline-tasks/ci/tasks/helpers.sh

export VERSION=$(cat testflight-version/version)

pushd build-number-android
export ANDROID_BUILD_NO=$(cat android-builds/$VERSION)
popd

pushd build-number-ios
export IOS_BUILD_NO=$(cat ios-builds/$VERSION)
popd

pushd galoy-deployments

sed -i "s/^android_last_build_number.*=.*/android_last_build_number = $ANDROID_BUILD_NO/" modules/galoy/build-numbers.auto.tfvars
sed -i "s/^ios_last_build_number.*=.*/ios_last_build_number = $IOS_BUILD_NO/" modules/galoy/build-numbers.auto.tfvars

make fmt

git checkout -b $BRANCH_NAME
git add modules/galoy/build-numbers.auto.tfvars
git commit -m "chore: update build numbers for mobile v$VERSION"

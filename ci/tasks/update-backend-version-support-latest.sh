#!/bin/bash

set -eu

export VERSION=$(cat testflight-version/version)

pushd galoy-mobile-build-nos
export ANDROID_BUILD_NO=$(cat android-builds/$VERSION)
export IOS_BUILD_NO=$(cat ios-builds/$VERSION)
popd

pushd galoy-deployments

sed -i "s/^android_last_build_number =.*/android_last_build_number = $ANDROID_BUILD_NO/" modules/galoy/build-numbers.auto.tfvars
sed -i "s/^ios_last_build_number =.*/ios_last_build_number = $IOS_BUILD_NO/" modules/galoy/build-numbers.auto.tfvars

make fmt

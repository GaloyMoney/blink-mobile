#!/bin/bash

set -eu

pushd deployments

OLD_COMMIT=$(git rev-list -n 1 --before='6 months ago' HEAD)

if [ -z "$OLD_COMMIT" ]; then
  echo "There is no commit that is 6 months old or older."
  exit 0
else
  echo "There is a commit that is 6 months old or older."
  echo "Commit ID: $OLD_COMMIT"
fi

git checkout $OLD_COMMIT
export VERSION=$(cat testflight-version)

popd

echo $VERSION > testflight-version/version

pushd build-number-android
export ANDROID_BUILD_NO=$(cat android-builds/$VERSION)
popd

pushd build-number-ios
export IOS_BUILD_NO=$(cat ios-builds/$VERSION)
popd

pushd galoy-deployments

sed -i "s/^android_min_build_number.*=.*/android_min_build_number = $ANDROID_BUILD_NO/" modules/galoy/build-numbers.auto.tfvars
sed -i "s/^ios_min_build_number.*=.*/ios_min_build_number = $IOS_BUILD_NO/" modules/galoy/build-numbers.auto.tfvars

make fmt

git checkout -b $BRANCH_NAME
git add modules/galoy/build-numbers.auto.tfvars
git commit -m "chore: purge old mobile versions before v$VERSION"

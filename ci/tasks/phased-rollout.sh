#!/bin/bash

set -eu

. pipeline-tasks/ci/tasks/helpers.sh

export TIMESTAMP=$(cat ./daily/timestamp | cut -d"." -f1)
export VERSION=$(cat ./public-version/version)
export VERSION_CODE=$(cat ./build-number-android/android-builds/$VERSION)

if [! -d "./phased-rollouts-android/$VERSION" ]; then
  mkdir "./phased-rollouts-android/$VERSION"
  pushd "./phased-rollouts-android/$VERSION"
  export PREV_ROLLOUT="0"
else
  pushd "./phased-rollouts-android/$VERSION"
  export PREV_ROLLOUT=$(cat ./percent)

  if [[ $PREV_ROLLOUT == "1.0" ]]; then
    echo "Rolled out to 100%"
    exit 0
  fi

  export PREV_ROLLOUT_TIME=$(date +%s -d "$(cat ./timestamp)")
  export NOW_ROLLOUT_TIME=$(date +%s -d "$TIMESTAMP")

  if [[ (( $NOW_ROLLOUT_TIME - $PREV_ROLLOUT_TIME )) < "86400" ]]; then
    echo "Can't rollout; 1 day hasn't yet passed from last rollout"
    exit 0
  fi

fi

export ROLLOUT=$(cat ../release-schema/$PREV_ROLLOUT)

echo $ROLLOUT > percent
echo $TIMESTAMP > timestamp

(
  git add percent
  git add timestamp
  git status
  git commit -m "rollout($VERSION): android to $ROLLOUT"
)

popd

pushd repo/android

echo $ANDROID_SERVICE_ACCOUNT_UPLOAD > galoyapp-2e25e160d4ba.json

bundle install
bundle exec fastlane public_phased_percent

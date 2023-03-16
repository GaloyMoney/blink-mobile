#!/bin/bash

set -eu

. pipeline-tasks/ci/tasks/helpers.sh

v=$(cat ./version/version)
export VERSION=$(version_part $v)

pushd build-number

current=$(cat $PLATFORM)

echo "Current Build Number: $current"

new=$(($current + 1))

echo "Updated Build Number: $new"

echo $new > $PLATFORM

if [[ -z $(git config --global user.email) ]]; then
  git config --global user.email "bot@galoy.io"
fi
if [[ -z $(git config --global user.name) ]]; then
  git config --global user.name "CI Bot"
fi

mkdir -p ${PLATFORM}-builds
cd ${PLATFORM}-builds
echo $new > $VERSION # Latest build number on version part
echo $new > $v # Version with RC -> Build Number
echo $v > $new # Build Number -> Version with RC

(
  cd $(git rev-parse --show-toplevel)
  git add ${PLATFORM}
  git add ${PLATFORM}-builds/$VERSION
  git add ${PLATFORM}-builds/$v
  git add ${PLATFORM}-builds/$new
  git status
  git commit -m "chore(build-number): bump ${PLATFORM} build number from $current to $new"
)

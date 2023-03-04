#!/bin/bash

set -eu

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

(
  cd $(git rev-parse --show-toplevel)
  git add $PLATFORM
  git status
  git commit -m "chore(build-number): bump ${PLATFORM} build number from $current to $new"
)

#!/bin/zsh

set -eu

# TODO: Remove via Nix
HOME="/Users/m1"
export PATH=$(cat /Users/m1/concourse/path)

BUILD_NUMBER=$(cat build-number-ios/ios)
export PUBLIC_VERSION=$(cat $VERSION_FILE)

GIT_REF=$(cat repo/.git/ref)

pushd repo
git checkout $GIT_REF

yarn global add node-gyp
yarn install

tmpfile=$(mktemp /tmp/wwdr-cert.cer)
curl -f -o $tmpfile https://www.apple.com/certificateauthority/AppleWWDRCAG3.cer && security import $tmpfile ~/Library/Keychains/login.keychain-db

pushd ios
sed -i'' -e "s/MARKETING_VERSION.*/MARKETING_VERSION = $PUBLIC_VERSION;/g" GaloyApp.xcodeproj/project.pbxproj
bundle exec fastlane ios build
popd
popd

mkdir -p artifacts/ios
cp repo/ios/Blink.ipa artifacts/ios

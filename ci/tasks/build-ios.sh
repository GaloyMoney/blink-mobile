#!/bin/zsh

set -eu

echo $GITHUB_SSH_KEY > id_rsa
chmod 600 id_rsa
ssh-add ./id_rsa
rm id_rsa

BUILD_NUMBER=$(cat build-number-ios/ios)
export PUBLIC_VERSION=$(cat $VERSION_FILE)

GIT_REF=$(cat repo/.git/ref)

source "$HOME/.rvm/scripts/rvm"
rvm use $(cat repo/.ruby-version)

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

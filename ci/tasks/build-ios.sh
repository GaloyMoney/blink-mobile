#!/bin/zsh

set -eu
export PATH=$(cat /Users/m1/concourse/path)

# Make sure ssh agent is running - to access GaloyMoney ios keystore from github
eval "$(ssh-agent -s)"
cat <<EOF > id_rsa
$GITHUB_SSH_KEY
EOF
chmod 600 id_rsa
ssh-add ./id_rsa
rm id_rsa

BUILD_NUMBER=$(cat build-number-ios/ios)
export PUBLIC_VERSION=$(cat $VERSION_FILE)

GIT_REF=$(cat repo/.git/ref)

pushd repo
git checkout $GIT_REF

nix develop -c yarn install
nix develop -c sh -c 'cd ios && bundle install'

lsof -ti:8080,8081 | xargs kill -9 || true
(nix develop -c yarn start) &

sed -i'' -e "s/MARKETING_VERSION.*/MARKETING_VERSION = $PUBLIC_VERSION;/g" ios/GaloyApp.xcodeproj/project.pbxproj
nix develop -c sh -c 'cd ios && bundle exec fastlane ios build --verbose'

lsof -ti:8080,8081 | xargs kill -9 || true
popd

mkdir -p artifacts/ios
cp repo/ios/Blink.ipa artifacts/ios

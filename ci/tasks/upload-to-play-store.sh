#!/bin/bash

set -eu

cp built-prod-apk/app-universal-release.apk repo/android

pushd repo/android

echo $ANDROID_SERVICE_ACCOUNT_UPLOAD | base64 -d > galoyapp-2e25e160d4ba.json

bundler exec fastlane play_store_upload

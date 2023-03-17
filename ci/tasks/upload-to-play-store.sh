#!/bin/bash

set -eu

. pipeline-tasks/ci/tasks/helpers.sh

activate_gcloud_service_account

export URL=$(cat built-prod-apk/url)

pushd repo
download_build_apk $URL

pushd android
echo $ANDROID_SERVICE_ACCOUNT_UPLOAD > galoyapp-2e25e160d4ba.json

bundle install
bundle exec fastlane android play_store_upload

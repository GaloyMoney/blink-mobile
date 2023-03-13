#!/bin/bash

set -eu

. pipeline-tasks/ci/vendor/tasks/helpers.sh
activate_gcloud_service_account ${ARTIFACTS_BUCKET_SA_JSON_KEY}

export VERSION=$(cat built-prod-apk/version)

download_prod_build

# pushd repo/android

# echo $ANDROID_SERVICE_ACCOUNT_UPLOAD > galoyapp-2e25e160d4ba.json

# bundle install
# bundle exec fastlane android play_store_upload

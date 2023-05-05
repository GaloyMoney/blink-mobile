#!/bin/bash

set -eu

. pipeline-tasks/ci/tasks/helpers.sh

if [[ $(cat ./built-prod-apk/version) != $(cat ./built-prod-ipa/version) ]]; then
  echo "Version mismatch, one of the upload tasks must be running!"
  exit 1
fi

mkdir -p artifacts/files
activate_gcloud_service_account

pushd repo
export URL=$(cat ../built-prod-apk/url)
download_build_apk
mv android/app/build/outputs/apk/release/*.apk ../artifacts/files

export URL=$(cat ../built-prod-ipa/url)
download_build_ipa
mv ios/*.ipa ../artifacts/files
popd

gh release upload $(cat ./testflight-version/version) ./artifacts/files/*

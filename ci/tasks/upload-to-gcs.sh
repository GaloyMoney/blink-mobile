#!/bin/bash

set -eu

version=$(cat $VERSION_FILE)

echo $json_key > key.json
gcloud auth activate-service-account --key-file key.json

pushd artifacts

gsutil cp -r android/app/build/outputs/* gs://$bucket/galoy-mobile/$GCS_DIRECTORY/android/galoy-mobile-$(date +%s)-v${version}/
gsutil cp -r ios/Blink.ipa gs://$bucket/galoy-mobile/$GCS_DIRECTORY/ios/galoy-mobile-$(date +%s)-v${version}/

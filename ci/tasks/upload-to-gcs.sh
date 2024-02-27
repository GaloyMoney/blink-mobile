#!/bin/bash

set -eu

version=$(cat $VERSION_FILE)

echo $json_key > key.json
gcloud auth activate-service-account --key-file key.json

pushd artifacts

gsutil cp -r $INPUTS gs://$bucket/galoy-mobile/$GCS_DIRECTORY/galoy-mobile-$(date +%s)-v${version}/

#!/bin/bash

set -eu

cp built-prod-apk/app-universal-release.apk repo/android

pushd repo/android

bundle install
bundler exec fastlane huawei_store_upload

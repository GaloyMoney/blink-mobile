#!/bin/bash

set -eu

cp built-prod-ipa/Bitcoin\ Beach.ipa repo/ios

pushd repo/ios

bundler exec fastlane app_store_upload

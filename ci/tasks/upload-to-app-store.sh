#!/bin/bash

pushd repo/ios

bundler exec fastlane app_store_upload

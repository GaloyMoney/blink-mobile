#!/bin/bash

pushd repo/android

bundler exec fastlane huawei_store_upload

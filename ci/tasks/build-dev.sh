#!/bin/bash

set -eu

ref=$(cat repo/.git/ref)

pipeline_id=$(curl -s --request POST \
--url https://circleci.com/api/v2/project/gh//GaloyMoney/galoy-mobile/pipeline \
--header "Circle-Token: $CIRCLECI_TOKEN" \
--header 'content-type: application/json' \
--data "{'branch':'circleci-job-for-concourse','parameters':{'version':"$ref"}}" | jq -r '.id')

cat $pipeline_id

sleep 50000

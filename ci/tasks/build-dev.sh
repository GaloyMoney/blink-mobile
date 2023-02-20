#!/bin/bash

set -eu

ref=$(cat repo/.git/ref)

pipeline_id=$(
  curl -s --request POST \
    --url https://circleci.com/api/v2/project/gh//GaloyMoney/galoy-mobile/pipeline \
    --header "Circle-Token: $CIRCLECI_TOKEN" \
    --header 'content-type: application/json' \
    --data '{"branch":"circleci-job-for-concourse","parameters":{"version":"'"$ref"'"}}' \
    | jq -r '.id'
)

workflow_id=$(
  curl -s --request GET \
    --url https://circleci.com/api/v2/pipeline/$pipeline_id/workflow \
    --header "Circle-Token: $CIRCLECI_TOKEN" \
    | jq -r '.items[] | select(.name == "upload_to_bucket") | .id'
)

job_number=$(
  curl -s --request GET \
    --url https://circleci.com/api/v2/workflow/$workflow_id/job \
    --header "Circle-Token: $CIRCLECI_TOKEN" \
    | jq -r '.items[] | select(.name == "build_android") | .job_number'
)

curl --request GET \
  --url https://circleci.com/api/v2/project/gh//GaloyMoney/galoy-mobile/job/$job_number

set +e
for i in {1..15}; do
  echo "Attempt ${i} to fetch job status"
  status=$(
    curl -s --request GET \
      --url https://circleci.com/api/v2/project/gh//GaloyMoney/galoy-mobile/job/$job_number \
      | jq -r '.status'
  )
  if [[ $status != "running" ]]; then break; fi;
  sleep 5
done
set -e

echo $status

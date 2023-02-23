#!/bin/bash

set -eu

pushd repo
ref=$(cat .git/ref)

pipeline_id=$(
  curl -s --request POST \
    --url https://circleci.com/api/v2/project/gh//GaloyMoney/galoy-mobile/pipeline \
    --header "Circle-Token: $CIRCLECI_TOKEN" \
    --header 'content-type: application/json' \
    --data '{"branch":"circleci-job-for-concourse","parameters":{ "version": "'"$ref"'", "platform": "ios" }}' \
    | jq -r '.id'
)

echo pipeline_id:$pipeline_id
sleep 1
workflow_id=$(
  curl -s --request GET \
    --url https://circleci.com/api/v2/pipeline/$pipeline_id/workflow \
    --header "Circle-Token: $CIRCLECI_TOKEN" \
    | jq -r '.items[] | select(.name == "build_ios_and_upload_to_bucket") | .id'
)

echo workflow_id:$workflow_id

job_number=$(
  curl -s --request GET \
    --url https://circleci.com/api/v2/workflow/$workflow_id/job \
    --header "Circle-Token: $CIRCLECI_TOKEN" \
    | jq -r '.items[] | select(.name == "build_ios") | .job_number'
)

echo job_number:$job_number

echo "Waiting for CircleCI to finish Building iOS...."
echo "[x] Sleeping for 15 mins"
sleep 900

set +e
for i in {1..60}; do
  echo "Attempt ${i} to fetch job status"
  status=$(
    curl -s --request GET \
      --url https://circleci.com/api/v2/project/gh//GaloyMoney/galoy-mobile/job/$job_number \
      | jq -r '.status'
  )
  if [[ $status != "running" && $status != "queued" ]]; then break; fi;
  echo "status:$status";
  sleep 5
done
set -e

echo "Final Status: $status"

if [[ "$status" == "success" ]]
then
  echo "build succeeded!"
  exit 0
elif [[ "$status" == "failed" ]]
then
  echo "build failed"
  exit 1
elif [[ "$status" == "running" ]]
then
  echo "build is taking too long"
  exit 1
fi

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

echo pipeline_id:$pipeline_id
sleep 1
workflow_id=$(
  curl -s --request GET \
    --url https://circleci.com/api/v2/pipeline/$pipeline_id/workflow \
    --header "Circle-Token: $CIRCLECI_TOKEN" \
    | jq -r '.items[] | select(.name == "upload_to_bucket") | .id'
)

echo workflow_id:$workflow_id

job_number=$(
  curl -s --request GET \
    --url https://circleci.com/api/v2/workflow/$workflow_id/job \
    --header "Circle-Token: $CIRCLECI_TOKEN" \
    | jq -r '.items[] | select(.name == "build_android") | .job_number'
)

echo job_number:$job_number

# echo sleeping for 10 mins
# sleep 600

set +e
for i in {1..3}; do
  echo "Attempt ${i} to fetch job status"
  status=$(
    curl -s --request GET \
      --url https://circleci.com/api/v2/project/gh//GaloyMoney/galoy-mobile/job/$job_number \
      | jq -r '.status'
  )
  if [[ $status != "running" && $status != "queued" ]]; then break; fi;
  sleep 5
done
set -e

echo $status

# if [[ $status == "success" ]];
# then
  echo $BUILD_ARTIFACTS_BUCKET_CREDS > key.json
  gcloud auth activate-service-account --key-file key.json
  gsutil cp gs://galoy-build-artifacts/galoy-mobile/android/galoy-mobile-v${ref}/apk/release/app-universal-release.apk .
# elif [[ $status == "failed"]];
  exit 1
# fi

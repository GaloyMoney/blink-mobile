#!/bin/bash

if [[ ! -z "$BUILD_NUMBER_FILE" ]]; then
  BUILD_NUMBER=$(cat $BUILD_NUMBER_FILE)
fi

set -eu

git_ref=$(cat $GIT_REF_FILE)
version=$(cat $VERSION_FILE)

pushd repo

pipeline_id=$(
  curl -s --request POST \
    --url https://circleci.com/api/v2/project/gh//GaloyMoney/galoy-mobile/pipeline \
    --header "Circle-Token: $CIRCLECI_TOKEN" \
    --header 'content-type: application/json' \
    --data '{"branch":"circleci-job-for-concourse","parameters":{ "version": "'"$version"'", "platform": "'$PLATFORM'", "git_ref": "'"$git_ref"'", "build_number": "'$BUILD_NUMBER'", "gcs_directory": "'$GCS_DIRECTORY'" }}' \
    | jq -r '.id'
)

echo pipeline_id:$pipeline_id
sleep 1

workflow_id=$(
  curl -s --request GET \
    --url https://circleci.com/api/v2/pipeline/$pipeline_id/workflow \
    --header "Circle-Token: $CIRCLECI_TOKEN" \
    | jq -r '.items[] | select(.name == "build_$PLATFORM_and_upload_to_bucket") | .id'
)

pipeline_number=$(
  curl -s --request GET \
    --url https://circleci.com/api/v2/pipeline/$pipeline_id/workflow \
    --header "Circle-Token: $CIRCLECI_TOKEN" \
    | jq -r '.items[] | select(.name == "build_$PLATFORM_and_upload_to_bucket") | .pipeline_number'
)

echo workflow_id:$workflow_id

job_number=$(
  curl -s --request GET \
    --url https://circleci.com/api/v2/workflow/$workflow_id/job \
    --header "Circle-Token: $CIRCLECI_TOKEN" \
    | jq -r '.items[] | select(.name == "build_$PLATFORM") | .job_number'
)

echo job_number:$job_number

echo "-------------------------------------------------------------------------------------------------------------------------------"
echo "Waiting for CircleCI to finish Building $PLATFORM...."
echo "Follow Build Here: https://app.circleci.com/pipelines/github/GaloyMoney/galoy-mobile/$pipeline_number/workflows/$workflow_id/jobs/$job_number"
echo "-------------------------------------------------------------------------------------------------------------------------------"

echo "[•] Sleeping for $WAIT_FOR_BUILD_MINS mins"
sleep $(($WAIT_FOR_BUILD_MINS * 60))

set +e
for i in {1..60}; do
  echo "[x] Attempt ${i} to fetch job status"
  status=$(
    curl -s --request GET \
      --url https://circleci.com/api/v2/project/gh//GaloyMoney/galoy-mobile/job/$job_number \
      | jq -r '.status'
  )
  echo "status:$status";
  if [[ $status != "running" && $status != "queued" ]]; then break; fi;
  sleep 5
done
set -e

echo "[•] Final Status: $status"

if [[ "$status" == "success" ]]
then
  echo "[✓] Build succeeded!"
  exit 0
else
  echo "[✗] Build failed!"
  exit 1
fi

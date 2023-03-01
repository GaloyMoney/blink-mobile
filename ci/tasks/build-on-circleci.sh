#!/bin/bash

if [[ ! -z "$BUILD_NUMBER_FILE" ]]; then
  BUILD_NUMBER=$(cat $BUILD_NUMBER_FILE)
fi

if [[ ! -z "$GIT_REF_PATTERN" ]]; then
  [[ "$(cat $GIT_REF_FILE)" =~ $GIT_REF_PATTERN ]]
  git_ref=$(echo "${BASH_REMATCH[1]}")
else
  git_ref=$(cat $GIT_REF_FILE)
fi

set -eu

version=$(cat $VERSION_FILE)

pushd repo

pipeline_id=$(
  curl -s --request POST \
    --url https://circleci.com/api/v2/project/gh//GaloyMoney/galoy-mobile/pipeline \
    --header "Circle-Token: $CIRCLECI_TOKEN" \
    --header 'content-type: application/json' \
    --data '{"branch":"main","parameters":{ "version": "'"$version"'", "platform": "'$PLATFORM'", "git_ref": "'"$git_ref"'", "build_number": "'$BUILD_NUMBER'", "gcs_directory": "'$GCS_DIRECTORY'" }}' \
    | jq -r '.id'
)

echo pipeline_id:$pipeline_id
sleep 1

workflow_id=$(
  curl -s --request GET \
    --url https://circleci.com/api/v2/pipeline/$pipeline_id/workflow \
    --header "Circle-Token: $CIRCLECI_TOKEN" \
    | jq --arg name "build_${PLATFORM}_and_upload_to_bucket" -r '.items[] | select(.name == $name) | .id'
)

pipeline_number=$(
  curl -s --request GET \
    --url https://circleci.com/api/v2/pipeline/$pipeline_id/workflow \
    --header "Circle-Token: $CIRCLECI_TOKEN" \
    | tee response | jq --arg name "build_${PLATFORM}_and_upload_to_bucket" -r '.items[] | select(.name == $name) | .pipeline_number'
)

echo workflow_id:$workflow_id

job_number=$(
  curl -s --request GET \
    --url https://circleci.com/api/v2/workflow/$workflow_id/job \
    --header "Circle-Token: $CIRCLECI_TOKEN" \
    | tee response | jq --arg name "build_${PLATFORM}" -r '.items[] | select(.name == $name) | .job_number'
)

echo $job_number > ../job-number/number
echo job_number:$job_number

echo "-------------------------------------------------------------------------------------------------------------------------------"
echo "Waiting for CircleCI to finish Building $PLATFORM...."
echo "Follow Build Here: https://app.circleci.com/pipelines/github/GaloyMoney/galoy-mobile/$pipeline_number/workflows/$workflow_id/jobs/$job_number"
echo "-------------------------------------------------------------------------------------------------------------------------------"

echo "[•] Polling for $WAIT_FOR_BUILD_MINS mins at a frequency of 5 seconds"

times=$(echo "$WAIT_FOR_BUILD_MINS * 12" | bc)
set +e
for (( i = 0; i <= $times; i++ ))
do
  status=$(
    curl -s --request GET \
      --url https://circleci.com/api/v2/project/gh//GaloyMoney/galoy-mobile/job/$job_number \
      | jq -r '.status'
  )
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
  echo "[•] If final status wasn't failed, please cross check with CircleCI task."
  exit 1
fi

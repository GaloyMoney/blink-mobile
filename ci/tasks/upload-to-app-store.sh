#!/bin/bash

set -eu

. pipeline-tasks/ci/tasks/helpers.sh

git_ref=$(version_part_from_build_url_ipa $(cat ./built-prod-ipa/url)) # tag
ipa_gcs_url=$(cat ./built-prod-ipa/url)

pipeline_id=$(curl -s --request POST \
  --url https://circleci.com/api/v2/project/gh//GaloyMoney/galoy-mobile/pipeline \
  --header "Circle-Token: $CIRCLECI_TOKEN" \
  --header 'content-type: application/json' \
  --data '{"branch":"main","parameters":{"task": "upload_to_app_store","gcs_url":"'"$ipa_gcs_url"'","git_ref":"'"$git_ref"'" }}' \
  | jq -r '.id')

echo pipeline_id:$pipeline_id
sleep 1

workflow_id=$(
  curl -s --request GET \
    --url https://circleci.com/api/v2/pipeline/$pipeline_id/workflow \
    --header "Circle-Token: $CIRCLECI_TOKEN" \
    | jq --arg name "upload_to_app_store" -r '.items[] | select(.name == $name) | .id'
)

pipeline_number=$(
  curl -s --request GET \
    --url https://circleci.com/api/v2/pipeline/$pipeline_id/workflow \
    --header "Circle-Token: $CIRCLECI_TOKEN" \
    | tee response | jq --arg name "upload_to_app_store" -r '.items[] | select(.name == $name) | .pipeline_number'
)

echo workflow_id:$workflow_id

job_number=$(
  curl -s --request GET \
    --url https://circleci.com/api/v2/workflow/$workflow_id/job \
    --header "Circle-Token: $CIRCLECI_TOKEN" \
    | tee response | jq --arg name "upload_to_app_store" -r '.items[] | select(.name == $name) | .job_number'
)

echo $job_number > ./job-number/number
echo job_number:$job_number

echo "-------------------------------------------------------------------------------------------------------------------------------"
echo "Waiting for CircleCI to finish Uploading IPA...."
echo "Follow Job Here: https://app.circleci.com/pipelines/github/GaloyMoney/galoy-mobile/$pipeline_number/workflows/$workflow_id/jobs/$job_number"
echo "-------------------------------------------------------------------------------------------------------------------------------"

echo "[•] Polling for 20 mins at a frequency of 5 seconds"

set +e
for i in {1..240}; do
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
  echo "[✓] Upload succeeded!"
  exit 0
else
  echo "[✗] Upload failed!"
  echo "[•] If final status wasn't failed, please cross check with CircleCI task."
  exit 1
fi

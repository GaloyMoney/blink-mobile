#!/bin/bash

set -eu

pushd repo
ref=$(cat .git/ref)

pipeline_id=$(
  curl -s --request POST \
    --url https://circleci.com/api/v2/project/gh//GaloyMoney/galoy-mobile/pipeline \
    --header "Circle-Token: $CIRCLECI_TOKEN" \
    --header 'content-type: application/json' \
    --data '{"branch":"circleci-job-for-concourse","parameters":{ "version": "'"$ref"'", "platform": "android" }}' \
    | jq -r '.id'
)

echo pipeline_id:$pipeline_id
sleep 1
workflow_id=$(
  curl -s --request GET \
    --url https://circleci.com/api/v2/pipeline/$pipeline_id/workflow \
    --header "Circle-Token: $CIRCLECI_TOKEN" \
    | jq -r '.items[] | select(.name == "build_android_and_upload_to_bucket") | .id'
)

echo workflow_id:$workflow_id

job_number=$(
  curl -s --request GET \
    --url https://circleci.com/api/v2/workflow/$workflow_id/job \
    --header "Circle-Token: $CIRCLECI_TOKEN" \
    | jq -r '.items[] | select(.name == "build_android") | .job_number'
)

echo job_number:$job_number

echo sleeping for 5 mins
sleep 300

set +e
for i in {1..30}; do
  echo "Attempt ${i} to fetch job status"
  status=$(
    curl -s --request GET \
      --url https://circleci.com/api/v2/project/gh//GaloyMoney/galoy-mobile/job/5423 \
      | jq -r '.status'
  )
  if [[ $status != "running" && $status != "queued" ]]; then break; fi;
  echo "status:$status";
  sleep 5
done
set -e

echo $status

if [[ "$status" == "success" ]]
then
  echo $BUILD_ARTIFACTS_BUCKET_CREDS > key.json
  gcloud auth activate-service-account --key-file key.json
  # gsutil cp gs://galoy-build-artifacts/galoy-mobile/android/galoy-mobile-va17ddd5cd84d1454ac345b828123eca2d52cf93c/apk/release/app-universal-release.apk .
  gsutil cp gs://galoy-build-artifacts/galoy-mobile/android/galoy-mobile-v${ref}/apk/release/app-universal-release.apk .

  # do browserstack test
  yarn install
  export BROWSERSTACK_APP_ID=$(
    curl -u "$BROWSERSTACK_USER:$BROWSERSTACK_ACCESS_KEY" \
      -X POST "https://api-cloud.browserstack.com/app-automate/upload" \
      -F "file=@./app-universal-release.apk"\
      | jq -r '.app_url'
  )
  echo browserstack_app_id:$BROWSERSTACK_APP_ID
  GALOY_TEST_TOKENS=$GALOY_TEST_TOKENS && GALOY_TOKEN_2=$GALOY_TOKEN_2 && yarn test:browserstack:android
elif [[ "$status" == "failed" ]]
then
  echo "build failed"
  exit 1
fi

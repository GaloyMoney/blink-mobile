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

echo sleeping for 10 mins
sleep 600

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

echo $status

if [[ "$status" == "success" ]]
then
  echo $BUILD_ARTIFACTS_BUCKET_CREDS > key.json
  gcloud auth activate-service-account --key-file key.json
  # gsutil cp gs://galoy-build-artifacts/galoy-mobile/ios/galoy-mobile-va17ddd5cd84d1454ac345b828123eca2d52cf93c/apk/release/app-universal-release.apk .
  gsutil cp "gs://galoy-build-artifacts/galoy-mobile/ios/galoy-mobile-v$ref/Bitcoin Beach.ipa" .
  echo "copied ipa from galoy-build-artifacts/galoy-mobile/ios/galoy-mobile-v$ref"

  # do browserstack test
  yarn install
  export BROWSERSTACK_APP_ID=$(
    curl -u "$BROWSERSTACK_USER:$BROWSERSTACK_ACCESS_KEY" \
      -X POST "https://api-cloud.browserstack.com/app-automate/upload" \
      -F "file=@./Bitcoin Beach.ipa"\
      | jq -r '.app_url'
  )
  echo browserstack_app_id:$BROWSERSTACK_APP_ID
  GALOY_TEST_TOKENS=$GALOY_TEST_TOKENS && GALOY_TOKEN_2=$GALOY_TOKEN_2 && yarn test:browserstack:ios
elif [[ "$status" == "failed" ]]
then
  echo "build failed"
  exit 1
fi
elif [[ "$status" == "running" ]]
then
  echo "build is taking too long"
  exit 1
fi

#!/bin/bash

set -eu

if [[ ! -f ./dev-ios-build/Bitcoin Beach.ipa ]]; then
  echo "IPA not found"
  exit 1
fi

export BROWSERSTACK_APP_ID=$(
  curl -u "$BROWSERSTACK_USER:$BROWSERSTACK_ACCESS_KEY" \
    -X POST "https://api-cloud.browserstack.com/app-automate/upload" \
    -F "file=@./dev-ios-build/Bitcoin Beach.ipa"\
    | jq -r '.app_url'
)

. pipeline-tasks/ci/tasks/helpers.sh

unpack_deps

pushd repo

# do browserstack test
yarn install

echo browserstack_app_id:$BROWSERSTACK_APP_ID
GALOY_TEST_TOKENS=$GALOY_TEST_TOKENS && GALOY_TOKEN_2=$GALOY_TOKEN_2 && yarn test:browserstack:ios | tee browserstack_output.log
error_code=$?
SESSION_ID=$(cat browserstack_output.log | grep sessionId | head -n1 | sed -n "s/^.*'\(.*\)'.*$/\1/ p")
echo "Session ID"
echo $SESSION_ID
VIDEO_URL=$(curl -s -u "$BROWSERSTACK_USER:$BROWSERSTACK_ACCESS_KEY" -X GET "https://api-cloud.browserstack.com/app-automate/sessions/$SESSION_ID.json" | jq -r '.automation_session.video_url')
echo "Video URL"
echo $VIDEO_URL
exit $error_code

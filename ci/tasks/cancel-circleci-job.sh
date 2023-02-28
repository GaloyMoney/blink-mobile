#!/bin/bash

job_number=$(cat job-number/number)

curl --request POST \
  --url https://circleci.com/api/v2/project/job/$job_number/cancel \
  --header "Circle-Token: $CIRCLECI_TOKEN"

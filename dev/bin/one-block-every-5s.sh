#!/bin/bash

 set -e

 REPO_ROOT=$(git rev-parse --show-toplevel)

 source ${REPO_ROOT}/dev/vendor/galoy-quickstart/bin/helpers.sh

 while true; do
   bitcoin_cli -generate 1
   sleep 5
 done

#!/bin/bash

 set -e

 REPO_ROOT=$(git rev-parse --show-toplevel)

 source ${REPO_ROOT}/dev/vendor/galoy-quickstart/bin/helpers.sh
 source ${REPO_ROOT}/dev/.env

 login_user "alice" "$ALICE_PHONE" "000000"
 echo "alice logged in"
 ALICE_TOKEN=$(read_value "alice")
 receive_onchain
 echo "alice funded"

 login_user "alice" "$BOB_PHONE" "000000"
 echo "bob logged in"
 BOB_TOKEN=$(read_value "alice")
 receive_onchain
 echo "bob funded"

 cat <<EOF > .env.tmp.ci
 ALICE_TOKEN="$ALICE_TOKEN"
 BOB_TOKEN="$BOB_TOKEN"
 EOF

#!/bin/bash

set -e

REPO_ROOT=$(git rev-parse --show-toplevel)

source ${REPO_ROOT}/dev/vendor/galoy-quickstart/bin/helpers.sh
source ${REPO_ROOT}/dev/vendor/galoy-quickstart/dev/helpers/cli.sh

ALICE_SUFFIX=$(cat /dev/urandom | tr -dc '0-9' | fold -w 6 | head -n 1)
ALICE_PHONE="+919836$ALICE_SUFFIX"
ALICE_USERNAME="alice_$ALICE_SUFFIX"

BOB_SUFFIX=$(cat /dev/urandom | tr -dc '0-9' | fold -w 6 | head -n 1)
BOB_PHONE="+919836$BOB_SUFFIX"
BOB_USERNAME="bob_$BOB_SUFFIX"

# Sometimes server isn't ready
success=0
for attempt in {1..10}; do
  login_user "alice" "$ALICE_PHONE" "000000" && { success=1; break; }
  sleep 5
done
if [ $success -ne 1 ]; then exit 1; fi

echo "alice logged in"
ALICE_TOKEN=$(read_value "alice")
receive_onchain
exec_graphql 'alice' 'user-update-username' "{\"input\": {\"username\": \"$ALICE_USERNAME\"}}"
echo "alice funded & set up"

login_user "alice" "$BOB_PHONE" "000000"
echo "bob logged in"
BOB_TOKEN=$(read_value "alice")
receive_onchain
exec_graphql 'alice' 'user-update-username' "{\"input\": {\"username\": \"$BOB_USERNAME\"}}"
echo "bob funded & set up"

cat <<EOF > ${REPO_ROOT}/dev/.env.tmp.ci
ALICE_PHONE="$ALICE_PHONE"
ALICE_TOKEN="$ALICE_TOKEN"
ALICE_USERNAME="$ALICE_USERNAME"
BOB_PHONE="$BOB_PHONE"
BOB_TOKEN="$BOB_TOKEN"
BOB_USERNAME="bob_$BOB_SUFFIX"
EOF

btc_amount=100000
invoice_response="$(lnd_cli addinvoice --amt $btc_amount)"
payment_request="$(echo $invoice_response | jq -r '.payment_request')"
lnd_outside_cli payinvoice -f --pay_req "$payment_request"

echo "lnd channel created with local funds"

#!/bin/bash

set -e

REPO_ROOT=$(git rev-parse --show-toplevel)

source ${REPO_ROOT}/dev/vendor/galoy-quickstart/bin/helpers.sh
source ${REPO_ROOT}/dev/vendor/galoy-quickstart/dev/helpers/cli.sh

function performTransactions {
  address="$(lnd_cli newaddress p2wkh | jq -r '.address')"
  bitcoin_cli sendtoaddress "$address" 0.1
  bitcoin_cli -generate 3

  address="$(lnd_outside_cli newaddress p2wkh | jq -r '.address')"
  bitcoin_cli sendtoaddress "$address" 0.1
  bitcoin_cli -generate 3

  btc_amount=100000
  invoice_response="$(lnd_cli addinvoice --amt $btc_amount)"
  payment_request="$(echo $invoice_response | jq -r '.payment_request')"
  lnd_outside_cli payinvoice -f --pay_req "$payment_request"
  local result1=$?

  btc_amount=20000
  invoice_response="$(lnd_outside_cli addinvoice --amt $btc_amount)"
  payment_request="$(echo $invoice_response | jq -r '.payment_request')"
  lnd_cli payinvoice -f --pay_req "$payment_request"
  local result2=$?

  return $(($result1 + $result2))
}

until performTransactions; do
  echo "One or more transactions failed. Retrying in 5 seconds..."
  sleep 5
done

echo "lnd <--> lnd-outside channel created with funds"

#!/bin/bash

set -e

REPO_ROOT=$(git rev-parse --show-toplevel)

source ${REPO_ROOT}/dev/vendor/galoy-quickstart/bin/helpers.sh
source ${REPO_ROOT}/dev/vendor/galoy-quickstart/dev/helpers/cli.sh

ALICE_SUFFIX=$(LC_ALL=C cat /dev/urandom | od -An -tu1 | tr -d ' ' | tr -cd '0-9' | head -c 6)
ALICE_PHONE="+919836$ALICE_SUFFIX"
ALICE_USERNAME="alice_$ALICE_SUFFIX"

login_user "alice" "$ALICE_PHONE" "000000"
echo "alice logged in"
ALICE_TOKEN=$(read_value "alice")

fund_wallet_from_onchain "alice" "alice.btc_wallet_id" "1"
fund_wallet_from_onchain "alice" "alice.usd_wallet_id" "1"

# Alice account should report non zero balances
btc_balance=0
usd_balance=0
while [ "$btc_balance" -eq 0 ] || [ "$usd_balance" -eq 0 ]; do
    exec_graphql 'alice' 'wallets-for-account'
    btc_balance=$(graphql_output | jq '.data.me.defaultAccount.wallets[] | select(.walletCurrency == "BTC") | .balance')
    usd_balance=$(graphql_output | jq '.data.me.defaultAccount.wallets[] | select(.walletCurrency == "USD") | .balance')

    echo "BTC Balance: $btc_balance"
    echo "USD Balance: $usd_balance"
    sleep 1
done

exec_graphql 'alice' 'user-update-username' "{\"input\": {\"username\": \"$ALICE_USERNAME\"}}"
echo "alice funded & set up"

BOB_SUFFIX=$(LC_ALL=C cat /dev/urandom | od -An -tu1 | tr -d ' ' | tr -cd '0-9' | head -c 6)
BOB_PHONE="+919836$BOB_SUFFIX"
BOB_USERNAME="bob_$BOB_SUFFIX"

login_user "bob" "$BOB_PHONE" "000000"
echo "bob logged in"
BOB_TOKEN=$(read_value "bob")

fund_wallet_from_onchain "bob" "bob.btc_wallet_id" "1"
fund_wallet_from_onchain "bob" "bob.usd_wallet_id" "1"

# Bob account should report non zero balances
btc_balance=0
usd_balance=0
while [ "$btc_balance" -eq 0 ] || [ "$usd_balance" -eq 0 ]; do
    exec_graphql 'bob' 'wallets-for-account'
    btc_balance=$(graphql_output | jq '.data.me.defaultAccount.wallets[] | select(.walletCurrency == "BTC") | .balance')
    usd_balance=$(graphql_output | jq '.data.me.defaultAccount.wallets[] | select(.walletCurrency == "USD") | .balance')

    echo "BTC Balance: $btc_balance"
    echo "USD Balance: $usd_balance"
    sleep 1
done

exec_graphql 'bob' 'user-update-username' "{\"input\": {\"username\": \"$BOB_USERNAME\"}}"
echo "bob funded & set up"

cat <<EOF > ${REPO_ROOT}/dev/.env.tmp.ci
ALICE_PHONE="$ALICE_PHONE"
ALICE_TOKEN="$ALICE_TOKEN"
ALICE_USERNAME="$ALICE_USERNAME"
BOB_PHONE="$BOB_PHONE"
BOB_TOKEN="$BOB_TOKEN"
BOB_USERNAME="bob_$BOB_SUFFIX"
EOF

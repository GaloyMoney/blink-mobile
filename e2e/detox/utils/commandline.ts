import { exec } from "child_process"
import path from "path"

const REPO_ROOT = path.join(__dirname, "../../..")

export const getKratosCode = async (email: string): Promise<string> =>
  new Promise((resolve) => {
    exec(
      `source "${REPO_ROOT}/dev/vendor/galoy-quickstart/dev/helpers/cli.sh" && 
      kratos_pg -c "SELECT body FROM courier_messages WHERE recipient='${email}' ORDER BY created_at DESC LIMIT 1;"`,
      { encoding: "utf-8" },
      (_, emailBody, __) => {
        const code = emailBody.match(/\b\d{6}\b/)?.[0]
        resolve(code || "")
      },
    )
  })

export const getExternalLNNoAmountInvoice = async (): Promise<string> =>
  new Promise((resolve) => {
    exec(
      `source "${REPO_ROOT}/dev/vendor/galoy-quickstart/dev/helpers/cli.sh" && 
      lnd_outside_cli addinvoice`,
      { encoding: "utf-8" },
      (_, invoiceResponse, __) => {
        resolve(JSON.parse(invoiceResponse).payment_request as string)
      },
    )
  })

export const getOnchainAddress = async (): Promise<string> =>
  new Promise((resolve) => {
    exec(
      `source "${REPO_ROOT}/dev/vendor/galoy-quickstart/dev/helpers/cli.sh" && 
      bitcoin_cli getnewaddress`,
      { encoding: "utf-8" },
      (_, address, __) => {
        resolve(address)
      },
    )
  })

export const getLnInvoiceForBob = async (): Promise<string> =>
  new Promise((resolve) => {
    exec(
      `source ${REPO_ROOT}/dev/vendor/galoy-quickstart/bin/helpers.sh
      source ${REPO_ROOT}/dev/vendor/galoy-quickstart/dev/helpers/cli.sh

      cd ${REPO_ROOT}/dev

      variables=$(
        jq -n \
        --arg wallet_id "$(read_value 'bob.btc_wallet_id')" \
        '{input: {walletId: $wallet_id}}'
      )
      exec_graphql "bob" 'ln-no-amount-invoice-create' "$variables"
      invoice="$(graphql_output '.data.lnNoAmountInvoiceCreate.invoice')"
      payment_request="$(echo $invoice | jq -r '.paymentRequest')"

      echo $payment_request
    `,
      { encoding: "utf-8" },
      (_, output, __) => {
        resolve(output)
      },
    )
  })

export const sendLnPaymentFromBob = async ({
  paymentRequest,
  amount,
}: {
  paymentRequest: string
  amount?: number
}): Promise<JSON> =>
  new Promise((resolve, reject) => {
    if (amount) {
      exec(
        `source ${REPO_ROOT}/dev/vendor/galoy-quickstart/bin/helpers.sh
      source ${REPO_ROOT}/dev/vendor/galoy-quickstart/dev/helpers/cli.sh

      cd ${REPO_ROOT}/dev

      variables=$(
        jq -n \
        --arg wallet_id "$(read_value 'bob.usd_wallet_id')" \
        --arg payment_request "${paymentRequest}" \
        --arg amount "${amount}" \
        '{input: {walletId: $wallet_id, paymentRequest: $payment_request, amount: $amount}}'
      )
      exec_graphql "bob" 'ln-no-amount-usd-invoice-payment-send' "$variables"
      graphql_output
    `,
        { encoding: "utf-8" },
        (_, output, __) => {
          const jsonOutput = JSON.parse(output)
          if (jsonOutput.data.lnNoAmountUsdInvoicePaymentSend.status === "SUCCESS")
            return resolve(jsonOutput)
          reject(new Error("LN Payment from Bob was not successful"))
        },
      )
    } else {
      exec(
        `source ${REPO_ROOT}/dev/vendor/galoy-quickstart/bin/helpers.sh
        source ${REPO_ROOT}/dev/vendor/galoy-quickstart/dev/helpers/cli.sh

        cd ${REPO_ROOT}/dev

        variables=$(
          jq -n \
          --arg wallet_id "$(read_value 'bob.btc_wallet_id')" \
          --arg payment_request "${paymentRequest}" \
          '{input: {walletId: $wallet_id, paymentRequest: $payment_request}}'
        )
        exec_graphql "bob" 'ln-invoice-payment-send' "$variables"
        graphql_output
      `,
        { encoding: "utf-8" },
        (_, output, __) => {
          const jsonOutput = JSON.parse(output)
          if (jsonOutput.data.lnInvoicePaymentSend.status === "SUCCESS")
            return resolve(jsonOutput)
          reject(new Error("LN Payment from Bob was not successful"))
        },
      )
    }
  })

export const sendBtcTo = async ({ address }: { address: string }): Promise<string> =>
  new Promise((resolve) => {
    exec(
      `source "${REPO_ROOT}/dev/vendor/galoy-quickstart/dev/helpers/cli.sh" && 
      bitcoin_cli sendtoaddress "${address}" 0.01 &&
      bitcoin_cli -generate 2`,
      { encoding: "utf-8" },
      (_, output, __) => {
        resolve(output)
      },
    )
  })

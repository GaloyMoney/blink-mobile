import path from "path"
import { exec } from "child_process"

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

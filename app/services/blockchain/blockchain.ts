import { ApisauceInstance, create, ApiResponse } from "apisauce"
import { getGeneralApiProblem } from "./blockchain-problem"
import { ApiConfig, DEFAULT_API_CONFIG } from "./blockchain-config"
import * as Types from "./blockchain.types"

/**
 * Manages all requests to the API.
 */
export class Blockchain {
  /**
   * The underlying apisauce instance which performs the requests.
   */
  apisauce: ApisauceInstance

  /**
   * Configurable options.
   */
  config: ApiConfig

  /**
   * Creates the api.
   *
   * @param config The configuration to use.
   */
  constructor(config: ApiConfig = DEFAULT_API_CONFIG) {
    this.config = config
  }

  /**
   * Sets up the API.  This will be called during the bootup
   * sequence and will happen before the first React component
   * is mounted.
   *
   * Be as quick as possible in here.
   */
  setup() {
    // construct the apisauce instance
    this.apisauce = create({
      baseURL: this.config.url,
      timeout: this.config.timeout,
      headers: {
        Accept: "application/json",
      },
    })
  }

  formatTransaction(tx) {
    tx.moneyIn = tx.result > 0
    tx.moneyIn ? tx.icon = "ios-download" : tx.icon = "ios-exit"
    tx.moneyIn ? tx.name = "Received" : tx.name = "Sent"
    tx.moneyIn ? 
      tx.addr = tx.inputs[0].prev_out.addr : // show input (the other address) if money comes in
      tx.addr = tx.out[0].addr
    tx.addr_fmt = `${tx.addr.slice(0, 11)}...${tx.addr.slice(-10)}`
    tx.addr = tx.addr_fmt // TODO FIXME better naming 
    tx.date = tx.time
    tx.amount = tx.result

    return tx
  }

  /**
   * Gets wallet of a Bitcoin address 
   */
  async getWallet(address: string): Promise<Types.GetWalletInfo> {

    // make the api call
    const response: ApiResponse<any> = await this.apisauce.get(`/multiaddr?active=${address}`)

    // the typical ways to die when calling an api
    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    // transform the data into the format we are expecting
    try {
        const balance: number = response.data.wallet.final_balance
        const txs: Object[] = response.data.txs

        txs.forEach((tx) => this.formatTransaction(tx))

        return { kind: "ok", balance, txs }
    } catch {
      return { kind: "bad-data" }
    }
  }
}
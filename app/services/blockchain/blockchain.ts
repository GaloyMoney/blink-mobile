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

        txs.forEach((tx) => tx.moneyIn = tx.result > 0 )
        txs.forEach((tx) => tx.moneyIn ? 
          tx.name = tx.inputs[0].prev_out.addr : // show input (the other address) if money comes in
          tx.name = tx.out[0].addr
        )
        txs.forEach((tx) => tx.moneyIn ? tx.icon = "ios-download" : tx.icon = "ios-exit" ) // TODO verify exit
        txs.forEach((tx) => tx.date = tx.time)
        txs.forEach((tx) => tx.amount = tx.result)

        return { kind: "ok", balance, txs }
    } catch {
      return { kind: "bad-data" }
    }
  }
}
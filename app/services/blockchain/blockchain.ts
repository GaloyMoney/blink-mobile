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
        return { kind: "ok", balance }
    } catch {
      return { kind: "bad-data" }
    }
  }
}
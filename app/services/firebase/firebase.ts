import { ApisauceInstance, create, ApiResponse } from "apisauce"
import { ApiConfig, DEFAULT_API_CONFIG } from "./firebase-config"

/**
 * Manages all requests to the API.
 */
export class Firebase {
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
   * Gets list of Transaction for Checking
   * TODO: Savings
   */

  async getTransactions(): Promise<any> {
    // make the api call
    const response: ApiResponse<any> = await this.apisauce.get(`/getFiatTransactions`)

    // the typical ways to die when calling an api
    if (!response.ok) {
      return undefined // FIXME
    }

    // transform the data into the format we are expecting
    try {
        const transactions = response.data.transactions
        return { kind: "ok", transactions }
    } catch {
      return { kind: "bad-data" }
    }
  }

  /**
   * Gets list of Fiat Balances
   */

  async getBalances(): Promise<any> {
    // make the api call
    const response: ApiResponse<any> = await this.apisauce.get(`/getFiatBalances`)

    // the typical ways to die when calling an api
    if (!response.ok) {
      return undefined // FIXME
    }

    // transform the data into the format we are expecting
    try {
        const balances = response.data
        return { kind: "ok", balances }
    } catch {
      return { kind: "bad-data" }
    }
  }
}
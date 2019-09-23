import { ApisauceInstance, create, ApiResponse } from "apisauce"
import { getGeneralApiProblem } from "./coinbase-problem"
import { ApiConfig, DEFAULT_API_CONFIG } from "./coinbase-config"
import * as Types from "./coinbase.types"

/**
 * Manages all requests to the API.
 */
export class Api {
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
   * Gets price of BTC
   */

  async getPrice(): Promise<Types.GetPriceResult> {
    // make the api call
    const response: ApiResponse<any> = await this.apisauce.get(`/v2/prices/spot?currency=USD`)

    // the typical ways to die when calling an api
    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    // transform the data into the format we are expecting
    try {
        const price: number = response.data.data.amount * Math.pow(10, -8)
        return { kind: "ok", price }
    } catch {
      return { kind: "bad-data" }
    }
  }
}
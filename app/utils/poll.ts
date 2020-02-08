import { sleep } from "./sleep"

const RETRY_DELAY = 1000
const LND_INIT_DELAY = 5000

/**
 * A polling utility that can be used to poll apis. If the api returns
 * a truthy value this utility will stop polling. Errors thrown by the
 * api are just thrown up to the caller to handle.
 * @param {Function} api     The api wrapped in an asynchronous function
 * @param {number} interval  The time interval to wait between polls
 * @param {number} retries   The number of retries to poll the api
 * @return {Promise<Object>} The return value of the api
 */
export const poll = async (api, interval = RETRY_DELAY, retries = Infinity) => {
  while (retries--) {
    const response = await api()
    if (response) return response
    await sleep(interval)
  }
  throw new Error("Maximum retries for polling reached")
}

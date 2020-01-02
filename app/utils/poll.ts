  
const RETRY_DELAY = 1000;
const LND_INIT_DELAY = 5000;

/**
 * Take a nice little nap :)
 * @param  {number} ms The amount of milliseconds to sleep
 * @return {Promise<undefined>}
 */
export const nap = (ms = LND_INIT_DELAY) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

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
    const response = await api();
    if (response) return response;
    await nap(interval);
  }
  throw new Error('Maximum retries for polling reached');
};
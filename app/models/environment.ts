import { Reactotron } from "../services/reactotron"
import { Lnd } from "../services/lnd"

/**
 * The environment is a place where services and shared dependencies between
 * models live.  They are made available to every model via dependency injection.
 */
export class Environment {
  constructor() {
    // create each service
    this.reactotron = new Reactotron()
    this.lnd = new Lnd()
  }

  async setup() {
    // allow each service to setup
    await this.reactotron.setup()
    await this.lnd.setup()
  }

  /**
   * Reactotron is only available in dev.
   */
  reactotron: Reactotron

  /**
   * lnd api.
   */
  lnd: Lnd
}

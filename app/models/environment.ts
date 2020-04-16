import { Reactotron } from "../services/reactotron"

/**
 * The environment is a place where services and shared dependencies between
 * models live.  They are made available to every model via dependency injection.
 */
export class Environment {
  constructor() {
    // create each service
    this.reactotron = new Reactotron()
  }

  async setup() {
    // allow each service to setup
    await this.reactotron.setup()
  }

  /**
   * Reactotron is only available in dev.
   */
  reactotron: Reactotron
}

import { onSnapshot } from "mobx-state-tree"
import { RootStoreModel, RootStore } from "./root-store"
import { Environment } from "../environment"
import * as storage from "../../utils/storage"
import { Onboarding } from "../../utils/enum"

/**
 * The key we'll be saving our state as within async storage.
 */
const ROOT_STATE_STORAGE_KEY = "root"
const ONBOARDING_STORAGE_KEY = "onboarding"

/**
 * Setup the environment that all the models will be sharing.
 *
 * The environment includes other functions that will be picked from some
 * of the models that get created later. This is how we loosly couple things
 * like events between models.
 */
export async function createEnvironment() {
  const env = new Environment()
  await env.setup()
  return env
}

/**
 * Setup the root state.
 */
export async function setupRootStore() {
  let rootStore: RootStore
  let data: any

  // prepare the environment that will be associated with the RootStore.
  const env = await createEnvironment()
  try {
    // load data from storage

    // data = (await storage.load(ROOT_STATE_STORAGE_KEY)) || {}  // TODO: get back to this when store is dynamic
    const { stage } = (await storage.load(ONBOARDING_STORAGE_KEY)) || undefined  // TODO: get back to this when store is dynamic
    // rootStore = RootStoreModel.create(data, env)

    // rootStore = RootStoreModel.create(defaultStoreState, env)
    rootStore = RootStoreModel.create({}, env)
    rootStore.dataStore.onboarding.set(stage) // FIXME there should be a better way to set this up
  } catch (e) {
    // if there's any problems loading, then let's at least fallback to an empty state
    // instead of crashing.
    rootStore = RootStoreModel.create({}, env)

    // but please inform us what happened
    __DEV__ && console.tron.error(e.message, null)
  }

  // reactotron logging
  if (__DEV__) {
    env.reactotron.setRootStore(rootStore, data)
  }

  // track changes & save to storage
  // onSnapshot(rootStore, snapshot => storage.save(ROOT_STATE_STORAGE_KEY, snapshot))
  onSnapshot(rootStore.dataStore.onboarding, snapshot => storage.save(ONBOARDING_STORAGE_KEY, snapshot))

  await env.lnd.setLndStore(rootStore.dataStore.lnd)

  return rootStore
}

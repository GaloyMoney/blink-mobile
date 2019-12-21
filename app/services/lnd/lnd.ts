import { NativeModules, NativeEventEmitter } from 'react-native'
import GrpcAction from "./grpc-mobile"
import IpcAction from "../../ipc"
import LogAction from "../../log"
import { LndStore } from "../../models/data-store/data-store"
import RNKeychain from "./keychain"

import { generateSecureRandom } from 'react-native-securerandom';


/**
 * You'll probably never use the service like this since we hang the Reactotron
 * instance off of `console.tron`. This is only to be consistent with the other
 * services.
 */
export class Lnd {
  grpc: GrpcAction
  ipc: IpcAction
  log: LogAction
  lndStore: LndStore
  keychain: RNKeychain


  /**
   * Create the Reactotron service.
   *
   * @param config the configuration
   */
  constructor() {
    this.grpc = new GrpcAction({} /* FIXME */, NativeModules, NativeEventEmitter);
    this.ipc = new IpcAction(this.grpc);
    this.log = new LogAction({} /* FIXME */, this.ipc, false);

    this.keychain = new RNKeychain()
  }

  /**
   * Configure reactotron based on the the config settings passed in, then connect if we need to.
   */
  async setup() {
    this.grpc.startLnd()
    console.tron.log('lnd started')
  }

  async randomPassword() {
    const password = generateSecureRandom(24)
    console.tron.log('password', password)
    return password
  }

  /**
   * @param lndStore The lnd store
   */
  async setLndStore(lndStore: any) {
    lndStore = lndStore as LndStore // typescript hack
    this.lndStore = lndStore

    const stream = this.grpc.sendStreamCommand('subscribeTransactions');
    try {
      new Promise((resolve, reject) => {
        stream.on('data', () => {
          // try {
            console.tron.log("onData");
            this.lndStore.update_balance(); 
            this.lndStore.update_transactions();
          // } catch (err) {
          //   console.tron.log("err3: ", err)
          // }
        });
        stream.on('end', resolve);
        stream.on('error', reject);
        stream.on('status', status => console.tron.info(`Transactions update: ${status}`));
      }).catch(err => console.tron.error("err1: ", err))
    } catch (err) {
      console.tron.error("err2: ", err)
    }

    console.tron.log("subscribeTransactions init done", this.lndStore)

  }
}
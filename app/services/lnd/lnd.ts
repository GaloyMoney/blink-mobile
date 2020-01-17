import { NativeModules, NativeEventEmitter } from "react-native"
import GrpcAction from "./grpc-mobile"
import IpcAction from "./ipc"
import LogAction from "./log"
import { LndStore } from "../../models/data-store/data-store"
import { poll } from "../../utils/poll"

export class Lnd {
  grpc: GrpcAction
  ipc: IpcAction
  log: LogAction
  lndStore: LndStore | undefined

  /**
   * Create the Reactotron service.
   *
   * @param config the configuration
   */
  constructor() {
    this.grpc = new GrpcAction(NativeModules, NativeEventEmitter)
    this.ipc = new IpcAction(this.grpc)
    this.log = new LogAction(this.ipc, false, false)
  }

  /**
   * @param lndStore The lnd store
   */
  async setLndStore(lndStore: LndStore) {
    this.lndStore = lndStore
  }

  async setCallback() {
    const streamOnChainTransactions = this.grpc.sendStreamCommand("subscribeTransactions")
    const streamInvoices = this.grpc.sendStreamCommand("subscribeInvoices")

    new Promise((resolve, reject) => {
      streamOnChainTransactions.on("data", async data => {
        console.tron.log("onData streamOnChainTransactions", data)
        await this.lndStore.updateBalance()
        await this.lndStore.updateTransactions()
      })
      streamOnChainTransactions.on("end", resolve)
      streamOnChainTransactions.on("error", reject)
      streamOnChainTransactions.on("status", status =>
        console.tron.info(`Transactions update: ${status}`),
      )
    }).catch(err => console.tron.error("err with streamOnChainTransactions", err))

    new Promise((resolve, reject) => {
      streamInvoices.on("data", async invoice => {
        console.tron.log("onData streamInvoices", invoice)
        await this.lndStore.updateInvoice(invoice)
      })
      streamInvoices.on("end", resolve)
      streamInvoices.on("error", reject)
      streamInvoices.on("status", status => console.tron.info(`Transactions update: ${status}`))
    }).catch(err => console.tron.error("err with streamInvoices", err))
  }

  /**
   * Configure reactotron based on the the config settings passed in, then connect if we need to.
   */
  async start() {
    console.trace()

    this.grpc.startLnd()

    await this.setCallback()

    await this.lndStore.initState()

    if (this.lndStore?.walletExist) {
      await this.lndStore.unlockWallet()
    } else {
      await this.lndStore.genSeed()
      await this.lndStore.initWallet()
    }

    poll(() => this.lndStore.getInfo())
  }
}

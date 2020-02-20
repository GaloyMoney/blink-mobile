import { NativeModules, NativeEventEmitter, Alert } from "react-native"
import GrpcAction from "./grpc-mobile"
import IpcAction from "./ipc"
import LogAction from "./log"
import { LndStore } from "../../models/data-store/data-store"
import { poll } from "../../utils/poll"
import RNDeviceInfo from "react-native-device-info"
import RNiCloudStorage from "react-native-icloudstore"

const SCB_KEY = "channel.backup"

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

  get itemKey() {
    return `${this.shortId}_${SCB_KEY}`
  }

  get shortId() {
    return RNDeviceInfo.getUniqueId()
      .replace(/-/g, "")
      .slice(0, 7)
      .toLowerCase()
  }

  async pushChannelBackup(data) {
    console.tron.log("pushChannelBackup", data)
    this.pushToICloud(data)
    // if (this._Platform.OS === 'ios') {
    //   await this.pushToICloud();
    // } else if (this._Platform.OS === 'android') {
    //   console.tron.log("TODO")
    // }
  }

  async pushToICloud({ multiChanBackup }) {
    try {
      await RNiCloudStorage.setItem(this.itemKey, JSON.stringify(multiChanBackup))
    } catch (err) {
      // FIXME probably needs to be registered on iCloud?
      Alert.alert("Syncing data to iCloud failed", err)
      console.tron.error("Uploading channel backup to iCloud failed", err)
    }
  }

  async getBackup() {
    try {
      const backup = await RNiCloudStorage.getItem(this.itemKey)
      console.tron.log("backup: ", backup)
      console.log("backup: ", backup)
    } catch (err) {
      console.tron.error("Error fetching channel backup from iCloud", err)
    }
  }

  async setCallback() {
    const streamOnChainTransactions = this.grpc.sendStreamCommand("subscribeTransactions")
    const streamInvoices = this.grpc.sendStreamCommand("subscribeInvoices")
    const streamChannelBackup = this.grpc.sendStreamCommand("subscribeChannelBackups")
    const streamChannelEvents = this.grpc.sendStreamCommand("subscribeChannelEvents")

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

    new Promise((resolve, reject) => {
      streamChannelBackup.on("data", data => this.pushChannelBackup(data))
      streamChannelBackup.on("error", err => console.tron.error("Channel backup error:", err))
      streamChannelBackup.on("status", status =>
        console.tron.info(`Channel backup status: ${status}`),
      )
    }).catch(err => console.tron.error("err with streamChannelBackup", err))

    new Promise((resolve, reject) => {
      streamChannelEvents.on("data", async data => {
        console.tron.log("streamChannelEvents", data)
        await this.lndStore.updatePendingChannels()
        await this.lndStore.listChannels()
      })
      streamChannelEvents.on("error", err => console.tron.error("streamChannelEvents error:", err))
      streamChannelEvents.on("status", status =>
        console.tron.info(`streamChannelEvents status: ${status}`),
      )
    }).catch(err => console.tron.error("err with streamChannelBackup", err))
  }

  async openWallet() {
    console.tron.log("open Wallet", this.lndStore)
    await this.lndStore.initState()

    console.tron.log("walletExist: ", this.lndStore?.walletExist)
    if (this.lndStore?.walletExist) {
      await this.lndStore.unlockWallet()
    } else {
      await this.lndStore.genSeed()
      await this.lndStore.initWallet()
    }
  }

  /**
   * Configure reactotron based on the the config settings passed in, then connect if we need to.
   */
  async start() {
    console.trace()

    await this.grpc.startLnd()
    await this.lndStore.setLndReady()

    await this.setCallback()

    poll(() => this.lndStore.getInfo())
  }
}

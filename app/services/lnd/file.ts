/**
 * @fileOverview actions wrapping file I/O operations on mobile.
 */

import RNFS from 'react-native-fs'

class FileAction {
  constructor(dataStore) {
    this._FS = RNFS
    this.dataStore = dataStore
  }

  /**
   * Gets the path of the lnd directory where `logs` and `data` are stored.
   * @return {string}
   */
  get lndDir() {
    return this._FS.DocumentDirectoryPath;
  }

  /**
   * Get the path of the app's directory on the device's external storage.
   * @return {string}
   */
  get externalStorageDir() {
    return this._FS.ExternalStorageDirectoryPath;
  }

  //
  // Log file actions
  //

  /**
   * Gets the path of the current network's log file.
   * @return {string}
   */
  get logsPath() {
    return `${this.lndDir}/logs/bitcoin/${this.dataStore.lnd.network}/lnd.log`;
  }

  /**
   * Shares the log file using whatever native share function we have.
   * @return {Promise}
   */
  async shareLogs() {
    try {
    //   await this._Share.open({
    //     url: `file://${this.logsPath}`,
    //     type: 'text/plain',
    //   });
    } catch (err) {
      log.error('Exporting logs failed', err);
    }
  }

  //
  // Wallet DB actions
  //

  /**
   * Delete the wallet.db file. This allows the user to restore their wallet
   * (including channel state) from the seed if they've forgotten the pin.
   * @return {Promise<undefined>}
   */
  async deleteWalletDB() {
    const path = `${this.lndDir}/data/chain/bitcoin/${this.dataStore.lnd.network}/wallet.db`;
    try {
      await this._FS.unlink(path);
    } catch (err) {
      log.info(`No ${this.dataStore.lnd.network} wallet to delete.`);
    }
  }

  /**
   * Delete the wallet.db file. This allows the user to restore their wallet
   * (including channel state) from the seed if they've forgotten the pin.
   * @return {Promise<undefined>}
   */
  async deleteAllLndData() {
    const files = ['tls.cert', 'tls.key', 'logs', 'data']

    for (const file of files) {
        try {
            console.log(`deleting ${this.lndDir}/${file}`)
            await this._FS.unlink(`${this.lndDir}/${file}`);
        } catch (err) {
            log.info(`No ${this.dataStore.lnd.network} wallet to delete.`);
        }
    }}

  //
  // Static Channel Backup (SCB) actions
  //

  get scbPath() {
    return `${this.lndDir}/data/chain/bitcoin/${this.dataStore.lnd.network}/channel.backup`;
  }

  get scbExternalDir() {
    return `${this.externalStorageDir}/Lightning/${this.dataStore.lnd.network}`;
  }

  get scbExternalPath() {
    return `${this.scbExternalDir}/channel.backup`;
  }

  async readSCB() {
    return this._FS.readFile(this.scbPath, 'base64');
  }

  async copySCBToExternalStorage() {
    const exists = await this._FS.exists(this.scbPath);
    if (!exists) return;
    await this._FS.mkdir(this.scbExternalDir);
    await this._FS.copyFile(this.scbPath, this.scbExternalPath);
  }

  async readSCBFromExternalStorage() {
    const exists = await this._FS.exists(this.scbExternalPath);
    if (!exists) return;
    return this._FS.readFile(this.scbExternalPath, 'base64');
  }
}

export default FileAction;
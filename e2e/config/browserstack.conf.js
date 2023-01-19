/* eslint-disable @typescript-eslint/no-var-requires */
const browserstack = require("browserstack-local")
const { baseSpec } = require("./wdio.conf")

let capabilities = {
  "project": "Android Test",
  "build": process.env.BROWSERSTACK_BUILD || "CircleCI Android",
  "name": process.env.BROWSERSTACK_BUILD_VERSION || "CircleCI Automated Build",
  "device": "Google Pixel 3",
  "os_version": "9.0",
  "app": process.env.BROWSERSTACK_APP_ID,
  "browserstack.local": true,
  "browserstack.debug": true,
  "autoGrantPermissions": true,
}
if (process.env.E2E_DEVICE === "ios") {
  capabilities = {
    "project": "ios Test",
    "build": process.env.BROWSERSTACK_BUILD || "CircleCI iOS",
    "name": process.env.BROWSERSTACK_BUILD_VERSION || "CircleCI Automated Build",
    "device": "iPhone 13 Pro",
    "platformVersion": "15.6",
    "os_version": "15.6",
    "app": process.env.BROWSERSTACK_APP_ID,
    "browserstack.local": true,
    "browserstack.debug": true,
    "autoGrantPermissions": true,
  }
}

exports.config = {
  ...baseSpec,
  capabilities: [capabilities],

  user: process.env.BROWSERSTACK_USER || "BROWSERSTACK_USER",
  key: process.env.BROWSERSTACK_ACCESS_KEY || "BROWSERSTACK_ACCESS_KEY",

  updateJob: false,
  logLevel: "info",
  coloredLogs: true,
  screenshotPath: "./errorShots/",
  baseUrl: "",
  waitforTimeout: 10000,
  connectionRetryTimeout: 90000,
  connectionRetryCount: 3,

  // Code to start browserstack local before start of test
  onPrepare: (config, capabilities) => {
    return new Promise((resolve, reject) => {
      exports.bs_local = new browserstack.Local()
      exports.bs_local.start({ key: exports.config.key }, (error) => {
        if (error) return reject(error)
        resolve()
      })
    })
  },

  // Code to stop browserstack local after end of test
  onComplete: (capabilties, specs) => {
    return new Promise((resolve, reject) => {
      exports.bs_local.stop((error) => {
        if (error) return reject(error)
        resolve()
      })
    })
  },
}

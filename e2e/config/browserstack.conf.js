/* eslint-disable @typescript-eslint/no-var-requires */
const browserstack = require("browserstack-local")

exports.config = {
  user: process.env.BROWSERSTACK_USER || "BROWSERSTACK_USER",
  key: process.env.BROWSERSTACK_ACCESS_KEY || "BROWSERSTACK_ACCESS_KEY",

  updateJob: false,
  specs: ["./e2e/**.e2e.spec.ts"],
  reporters: ["spec"],
  exclude: [],

  capabilities: [
    {
      "project": "Android Test",
      "build": "Webdriverio Android Local",
      "name": "local_test",
      "device": "Google Pixel 3",
      "os_version": "9.0",
      "app": process.env.BROWSERSTACK_APP_ID || "bs://<hashed app-id>",
      "browserstack.local": true,
      "browserstack.debug": true,
    },
  ],

  logLevel: "info",
  coloredLogs: true,
  screenshotPath: "./errorShots/",
  baseUrl: "",
  waitforTimeout: 10000,
  connectionRetryTimeout: 90000,
  connectionRetryCount: 3,

  framework: "mocha",
  mochaOpts: {
    ui: "bdd",
    timeout: 20000,
  },

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

  autoCompileOpts: {
    autoCompile: true,
    tsNodeOpts: {
      transpileOnly: true,
      project: "tsconfig.jest.json",
    },
  },
}

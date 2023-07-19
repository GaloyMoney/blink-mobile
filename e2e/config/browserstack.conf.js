// eslint-disable-next-line @typescript-eslint/no-var-requires
const { baseSpec } = require("./wdio.conf")

let capabilities = {
  "project": "Android Test",
  "build": process.env.BROWSERSTACK_BUILD || "CircleCI Android",
  "name": process.env.BROWSERSTACK_BUILD_VERSION || "CircleCI Automated Build",
  "device": "Google Pixel 3",
  "os_version": "9.0",
  "app": process.env.BROWSERSTACK_APP_ID,
  "browserstack.debug": true,
  "browserstack.networkLogs": true,
  "browserstack.networkLogsOptions": {
    captureContent: true,
  },
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
    "browserstack.debug": true,
    "browserstack.networkLogs": true,
    "browserstack.networkLogsOptions": {
      captureContent: true,
    },
    "autoDismissAlerts": true,
  }
}

exports.config = {
  ...baseSpec,
  capabilities: [capabilities],

  appium: {
    version: "2.0.0",
  },

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
}

let capabilities = {
  platformName: "Android",
  deviceName: process.env.TEST_DEVICE_ANDROID || "generic_x86",
  app: "./android/app/build/outputs/apk/debug/app-debug.apk", // "./android/app/release/app-release.apk",
  automationName: "UiAutomator2",
  snapshotMaxDepth: 1000,
}
if (process.env.E2E_DEVICE === "ios") {
  capabilities = {
    platformName: "iOS",
    deviceName: process.env.TEST_DEVICE_IOS || "iPhone 13",
    bundleId: "io.galoy.bitcoinbeach",
    automationName: "XCUITest",
    snapshotMaxDepth: 1000,
  }
}

exports.config = {
  specs: [["./e2e/01**.e2e.spec.ts", "./e2e/02**.e2e.spec.ts"]],
  reporters: ["spec"],
  framework: "mocha",
  mochaOpts: {
    ui: "bdd",
    timeout: 60000,
  },
  exclude: [],
  path: "/wd/hub",
  port: 4723,
  capabilities: [capabilities],
  autoCompileOpts: {
    autoCompile: true,
    tsNodeOpts: {
      transpileOnly: true,
      project: "tsconfig.jest.json",
    },
  },
}

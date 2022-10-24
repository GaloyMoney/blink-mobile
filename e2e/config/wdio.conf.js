let capabilities = {
  platformName: "Android",
  platformVersion: "10",
  deviceName: "Pixel 3 API 29",
  app: "./android/app/build/outputs/apk/debug/app-debug.apk", // "./android/app/release/app-release.apk",
  automationName: "UiAutomator2",
}
if (process.env.E2E_DEVICE === "ios") {
  capabilities = {
    platformName: "iOS",
    platformVersion: "15.4",
    deviceName: "iPhone 13",
    bundleId: "io.galoy.bitcoinbeach",
    automationName: "XCUITest",
  }
}

exports.config = {
  specs: ["./e2e/**.e2e.spec.ts"],
  reporters: ["spec"],
  framework: "mocha",
  mochaOpts: {
    ui: "bdd",
    timeout: 20000,
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

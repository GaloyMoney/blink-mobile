/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  preset: "ts-jest",
  rootDir: "..",
  testMatch: [
    "<rootDir>/detox/01-auth.test.ts",
    "<rootDir>/detox/02-conversion.test.ts",
    "<rootDir>/detox/03-payment-send.test.ts",
    "<rootDir>/detox/04-payment-receive.test.ts",
  ],
  testTimeout: 120000,
  maxWorkers: 1,
  globalSetup: "detox/runners/jest/globalSetup",
  globalTeardown: "detox/runners/jest/globalTeardown",
  reporters: ["detox/runners/jest/reporter"],
  testEnvironment: "detox/runners/jest/testEnvironment",
  verbose: true,
  bail: true,
}

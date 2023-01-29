const browserstack = require('browserstack-local');

exports.config = {
  user: process.env.BROWSERSTACK_USER,
  key: process.env.BROWSERSTACK_ACCESS_KEY,

  updateJob: false,
  specs: ['../../__tests__/browserstack/*.e2e.js'],
  exclude: [],

  capabilities: [{
    project: "First Webdriverio Android Project",
    build: 'Webdriverio Android',
    name: 'first_test',
    device: 'Google Pixel 3',
    os_version: "9.0",
    app: process.env.BROWSERSTACK_APP_ID,
    'browserstack.debug': true
  }],

  appium: {
    version: "2.0.0",
  },

  logLevel: 'info',
  coloredLogs: true,
  screenshotPath: './errorShots/',
  baseUrl: '',
  waitforTimeout: 10000,
  connectionRetryTimeout: 90000,
  connectionRetryCount: 3,

  framework: 'mocha',
  mochaOpts: {
    ui: 'bdd',
    timeout: 2 * 60 * 1000
  },

  onPrepare: (config, capabilities) => {
    return new Promise((resolve, reject) => {
      exports.bs_local = new browserstack.Local();
      exports.bs_local.start({ 'key': exports.config.key }, (error) => {
        if (error) return reject(error);
        resolve();
      });
    });
  },

  onComplete: (capabilities, specs) => {
    return new Promise((resolve, reject) => {
      exports.bs_local.stop((error) => {
        if (error) return reject(error);
        resolve();
      });
    });
  }
};

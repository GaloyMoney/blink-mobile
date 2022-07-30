exports.config = {
  user: process.env.BROWSERSTACK_USER,
  key: process.env.BROWSERSTACK_ACCESS_KEY,

  updateJob: false,
  specs: ['../../__tests__/browserstack/**/*.e2e.js'],
  exclude: [],

  capabilities: [{
    project: "First Webdriverio iOS Project",
    build: 'Webdriverio iOS',
    name: 'single_test',
    device: 'iPhone 11 Pro',
    os_version: "13",
    app: process.env.BROWSERSTACK_APP_ID,
    'browserstack.local': true,
    'browserstack.debug': true
  }],

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

  before: (capabilities, specs, browser) => {
    browser.addCommand('swipe', (from, to) => {
      browser.touchPerform([
        {
          action: "press",
          options: from,
        },
        {
          action: "wait",
          options: { ms: 1000 },
        },
        {
          action: "moveTo",
          options: to,
        },
        {
          action: "release",
          options: to,
        },
      ]);
    });
  }
};
